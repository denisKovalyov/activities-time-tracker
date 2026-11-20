import { User } from '@/lib/definitions';
import type { Day } from '@/lib/utils/day';

export type AccountDetails = Pick<User, 'email' | 'email_verified'> & {
  createdDay: Day;
  updatedDay: Day;
};

export type TabsProps = {
  activeTab?: string;
  account?: AccountDetails;
};
