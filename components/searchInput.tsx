/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TrendingUp, Star, Loader2, AlertCircle } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputProps {
  showSearch: boolean;
  setShowSearch: (open: boolean) => void;
}

export default function SearchInput({ showSearch, setShowSearch }: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryRef = useRef(query);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(queryRef.current)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useDebounce(fetchResults, 500);

  useEffect(() => {
    if (showSearch) {
      debouncedFetch();
    }
  }, [query, debouncedFetch, showSearch]);

  const isFavorite = (item: any) => item.isInWatchlist;

  return (
    <CommandDialog 
      open={showSearch} 
      onOpenChange={setShowSearch}
      className="bg-[#000000] text-[#FFFFFF] font-sans border-[#1E293B] [&_[data-slot=command-input-wrapper]]:bg-[#1E293B]/30 [&_[data-slot=command-input-wrapper]_div]:bg-transparent"
    >
      <div className="text-white text-lg font-semibold px-4 pt-4 pb-2">
        {query.trim() === '' ? 'Popular Stocks' : 'Search Results'}
      </div>
      
      <CommandInput 
        placeholder="Type a stock symbol or company name..." 
        className="h-12 text-[#FFFFFF] placeholder:text-[#94A3B8]"
        value={query}
        onValueChange={setQuery}
      />
      
      <CommandList>
        {loading && (
          <div className="p-4 flex items-center justify-center text-[#94A3B8]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        )}
        
        {!loading && error && (
          <div className="p-4 flex items-center justify-center text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && results.length === 0 && query.trim() !== '' && (
          <CommandEmpty className="text-[#94A3B8]">No results found.</CommandEmpty>
        )}

        {!loading && !error && results.length > 0 && (
          <CommandGroup heading="Suggestions" className="text-[#94A3B8]">
            {results.map((item, index) => {
              const uniqueIdentifier = `${item.symbol}-${item.name}-${index}`;
              
              return (
                <CommandItem 
                  key={uniqueIdentifier} 
                  value={uniqueIdentifier}
                  className="p-4 flex items-center gap-3 rounded-lg hover:bg-[#1E293B]/50 data-[selected=true]:bg-[#1E293B]/50 text-[#FFFFFF]"
                >
                  <TrendingUp className="text-[#94A3B8] w-5 h-5 shrink-0" />
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-[#FFFFFF]">{item.symbol}</span>
                    <span className="text-sm text-[#94A3B8]">
                      {item.name} &bull; {item.type}
                    </span>
                  </div>
                  <Star 
                    className={`w-5 h-5 shrink-0 ${isFavorite(item) ? 'fill-[#FDD458] text-[#FDD458]' : 'text-[#94A3B8]'}`} 
                  />
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}