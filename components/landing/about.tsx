import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldKeyIcon, UserSquareIcon, Agreement01Icon, AnalyticsUpIcon } from "@hugeicons/core-free-icons";

export function About() {
  return (
    <section className="relative py-20 bg-linear-to-b from-background via-blue-50/10 to-background dark:via-blue-950/5 border-t border-border/40">
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            About E-Voting
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            A secure, modern, and transparent platform designed to streamline elections and voting processes for organizations, universities, and schools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Card 1: Core Purpose */}
          <div className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={2} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Purpose & Functionality
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                E-Voting replaces outdated paper-based and manual voting procedures with an interactive digital system. Organizers can create detailed elections, define candidates, and securely invite voters. Voters can easily access and cast their ballots electronically, ensuring immediate, verified results.
              </p>
            </div>
          </div>

          {/* Card 2: Google Sign-In Explanation */}
          <div className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={UserSquareIcon} strokeWidth={2} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Secure Authentication & Identity
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We integrate with Google Sign-In to offer a seamless and highly secure login experience. By leveraging Google's identity verification, we verify that each voter corresponds to a unique and authorized individual within the organization. This prevents double-voting and ballot tampering.
              </p>
            </div>
          </div>

          {/* Card 3: Data Usage & Privacy */}
          <div className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={Agreement01Icon} strokeWidth={2} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                How We Use Google Data
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                To identify you in the system, E-Voting requests basic profile information (specifically your email, name, and profile picture). We use your email to match you to eligible voter rosters created by election administrators. We never share, sell, or use your personal data for advertising or tracking.
              </p>
            </div>
          </div>

          {/* Card 4: Auditable & Transparent */}
          <div className="flex gap-4 p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xs">
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <HugeiconsIcon icon={AnalyticsUpIcon} strokeWidth={2} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                Real-Time Auditing
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our platform provides clean, real-time analytics to election administrators while maintaining voter confidentiality. Once the voting period ends, results are instantly calculated and published, providing complete transparency and auditability for all participants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
