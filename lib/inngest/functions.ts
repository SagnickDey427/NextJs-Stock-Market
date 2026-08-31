import { sendWelcomeEmail } from "../nodemailer";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";

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