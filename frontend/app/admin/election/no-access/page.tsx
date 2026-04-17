import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import Link from 'next/link';

export default function NoAccessPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="border border-dashed rounded-2xl max-w-4xl w-full">
        <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <HugeiconsIcon icon={Archive01Icon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">No elections yet</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            You do not currently have access to any active elections. If you believe this is an error, please contact your Organization Administrator.
          </p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
