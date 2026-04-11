"use client"

import { Settings02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface ElectionSettingsHeroProps {
  title: string
  subtitle: string
  className?: string
}

export default function ElectionSettingsHero({ 
  title, 
  subtitle,
  className 
}: ElectionSettingsHeroProps) {
  return (
    <div className={cn(
      "w-full bg-indigo-600 dark:bg-indigo-500/20 px-8 py-10 relative overflow-hidden",
      className
    )}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <HugeiconsIcon icon={Settings02Icon} size={180} />
      </div>
      
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-2 text-indigo-100 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px] opacity-80 mb-2">
          <div className="p-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
            <HugeiconsIcon icon={Settings02Icon} className="w-4 h-4" />
          </div>
          Management Console
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-white dark:text-indigo-100 drop-shadow-sm">
          {title}
        </h1>
        
        <p className="text-indigo-100/70 dark:text-indigo-300/60 font-medium text-sm max-w-2xl leading-relaxed">
          Administering: <span className="text-white dark:text-indigo-200 font-bold">{subtitle}</span>
        </p>
      </div>
      
      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
