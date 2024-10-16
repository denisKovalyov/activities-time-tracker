'use client';

import { ActivitiesListWrapperProps } from '@/ui/dashboard/activities-list/types';
import { ReorderList } from '@/ui/dashboard/activities-list/reorder-list';
import { ActivitiesList } from '@/ui/dashboard/activities-list/activities-list';
import { useRouter } from '@/ui/hooks/use-router';

export const ActivitiesListWrapper = ({
  activities,
}: ActivitiesListWrapperProps) => {
  const { router, pathname, searchParams, stringifyQueryParams } = useRouter();

  const handleReorder = () =>
    router.push(`${pathname}?${stringifyQueryParams({ reorder: 'true' })}`);
  const handleEdit = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ editActivity: id })}`);
  const handleRemove = (id: string) =>
    router.push(`${pathname}?${stringifyQueryParams({ removeActivity: id })}`);

  const reorderMode = Boolean(searchParams.get('reorder'));
  const List = reorderMode ? ReorderList : ActivitiesList;

  return (
    <div className="mx-auto mt-4 w-full max-w-3xl overflow-x-hidden">
      <List
        activities={activities}
        onReorder={handleReorder}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    </div>
  );
};
