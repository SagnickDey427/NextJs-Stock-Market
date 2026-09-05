import React from 'react';
import { getStockDetails } from '@/lib/actions/finnhub.actions';
import UseTradingWidget from '@/components/UseTradingWidget';
import { 
  CANDLE_CHART_WIDGET_CONFIG, 
  BASELINE_WIDGET_CONFIG, 
  TECHNICAL_ANALYSIS_WIDGET_CONFIG, 
  COMPANY_PROFILE_WIDGET_CONFIG, 
  COMPANY_FINANCIALS_WIDGET_CONFIG 
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default async function StockDetailsPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  // Native Data Fetching for Header
  const stockDetails = await getStockDetails(upperSymbol);
  
  if (!stockDetails) {
    throw new Error('Failed to fetch stock details');
  }
  
  const isPositive = (stockDetails.quote.d ?? 0) >= 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Stock Overview Header Card */}
        {stockDetails && (
          <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div className="flex items-center gap-4">
              {stockDetails.profile.logo ? (
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shrink-0">
                  <img src={stockDetails.profile.logo} alt={stockDetails.profile.name} width={50} height={50} className="object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-[#1E293B] rounded-full flex items-center justify-center shrink-0">
                  <TrendingUp className="text-[#94A3B8] w-7 h-7" />
                </div>
              )}
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold uppercase text-white tracking-tight">
                  {stockDetails.profile.name}
                </h1>
                <p className="text-[#94A3B8] text-sm mt-1 font-medium">
                  {upperSymbol} &bull; {stockDetails.profile.exchange}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">${stockDetails.quote.c.toFixed(2)}</span>
                <span className="text-[#94A3B8] font-medium">USD</span>
              </div>
              <div className={`flex items-center gap-1 font-semibold text-lg ${isPositive ? 'text-[#0FEDBE]' : 'text-red-500'}`}>
                {isPositive ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                <span>{Math.abs(stockDetails.quote.d).toFixed(2)}</span>
                <span>({Math.abs(stockDetails.quote.dp).toFixed(2)}%)</span>
              </div>
              <span className="text-[#94A3B8] text-xs uppercase tracking-wider mt-1">Market Status</span>
            </div>
          </div>
        )}

        {/* Key Metrics Strip */}
        {stockDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#141414] border border-[#1E293B] rounded-xl p-4">
            <div className="flex flex-col">
              <span className="text-[#94A3B8] text-xs uppercase font-medium tracking-wider mb-1">Market Cap</span>
              <span className="text-white font-semibold">{stockDetails.metrics.marketCap}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#94A3B8] text-xs uppercase font-medium tracking-wider mb-1">P/E Ratio</span>
              <span className="text-white font-semibold">{stockDetails.metrics.pe !== 'N/A' ? Number(stockDetails.metrics.pe).toFixed(2) : 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#94A3B8] text-xs uppercase font-medium tracking-wider mb-1">Div Yield</span>
              <span className="text-white font-semibold">{stockDetails.metrics.divYield !== 'N/A' ? Number(stockDetails.metrics.divYield).toFixed(2) + '%' : 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#94A3B8] text-xs uppercase font-medium tracking-wider mb-1">EPS (TTM)</span>
              <span className="text-white font-semibold">{stockDetails.metrics.eps !== 'N/A' ? Number(stockDetails.metrics.eps).toFixed(2) : 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Main Candlestick / Advanced Chart Widget */}
        <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-4 overflow-hidden">
          <UseTradingWidget 
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" 
            config={CANDLE_CHART_WIDGET_CONFIG(upperSymbol)} 
            height={600}
          />
        </div>

        {/* Historical Performance / Line Chart Widget */}
        <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-4 overflow-hidden">
          <UseTradingWidget 
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" 
            config={BASELINE_WIDGET_CONFIG(upperSymbol)} 
            height={400}
          />
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Watchlist CTA */}
        <Button className="w-full bg-[#FDD458] hover:bg-[#e5be49] text-black font-bold text-lg h-12 rounded-xl transition-all shadow-md">
          Add to Watchlist
        </Button>

        {/* Technical Analysis Card */}
        <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-4 overflow-hidden">
          <UseTradingWidget 
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js" 
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(upperSymbol)} 
            height={400}
          />
        </div>

        {/* Company Profile Card */}
        <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-4 overflow-hidden">
          <UseTradingWidget 
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js" 
            config={COMPANY_PROFILE_WIDGET_CONFIG(upperSymbol)} 
            height={440}
          />
        </div>

        {/* Financials Breakdown Card */}
        <div className="bg-[#141414] border border-[#1E293B] rounded-xl p-4 overflow-hidden">
          <UseTradingWidget 
            scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-financials.js" 
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(upperSymbol)} 
            height={464}
          />
        </div>

      </div>
    </div>
  );
}

