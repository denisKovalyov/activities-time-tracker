import { User } from '@/lib/definitions';

export type AccountDetails = Pick<
  User,
  'email' | 'email_verified' | 'created_at' | 'updated_at'
>;

export type TabsProps = {
  activeTab?: string;
  account?: AccountDetails;
};
