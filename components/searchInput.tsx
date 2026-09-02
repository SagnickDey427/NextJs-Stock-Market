'use client';
import React, { useState } from 'react';
import { TrendingUp, Star } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SearchInputProps {
  showSearch: boolean;
  setShowSearch: (open: boolean) => void;
}

export default function SearchInput({ showSearch, setShowSearch }: SearchInputProps) {
  const [results, setResults] = useState<StockSearchResults[]>([
    {
      description: 'APPLE INC',
      displaySymbol: 'AAPL',
      symbol: 'AAPL',
      type: 'Common Stock'
    },
    {
      description: 'TESLA INC',
      displaySymbol: 'TSLA',
      symbol: 'TSLA',
      type: 'Common Stock'
    },
    {
      description: 'MICROSOFT CORP',
      displaySymbol: 'MSFT',
      symbol: 'MSFT',
      type: 'Common Stock'
    }
  ]);

  const isFavorite = (symbol: string) => symbol === 'AAPL';

  return (
    <CommandDialog 
      open={showSearch} 
      onOpenChange={setShowSearch}
      className="bg-[#000000] text-[#FFFFFF] font-sans border-[#1E293B] [&_[data-slot=command-input-wrapper]]:bg-[#1E293B]/30 [&_[data-slot=command-input-wrapper]_div]:bg-transparent"
    >
      <div className="text-white text-lg font-semibold px-4 pt-4 pb-2">
        Popular Stocks (10)
      </div>
      
      <CommandInput 
        placeholder="Type a stock symbol or company name..." 
        className="h-12 text-[#FFFFFF] placeholder:text-[#94A3B8]"
      />
      
      <CommandList>
        <CommandEmpty className="text-[#94A3B8]">No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions" className="text-[#94A3B8]">
          {results.map((item) => (
            <CommandItem 
              key={item.symbol} 
              value={item.symbol}
              className="p-4 flex items-center gap-3 rounded-lg hover:bg-[#1E293B]/50 data-[selected=true]:bg-[#1E293B]/50 text-[#FFFFFF]"
            >
              <TrendingUp className="text-[#94A3B8] w-5 h-5 shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="font-bold text-[#FFFFFF]">{item.displaySymbol}</span>
                <span className="text-sm text-[#94A3B8]">
                  {item.description} &bull; {item.type}
                </span>
              </div>
              <Star 
                className={`w-5 h-5 shrink-0 ${isFavorite(item.symbol) ? 'fill-[#FDD458] text-[#FDD458]' : 'text-[#94A3B8]'}`} 
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}