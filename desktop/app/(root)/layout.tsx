import { ReactNode } from "react";
import SetTheme from "@/components/shared/setTheme";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                <SetTheme />
            </div>
            {children}
        </div>
    );
}
