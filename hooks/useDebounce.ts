'use client';

import { useCallback, useRef } from "react";

export const useDebounce = (calback :()=>void, delay:number)=>{
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(()=>{
        if(timeoutRef.current){
            clearInterval(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(calback,delay);

    },[calback,delay]);
}