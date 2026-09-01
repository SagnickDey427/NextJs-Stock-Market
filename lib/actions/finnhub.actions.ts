'use server';

import { getDateRange, validateArticle, formatArticle } from "../utils";

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

export const fetchJSON = async (url: string, revalidateSeconds?: number) => {
    const fetchOptions: RequestInit = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
    try {
        const { to, from } = getDateRange(5);
        const articles: MarketNewsArticle[] = [];

        if (symbols && symbols.length > 0) {
            const cleanedSymbols = symbols.map(s => s.trim().toUpperCase());
            const allCompanyNews: { [symbol: string]: RawNewsArticle[] } = {};
            
            for (const symbol of cleanedSymbols) {
                const url = `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
                const data: RawNewsArticle[] = await fetchJSON(url, 3600);
                allCompanyNews[symbol] = data || [];
            }
            
            const usedIds = new Set<number>();
            
            for (let round = 0; round < 6; round++) {
                if (cleanedSymbols.length === 0) break;
                
                const symbol = cleanedSymbols[round % cleanedSymbols.length];
                const symbolNews = allCompanyNews[symbol] || [];
                
                for (const article of symbolNews) {
                    if (validateArticle(article) && !usedIds.has(article.id)) {
                        articles.push(formatArticle(article, true, symbol, articles.length));
                        usedIds.add(article.id);
                        break;
                    }
                }
            }
            
            articles.sort((a, b) => b.datetime - a.datetime);
            
            if (articles.length > 0) {
                return articles;
            }
        }
        
        // General market news fallback
        const url = `${FINNHUB_BASE_URL}/news?category=general&token=${NEXT_PUBLIC_FINNHUB_API_KEY}`;
        const data: RawNewsArticle[] = await fetchJSON(url, 3600);
        
        const uniqueNews: RawNewsArticle[] = [];
        const seenIds = new Set<number>();
        const seenUrls = new Set<string>();
        const seenHeadlines = new Set<string>();
        
        if (data && Array.isArray(data)) {
            for (const item of data) {
                if (!seenIds.has(item.id) && (!item.url || !seenUrls.has(item.url)) && (!item.headline || !seenHeadlines.has(item.headline))) {
                    seenIds.add(item.id);
                    if (item.url) seenUrls.add(item.url);
                    if (item.headline) seenHeadlines.add(item.headline);
                    uniqueNews.push(item);
                }
            }
        }
        
        let count = 0;
        for (const article of uniqueNews) {
            if (validateArticle(article)) {
                articles.push(formatArticle(article, false, undefined, count));
                count++;
            }
            if (count >= 6) break;
        }
        
        return articles;
        
    } catch (e) {
        console.error(e);
        throw new Error("Failed to fetch news");
    }
}

