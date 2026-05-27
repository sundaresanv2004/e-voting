import { ReactNode } from "react";
import { Navbar } from "@/components/landing/navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <Navbar />
            {children}
        </div>
    );
}
