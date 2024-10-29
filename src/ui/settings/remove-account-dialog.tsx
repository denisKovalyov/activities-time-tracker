import { useEffect, useState } from 'react';
import { User } from '@phosphor-icons/react';

import { DialogWrapper } from '@/ui/common/dialog';
import { Button } from '@/ui/common/button';
import { deleteUserData } from '@/lib/actions/auth/delete-user-data';
import { signOut } from '@/lib/actions/auth/sign-out';
import { useSession } from 'next-auth/react';
import { useToast } from '@/ui/hooks/use-toast';

export const RemoveAccountDialog = ({
  show,
  onOpenChange,
}: {
  show: boolean;
  onOpenChange: () => void,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (show) setIsLoading(false);
  }, [show]);

  const handleConfirm = async () => {
    setIsLoading(true);

    const result = await deleteUserData(session?.user?.id!);

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
  };

  return (
    <DialogWrapper
      show={show}
      onOpenChange={onOpenChange}
      header={
        <span className="prose-xl flex justify-center items-center text-primary">
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
          <Button
            variant="outline"
            onClick={onOpenChange}
          >
            Cancel
          </Button>
          <Button
            className="ml-2"
            loading={isLoading}
            onClick={handleConfirm}
          >
            Ok
          </Button>
        </div>
      }
    />
  );
};
