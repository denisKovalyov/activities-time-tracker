import { useTransition } from 'react';
import { User } from '@phosphor-icons/react';

import { DialogWrapper } from '@/ui/common/dialog';
import { Button } from '@/ui/common/button';
import { deleteUserData } from '@/lib/actions/auth/delete-user-data';
import { signOut } from '@/lib/actions/auth/sign-out';
import { toast } from '@/ui/hooks/use-toast';

export const RemoveAccountDialog = ({
  show,
  onOpenChange,
}: {
  show: boolean;
  onOpenChange: () => void;
}) => {
  // Pending until the user is signed out
  const [isLoading, startTransition] = useTransition();

  const handleConfirm = () =>
    startTransition(async () => {
      const result = await deleteUserData();

      const hasError = 'message' in result;

      toast({
        title: hasError ? result.message : 'Account was successfully removed!',
        variant: hasError ? 'destructive' : 'success',
      });

      if (!hasError) {
        const result = await signOut();

        if (result?.message) {
          toast({
            title: result.message,
            variant: 'destructive',
          });
        }
      }
    });

  return (
    <DialogWrapper
      show={show}
      onOpenChange={onOpenChange}
      header={
        <span className="prose-xl flex items-center justify-center text-primary">
          Delete Account
          <User size={18} weight="bold" className="ml-2" />
        </span>
      }
      fullScreenMobile={false}
      content={
        <div className="text-center">
          Are you sure want to remove the account along with all related data?
        </div>
      }
      footer={
        <div className="flex w-full justify-end">
          <Button variant="outline" onClick={onOpenChange}>
            Cancel
          </Button>
          <Button className="ml-2" loading={isLoading} onClick={handleConfirm}>
            Ok
          </Button>
        </div>
      }
    />
  );
};
