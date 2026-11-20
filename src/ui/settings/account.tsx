import { useState } from 'react';
import { CheckCircle, Trash } from '@phosphor-icons/react';

import { Button } from '@/ui/common/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/ui/common/card';
import { RemoveAccountDialog } from '@/ui/settings/remove-account-dialog';
import { type Day, formatReadableDate } from '@/lib/utils/day';
import { AccountDetails } from '@/ui/settings/types';

const SUB_TITLE = 'Make changes to your account';
const paramNameStyle = 'min-w-28 text-muted-foreground';

// Both formats are rendered and CSS shows one, so the server and the client
// render the same HTML
const ReadableDay = ({ day }: { day: Day }) => (
  <>
    <span className="sm:hidden">{formatReadableDate(day)}</span>
    <span className="hidden sm:inline">{formatReadableDate(day, 'long')}</span>
  </>
);

export const Account = ({ account: user }: { account?: AccountDetails }) => {
  const [showRemoveAccountDialog, setShowRemoveAccountDialog] = useState(false);

  const handleDialogOpenClose = () =>
    setShowRemoveAccountDialog((state) => !state);

  return (
    <>
      <Card>
        <CardHeader>
          <CardDescription>{SUB_TITLE}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm sm:text-base">
          <div className="mb-4 flex">
            <span className={`flex items-center ${paramNameStyle}`}>
              <span>Email</span>
              {user?.email_verified ? (
                <CheckCircle
                  className="ml-1 h-4 w-4 text-success"
                  weight="bold"
                />
              ) : null}
            </span>
            <span className="truncate px-4">{user?.email}</span>
          </div>

          <div className="mb-4 flex">
            <span className={paramNameStyle}>Created At</span>
            <span className="truncate px-4">
              {user && <ReadableDay day={user.createdDay} />}
            </span>
          </div>

          <div className="flex">
            <span className={paramNameStyle}>Updated At</span>
            <span className="truncate px-4">
              {user && <ReadableDay day={user.updatedDay} />}
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
  );
};
