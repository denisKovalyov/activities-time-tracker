import React from 'react';
import { icons } from 'lucide-react';

export const IconLucide = ({
  name,
  size,
}: {
  name: string;
  size: string | number;
}) => {
  const Icon = icons[name as keyof typeof icons];

  if (!Icon) return null;

  return <Icon size={size} />;
};
