/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { cache } from "react";
import { POPULAR_STOCK_SYMBOLS } from "../constants";
import { getDateRange, validateArticle, formatArticle } from "../utils";

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// export const fetchJSON = async <T = any>(url: string, revalidateSeconds?: number) => {
//     const fetchOptions: RequestInit = revalidateSeconds
//         ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
//         : { cache: 'no-store' };

//     const response = await fetch(url, fetchOptions);
//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return response.json();
// }

export async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
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

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      // If no token, log and return empty to avoid throwing per requirements
      console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
      return [];
    }

    const trimmed = typeof query === 'string' ? query.trim() : '';

    let results: FinnhubSearchResult[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
            // Revalidate every hour
            const profile = await fetchJSON<any>(url, 3600);
            return { sym, profile } as { sym: string; profile: any };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null } as { sym: string; profile: any };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name: string | undefined = profile?.name || profile?.ticker || undefined;
          const exchange: string | undefined = profile?.exchange || undefined;
          if (!name) return undefined;
          const r: FinnhubSearchResult = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
          };
          // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
          // To keep pipeline simple, attach exchange via closure map stage
          // We'll reconstruct exchange when mapping to final type
          (r as any).__exchange = exchange; // internal only
          return r;
        })
        .filter((x): x is FinnhubSearchResult => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = (r as any).__exchange as string | undefined;
        const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
        const type = r.type || 'Stock';
        const item: StockWithWatchlistStatus = {
          symbol: upper,
          name,
          exchange,
          type,
          isInWatchlist: false,
        };
        return item;
      })
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
});