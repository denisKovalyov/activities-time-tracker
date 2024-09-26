'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DialogWrapper } from '@/ui/common/dialog';
import { Button } from '@/ui/common/button';

export const AddActivityDialog = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const showDialog = Boolean(searchParams.get('addNew'));

  const redirect = () => router.push(pathname);

  return (
    <DialogWrapper
      show={showDialog}
      onOpenChange={redirect}
      header="Add Activity"
      subheader="Add New Activity To Your Dashboard"
      content={<div>test</div>}
      footer={(
        <Button onClick={redirect}>
          Add Activity
        </Button>
      )}
    />
  );
}
