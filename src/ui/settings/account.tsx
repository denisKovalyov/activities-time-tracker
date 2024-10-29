import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle, Trash } from '@phosphor-icons/react';
import { useMediaQuery } from 'usehooks-ts';

import { Button } from '@/ui/common/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/ui/common/card';
import { RemoveAccountDialog } from '@/ui/settings/remove-account-dialog';
import { formatReadableDate } from '@/lib/utils';
import { User } from '@/lib/definitions';

const SUB_TITLE = 'Make changes to your account';
const paramNameStyle = 'min-w-28 text-muted-foreground';

export const Account = () => {
  const [showRemoveAccountDialog, setShowRemoveAccountDialog] = useState(false);

  const { data: session } = useSession();
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const user = session?.user as User;
  const handleDialogOpenClose = () => setShowRemoveAccountDialog((state) => !state);

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>{SUB_TITLE}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm sm:text-base">
          <div className="flex mb-4">
            <span className={`flex items-center ${paramNameStyle}`}>
              <span>Email</span>
              {user?.email_verified ? <CheckCircle className="w-4 h-4 ml-1 text-success" weight="bold"/> : null}
            </span>
            <span className="px-4 truncate">{user?.email}</span>
          </div>

          <div className="flex mb-4">
            <span className={paramNameStyle}>Created At</span>
            <span className="px-4 truncate">
              {user?.created_at
                ? formatReadableDate(new Date(user.created_at!), { dateStyle: isDesktop ? 'long' : 'medium' })
                : ''}
            </span>
          </div>

          <div className="flex">
            <span className={paramNameStyle}>Updated At</span>
            <span className="px-4 truncate">
              {user?.updated_at
                ? formatReadableDate(new Date(user.updated_at!), { dateStyle: isDesktop ? 'long' : 'medium' })
                : ''}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDialogOpenClose}
          >
            <span className="mr-1.5">Delete Account</span>
            <Trash size="14" />
          </Button>
        </CardFooter>
      </Card>

      <RemoveAccountDialog
        show={showRemoveAccountDialog}
        onOpenChange={handleDialogOpenClose}
      />
    </>
  )
};
