import { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useSwipeable } from 'react-swipeable';
import { useSession } from 'next-auth/react';
import { Reorder, useDragControls } from 'framer-motion';

import { ActivityExtended } from '@/lib/definitions';
import { Card } from '@/ui/common/card';
import { cn } from '@/lib/utils';
import { PlayPauseButton } from '@/ui/dashboard/activities-list/activity-item/play-pause-button';
import { ActivityIcon } from '@/ui/dashboard/activities-list/activity-icon';
import { ActivityDropdownMenu } from '@/ui/dashboard/activities-list/activity-item/activity-dropdown-menu';
import { RemoveActivityDialog } from '@/ui/dashboard/activities-list/remove-activity-dialog';
import { ActionButtons } from '@/ui/dashboard/activities-list/activity-item/action-buttons';
import { DragButton } from '@/ui/dashboard/activities-list/activity-item/drag-button';
import { useCalculateTimeValues } from '@/ui/hooks/use-calculate-time-values';
import { deleteActivity } from '@/lib/actions/activity';
import { useToast } from '@/ui/hooks/use-toast';
import { revalidateActivities } from '@/lib/actions/activity/revalidation';
import { useRouter } from '@/ui/hooks/use-router';

const BUTTONS_WIDTH = 110;

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
  const [isDragging, setIsDragging] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (swiped) setShift(-BUTTONS_WIDTH);
  }, [swiped]);

  const { data: session } = useSession();
  const { toast } = useToast();

  const {
    router,
    pathname,
    stringifyQueryParams,
  } = useRouter();

  const {
    id,
    name,
    color,
    icon,
    timeSpent,
  } = activity;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isDragging) onSwipe(id);
    },
    onSwipedRight: () => {
      if (swiped) onCancelSwipe();
    },
    onSwiping: (e) => {
      if (isDragging) return;
      if (!isSwiping) setIsSwiping(true);
      console.log('---', e.dir);
      if (e.dir === 'Left' && Math.abs(shift) <= BUTTONS_WIDTH) setShift(e.deltaX < -BUTTONS_WIDTH ? -BUTTONS_WIDTH : e.deltaX);
      if (e.dir === 'Right') setShift((shift) => {
        const delta = shift + e.absX;
        return delta > 0 ? 0 : delta;
      });
    },
    onSwiped: (e) => {
      if (e.dir === 'Down' || e.dir === 'Up') {
        const value = Math.abs(shift);
        console.log('value', value);
        if (value >= BUTTONS_WIDTH/2) setShift(-BUTTONS_WIDTH);
        if (value < BUTTONS_WIDTH/2) setShift(0);
      }
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

  const handleEditClick = () => router.push(`${pathname}?${stringifyQueryParams({ 'editActivity': id })}`);

  const controls = useDragControls();
  const startDrag = (e: PointerEvent) => controls.start(e);
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <>
      <Reorder.Item
        value={activity}
        dragListener={false}
        dragControls={controls}
        onDragStart={handleDragStart}
        onDragTransitionEnd={handleDragEnd}
        className="relative"
      >
        <div
          className={cn('w-full mb-4 will-change-transform transition-transform duration-200 ease-in-out', {
            'duration-0': isSwiping
          })}
          style={{ 'transform': isDragging ? 'none' : `translateX(${shift}px)`}}
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

            <DragButton onDragStart={startDrag} />

            <div className="flex-none flex items-center">
            <span className="text-accent-foreground">
              {`${totalTimeSpent[0]}:${totalTimeSpent[1]}:${totalTimeSpent[2]}`}
            </span>
              <ActivityDropdownMenu
                className="hidden sm:inline-flex ml-2"
                onEditClick={handleEditClick}
                onRemoveClick={handleDialogOpenChange}
              />
            </div>
          </Card>

          <div
            ref={ref}
            className="absolute top-0 bottom-0 right-0 translate-x-full flex rounded-r-md"
          >
            <ActionButtons
              onEditClick={handleEditClick}
              onRemoveClick={handleDialogOpenChange}
            />
          </div>
        </div>
      </Reorder.Item>

      <RemoveActivityDialog
        show={showRemoveDialog}
        loading={isLoading}
        onConfirm={removeActivity}
        onOpenChange={handleDialogOpenChange}
        activity={{ name, id, icon, color }}
      />
    </>
  );
};
