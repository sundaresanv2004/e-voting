import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import Link from 'next/link';

export default function NoAccessPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="border border-dashed rounded-lg max-w-2xl w-full">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className='bg-primary'>
              <HugeiconsIcon icon={Archive01Icon} strokeWidth={2} className="w-6 h-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No Assigned Elections</EmptyTitle>
            <EmptyDescription>
              You do not currently have access to any active elections. If you believe this is an error, please contact your Organization Administrator.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
