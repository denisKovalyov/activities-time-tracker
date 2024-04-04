import React from 'react';
import { clsx } from 'clsx';
import {
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  LENGTH_REQUIREMENT,
  UPPER_LOWER_CASE_REQUIREMENT,
  NUMBER_REQUIREMENT,
  SPECIAL_CHAR_REQUIREMENT,
} from '@/lib/validation';
import type { Requirement } from '@/lib/validation';

type PasswordTooltipProps = {
  requirements: Requirement[];
  error: boolean;
};

const renderIcon = (current: Requirement, requirements: Requirement[]) => {
  const Icon = requirements.includes(current) ?  WarningCircle : CheckCircle;
  return <Icon size="12" weight="regular" className="mr-2" />
};

export function PasswordTooltipContent({ requirements = [], error }: PasswordTooltipProps) {
  return (
    <div>
      <p className="mt-1 mb-2">Password should has:</p>
      <ul>
        <li className="flex items-center mb-1">
          {renderIcon(LENGTH_REQUIREMENT, requirements)}{LENGTH_REQUIREMENT}
        </li>
        <li className="flex items-center mb-1">
          {renderIcon(UPPER_LOWER_CASE_REQUIREMENT, requirements)}{UPPER_LOWER_CASE_REQUIREMENT}
        </li>
        <li className="flex items-center mb-1">
          {renderIcon(NUMBER_REQUIREMENT, requirements)}{NUMBER_REQUIREMENT}
        </li>
        <li className="flex items-center mb-1">
          {renderIcon(SPECIAL_CHAR_REQUIREMENT, requirements)}{SPECIAL_CHAR_REQUIREMENT}
        </li>
      </ul>
    </div>
  );
};
