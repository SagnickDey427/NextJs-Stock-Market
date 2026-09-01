import { getAllUsersForNewsMail } from "../actions/user.actions";
import { sendWelcomeEmail, sendDailyNewsSummaryEmail } from "../nodemailer";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "./prompts";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";

export const sendSignupEmail = inngest.createFunction(
    {
        id:'sign-in-email',
        triggers: {event:'app/user.created'}
    },
    async ({event ,step , runId})=>{
        const userProfile = `
            - Country : ${event.data.country}
            - Investment goals : ${event.data.investmentGoals}
            - Risk tolerance : ${event.data.riskTolerance}
            - Preferred industry : ${event.data.preferredIndustry}
        `
        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}",userProfile);

        const response = await step.ai.infer('generate welcome intro',{
            model:step.ai.models.gemini({model:'gemini-2.5-flash'}),
            body:{
                contents:[
                    {
                        role:'user',
                        parts:[
                            {
                                text:prompt
                            }
                        ]
                    }
                ]
            }
        })

        await step.run('send-welcome-email',async ()=>{
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining Signalist . You now have access to tools to track markets and make smarter decisions'
            const {data:{email,name}} = event;
            return await sendWelcomeEmail({email,name,intro:introText})
        })
        return {
            success:true,
            message:"Welcome message sent successfully"
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    {
        id:'daily-news-summary',
        triggers:[
            {event:'app/send.daily.news'},
            {cron:'0 12 * * *'}
        ]
    },
    async ({step})=>{
        // Step 1: get all users (getAllUsersForNewsMail)
        const users = await step.run('get-all-users', getAllUsersForNewsMail);
        if(!users || users.length === 0) return {success:false, message: "No users found for daily newsletter"};
        
        // Step 2: Create a wrapper function around it and collect the news for each user
        const userNewsData = await step.run('fetch-all-news', async () => {
            const data: { user: User; newsArticles: MarketNewsArticle[] }[] = [];
            for (const user of users) {
                const symbols = await getWatchlistSymbolsByEmail(user.email);
                const news = await getNews(symbols);
                data.push({ user, newsArticles: news });
            }
            return data;
        });

        // Step 3: Summarise news for all users
        const summarizedNewsArray: { user: User; newscontent: string | null }[] = [];
        
        for (const item of userNewsData) {
            const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", JSON.stringify(item.newsArticles));
            
            const response = await step.ai.infer(`summarise-news-${item.user.email}`, {
                model: step.ai.models.gemini({ model: 'gemini-2.5-flash' }),
                body: {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ]
                }
            });
            
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const summaryText = part && 'text' in part ? part.text : null;
            
            summarizedNewsArray.push({
                user: item.user,
                newscontent: summaryText
            });
        }
        
        // Step 4: Send the emails to each user
        for (const item of summarizedNewsArray) {
            if (item.newscontent) {
                await step.run(`send-news-email-${item.user.email}`, async () => {
                    await sendDailyNewsSummaryEmail(item.user.email, item.newscontent!);
                });
            }
        }
        
        return { success: true, message: "Daily news letter sent to users" };
    }
)