import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-950">
            <div className="flex flex-col items-center gap-4">
                <Spinner className="size-12 text-primary" />
                <p className="text-md text-muted-foreground font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    )
}
