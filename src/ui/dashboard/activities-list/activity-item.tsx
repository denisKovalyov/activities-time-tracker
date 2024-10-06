import { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';
import { useSession } from 'next-auth/react';
import { X, NotePencil } from '@phosphor-icons/react';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { cn } from '@/lib/utils';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-dropdown-menu';
import { Button } from '@/ui/common/button';
import { RemoveActivityDialog } from '@/ui/dashboard/activities-list/remove-activity-dialog';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { deleteActivity } from '@/lib/actions/activity';
import { useToast } from '@/ui/hooks/use-toast';
import { revalidateActivities } from '@/lib/actions/activity/revalidation';

const BUTTONS_WIDTH = 110;
const buttonClassNames = 'h-auto px-3 rounded-none shadow-none dark:border-y dark:border-r';

export const ActivityItem = ({
  activity,
  swiped,
  onSwipe,
  onCancelSwipe,
}: {
  activity: ActivityExtended;
  swiped: boolean;
  onSwipe: (id: string) => void;
  onCancelSwipe: () => void;
}) => {
  const [shift, setShift] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (swiped) setShift(-BUTTONS_WIDTH);
  }, [swiped]);

  const { data: session } = useSession();
  const { toast } = useToast();

  const {
    id,
    name,
    color,
    icon,
    timeSpent,
  } = activity;

  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipe(id),
    onSwipedRight: () => {
      if (swiped) onCancelSwipe();
    },
    onSwiping: (e) => {
      if (!isSwiping) setIsSwiping(true);

      if (e.dir === 'Left' && Math.abs(shift) <= BUTTONS_WIDTH) setShift(e.deltaX < -BUTTONS_WIDTH ? -BUTTONS_WIDTH : e.deltaX);
      if (e.dir === 'Right') setShift((shift) => {
        const delta = shift + e.absX;
        return delta > 0 ? 0 : delta;
      });
    },
    onSwiped: () => {
      if (isSwiping) setIsSwiping(false);
    }
  });

  const totalTimeSpent = useCalculateTimeValues(timeSpent);

  const handleClickOutsideButtons = () => {
    setShift(0);
    if (swiped) onCancelSwipe();
  };

  useOnClickOutside(ref, handleClickOutsideButtons, 'touchstart');

  const handleDialogOpenChange = () => setShowRemoveDialog((state) => !state);

  const removeActivity = async () => {
    setIsLoading(true);

    const result = await deleteActivity(session?.user?.id!, id);
    if (result.success) void revalidateActivities();

    toast({
      title: result?.message || 'Activity was successfully removed!',
      variant: result?.message ? 'destructive' : 'success',
    });

    setIsLoading(false);
    setShowRemoveDialog(false);
  };

  return (
    <>
      <div
        className={cn('w-full mb-4 will-change-transform transition-transform duration-200 ease-in-out', {
          'duration-0': isSwiping,
        })}
        style={{ 'transform': `translateX(${shift}px)`}}
        {...handlers}
      >
        <Card className={cn('w-full flex flex-none justify-between items-center p-4', {
          'rounded-r-none shadow-none': shift !== 0,
        })}>
          <div className="flex-none flex items-center max-w-[70%] overflow-hidden">
            <PlayPauseButton className="flex-none" />
            <span className="font-semibold mx-2 text-accent-foreground truncate">
            {name}
          </span>
            <ActivityIcon className="flex-none" name={icon} color={`#${color}`} />
          </div>

          <div className="flex-none flex items-center">
          <span className="text-accent-foreground">
            {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
          </span>
            <ActivityDropdownMenu
              className="hidden sm:inline-flex ml-2"
              onEditClick={() => {}}
              onRemoveClick={handleDialogOpenChange}
            />
          </div>
        </Card>

        <div
          ref={ref}
          className="absolute top-0 bottom-0 right-0 translate-x-full flex rounded-r-md"
        >
          <Button
            className={`${buttonClassNames} border-warning`}
            variant="warning"
            onClick={() => console.log('edit')}
          >
            <NotePencil size="30" />
          </Button>
          <Button
            className={`${buttonClassNames} border-destructive rounded-r-md`}
            variant="destructive"
            onClick={handleDialogOpenChange}
          >
            <X size="30" />
          </Button>
        </div>
      </div>

      <RemoveActivityDialog
        show={showRemoveDialog}
        loading={isLoading}
        onConfirm={removeActivity}
        onOpenChange={handleDialogOpenChange}
        activity={{
          name,
          id,
          icon,
          color,
        }}
      />
    </>
  );
};
