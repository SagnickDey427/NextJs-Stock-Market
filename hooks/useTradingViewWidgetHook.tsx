"use client"
import { useRef, useEffect } from 'react'

function useTradingViewWidgetHook(scriptUrl: string, config: Record<string, unknown>, height = 600) {
    const container = useRef<HTMLDivElement | null>(null);
    useEffect(
        () => {
            if (!container.current) return;
            if (container.current.dataset.loaded) return;
            container.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width:100%; height:${height}px;"></div>`
            const script = document.createElement("script");
            script.src = scriptUrl;
            script.async = true;
            script.innerHTML = JSON.stringify(config);
            container.current.appendChild(script);
            container.current.dataset.loaded = 'true';
            return ()=>{
                if(container.current){
                    container.current.innerHTML='';
                    delete container.current.dataset.loaded;
                }
            }
        },
        [scriptUrl, config, height]
    );
    return container;

}

export default useTradingViewWidgetHook