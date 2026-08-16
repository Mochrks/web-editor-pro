"use client";

import { History, Cpu } from "lucide-react";
import { useStore } from "@/store/useStore";

export function StatusBar() {
  const feedbackMsg = useStore((s) => s.feedbackMsg);

  return (
    <footer className="h-6 bg-[#050a0a] border-t border-white/5 flex items-center justify-between px-3 shrink-0 select-none overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-primary animate-pulse tracking-widest min-w-[120px]">
            {feedbackMsg ? `> ${feedbackMsg}` : "SYSTEM ACTIVE"}
          </span>
          {!feedbackMsg && (
            <div className="flex-1 max-w-[200px] h-1 bg-black/60 rounded-full overflow-hidden border border-border flex items-center">
              <div className="w-full h-full p-px">
                <div className="w-3/4 h-full bg-gradient-to-r from-primary/20 to-primary shadow-[0_0_10px_var(--primary)] animate-[pulse_1.5s_infinite]"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-[9px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          <span className="uppercase tracking-tight">
            Render Engine: GPU Accelerated
          </span>
        </div>
        <span className="opacity-50">|</span>
        <span className="uppercase tracking-tight">4K UHD @ 23.976 FPS</span>
        <span className="opacity-50">|</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <History className="w-3 h-3 text-primary/60" />
          <span className="uppercase tracking-tight">Auto-saved 2m ago</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 opacity-50" />
          <span className="uppercase tracking-tight">Buffer: 92%</span>
        </div>
      </div>
    </footer>
  );
}
