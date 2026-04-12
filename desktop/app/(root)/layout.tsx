import { ReactNode } from "react";
import { RootHeader } from "./header";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <RootHeader />
            {children}
        </div>
    );
}
