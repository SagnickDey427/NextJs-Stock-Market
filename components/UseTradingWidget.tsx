"use client"

import useTradingViewWidgetHook from '@/hooks/useTradingViewWidgetHook';
import { cn } from '@/lib/utils';
// TradingViewWidget.jsx
import React, { memo } from 'react';

interface TradingViewWidgetProps {
    title?: string;
    scriptUrl: string;
    config: Record<string, unknown>;
    className?: string;
    height?: number;
}

function TradingViewWidget({ title, scriptUrl, config, className, height = 600 }: TradingViewWidgetProps) {
    const container = useTradingViewWidgetHook(scriptUrl, config, height);
    return (
        <div className='w-full'>
            {title && <h3 className='font-semibold text-2xl text-gray-400 mb-3'>{title}</h3>}
            <div className={cn("tradingview-widget-container", className)} ref={container}>
                <div className="tradingview-widget-container__widget" style={{ height, width: "100%" }} />
            </div>
        </div>
    );
}

export default memo(TradingViewWidget);
