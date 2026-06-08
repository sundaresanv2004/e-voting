import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";

export default function Page() {
    return (
        <div className="flex flex-col">
            <Hero />
            <About />
        </div>
    );
}
