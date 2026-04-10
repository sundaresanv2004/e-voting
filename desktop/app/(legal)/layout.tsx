"use client"

import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import SetTheme from "@/components/shared/setTheme"
import { HugeiconsIcon } from "@hugeicons/react"
import { Menu01Icon } from "@hugeicons/core-free-icons"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { BackButton } from "@/components/shared/back-button"

const TERMS_SECTIONS = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Eligibility & Accounts" },
    { id: "voting-conduct", title: "3. Voting Conduct" },
    { id: "election-integrity", title: "4. Election Integrity" },
    { id: "termination", title: "5. Termination" },
    { id: "liability", title: "6. Limitation of Liability" },
    { id: "contact", title: "7. Contact Info" },
]

const PRIVACY_SECTIONS = [
    { id: "introduction", title: "1. Introduction" },
    { id: "data-collection", title: "2. Data Collection (OAuth)" },
    { id: "vote-anonymity", title: "3. Vote Anonymity & Security" },
    { id: "data-usage", title: "4. How We Use Data" },
    { id: "data-retention", title: "5. Data Retention" },
    { id: "contact", title: "6. Contact Us" },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isPrivacy = pathname?.includes("privacy")

    const title = isPrivacy ? "Desktop Privacy Policy" : "Desktop Terms of Service"
    const lastUpdated = "April 21, 2026"
    const sections = isPrivacy ? PRIVACY_SECTIONS : TERMS_SECTIONS

    const [activeSection, setActiveSection] = useState("")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const offset = 150
            const scrollPosition = window.scrollY + offset
            let currentSection = sections[0]?.id || ""

            for (const section of sections) {
                const element = document.getElementById(section.id)
                if (element) {
                    if (element.offsetTop <= scrollPosition) {
                        currentSection = section.id
                    }
                }
            }

            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
                currentSection = sections[sections.length - 1]?.id || currentSection
            }

            setActiveSection(currentSection)
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [sections])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            const offset = 140
            const elementPosition = element.getBoundingClientRect().top + window.scrollY
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            })
        }
    }

    const handleSectionClick = (id: string, mobile: boolean = false) => {
        if (mobile) {
            setIsMobileMenuOpen(false)
            setTimeout(() => {
                scrollToSection(id)
            }, 300)
        } else {
            scrollToSection(id)
        }
    }

    const renderTOCItems = (mobile: boolean = false) => (
        <>
            {sections.map((section) => (
                <Button
                    key={section.id}
                    variant="ghost"
                    onClick={() => handleSectionClick(section.id, mobile)}
                    className={cn(
                        "text-sm text-left py-2 px-3 rounded-md transition-all duration-200 border-l-2 w-full justify-start",
                        activeSection === section.id
                            ? "bg-primary/5 border-primary text-primary font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    {section.title}
                </Button>
            ))}
        </>
    )

    return (
        <div className="min-h-screen relative">
            <div className="absolute md:fixed top-4 left-4 z-50">
                <BackButton />
            </div>
            <div className="absolute md:fixed top-4 right-4 z-50">
                <SetTheme />
            </div>

            <div className="fixed inset-0 overflow-hidden -z-10 bg-linear-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                <div
                    className="absolute inset-0 opacity-80 dark:opacity-60 pointer-events-none"
                    style={{
                        maskImage:
                            "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
                    }}
                />

                <div
                    className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60" />

                <div
                    className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-muted-foreground">
                        Effective: {lastUpdated}
                    </p>
                </div>
            </div>

            <div className="lg:hidden">
                <div className="container mx-auto px-4 py-3">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <HugeiconsIcon icon={Menu01Icon} className="mr-2 w-4 h-4" />
                                Table of Contents
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 px-1">
                            <SheetHeader>
                                <SheetTitle>Table of Contents</SheetTitle>
                            </SheetHeader>
                            <nav className="mt-6 flex flex-col gap-1">
                                <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
                                    On this page
                                </div>
                                {renderTOCItems(true)}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex gap-8 relative">
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-10 max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <nav className="space-y-1">
                                <div className="text-xs font-semibold text-muted-foreground mb-3 px-3">
                                    On this page
                                </div>
                                {renderTOCItems(false)}
                            </nav>
                        </div>
                    </aside>

                    <main className="flex-1 max-w-4xl">
                        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none 
                prose-headings:scroll-mt-24 
                prose-h2:text-xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:text-foreground prose-h2:mb-4 prose-h2:mt-12
                prose-h3:text-lg prose-h3:font-semibold prose-h3:text-foreground/90 prose-h3:mt-8
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6
                prose-li:text-muted-foreground prose-li:my-1
                prose-strong:text-foreground prose-strong:font-semibold
                [&>section]:mb-8 [&>section]:scroll-mt-32"
                        >
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
