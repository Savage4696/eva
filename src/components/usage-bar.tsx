'use client';

import { Progress } from "@/components/ui/progress";
import { useUsageLimit } from "@/hooks/use-usage-limit";
import { Zap, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function UsageBar() {
  const { count, limit, mounted } = useUsageLimit();

  if (!mounted) return <div className="h-10 w-full" />;

  const percentage = (count / limit) * 100;
  const isHigh = percentage > 80;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 space-y-3 p-4 rounded-xl bg-secondary/20 border border-primary/5">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Zap className="h-4 w-4 text-primary" />
          <span>Daily Usage</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={isHigh ? "text-destructive font-bold" : "text-muted-foreground"}>
            {count} / {limit} requests
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>To ensure fair access during this preview, Eva AI limits requests to {limit} per day. Usage resets every 24 hours.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex gap-4 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold justify-center">
        <span>• Multimodal reasoning</span>
        <span>• Neural TTS</span>
        <span>• Live Transcription</span>
        <span>• Web Research</span>
      </div>
    </div>
  );
}
