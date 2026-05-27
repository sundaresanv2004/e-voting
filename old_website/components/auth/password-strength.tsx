"use client"

import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    if (!password || password.length === 0) {
        return null
    }

    const getStrength = (pass: string) => {
        let score = 0
        if (pass.length >= 8) score += 1
        if (/[A-Z]/.test(pass)) score += 1
        if (/[0-9]/.test(pass)) score += 1
        if (/[^a-zA-Z0-9]/.test(pass)) score += 1
        return score
    }

    const score = getStrength(password)

    const getColorClass = (s: number) => {
        if (s <= 1) return "bg-red-500"
        if (s === 2) return "bg-orange-500"
        if (s === 3) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getLabel = (s: number) => {
        if (s <= 1) return "Weak"
        if (s === 2) return "Fair"
        if (s === 3) return "Good"
        return "Strong"
    }

    const activeColor = getColorClass(score)

    return (
        <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-300 px-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden"
                    >
                        <div
                            className={cn(
                                "h-full w-full transition-all duration-300",
                                score >= level ? activeColor : "opacity-0"
                            )}
                        />
                    </div>
                ))}
            </div>


            <p className={cn(
                "text-xs font-medium text-right transition-colors duration-300",
                score <= 1 ? "text-red-500" :
                    score === 2 ? "text-orange-500" :
                        score === 3 ? "text-yellow-500" : "text-green-500"
            )}>
                {getLabel(score)}
            </p>
        </div>
    )
}
