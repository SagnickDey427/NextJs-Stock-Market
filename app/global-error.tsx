'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Global Error Caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black antialiased">
        <div className="min-h-[75vh] flex items-center justify-center p-4 relative overflow-hidden">
          
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* Main Error Card */}
          <div className="relative bg-zinc-950/70 border border-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            
            {/* Refined Icon Badge */}
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5 inline-flex items-center justify-center">
              <AlertCircle className="w-7 h-7" strokeWidth={1.75} />
            </div>
            
            {/* Typography */}
            <h2 className="text-xl font-semibold text-white tracking-tight mb-2">
              Unable to Load Market Data
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              We encountered an issue communicating with the financial data provider. This may be due to rate limits, market connectivity, or restricted symbols.
            </p>

            {/* Reference Hash */}
            {error.digest && (
              <div className="mb-6 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-500">
                Ref: {error.digest}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
              <Button 
                onClick={() => router.back()}
                variant="outline"
                className="flex-1 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl h-10 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => reset()}
                className="flex-1 bg-[#FDD458] hover:bg-[#ebd06b] text-zinc-950 font-semibold rounded-xl h-10 text-sm shadow-sm transition-colors"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}

