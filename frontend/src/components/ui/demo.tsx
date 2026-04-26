import * as React from "react"
import { LiquidButton } from "./liquid-glass-button"; // Fixed path from @/components/ui...

export default function DemoOne() {
  return (
    <> 
      <div className="relative h-[200px] w-full mt-4 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-8 bg-zinc-50"> 
        <LiquidButton className="top-1/2 left-1/2 z-10 w-64 h-16">
          Liquid Glass
        </LiquidButton> 
      </div>
    </>
  )
}