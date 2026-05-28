import { BackToTop } from "./_components/back-to-top"

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
            {/* Ambient Backgrounds (Top-Left Glow) */}
            <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-blue-50/30 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background" />
            <div className="absolute -top-48 -left-48 w-[800px] h-[800px] pointer-events-none opacity-20 dark:opacity-15 rounded-full bg-blue-500/20 dark:bg-blue-600/10 blur-[130px]" />
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] pointer-events-none opacity-15 dark:opacity-10 rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[100px]" />

            <div className="max-w-4xl mx-auto relative z-10">
                {children}
            </div>

            <BackToTop />
        </div>
    )
}
