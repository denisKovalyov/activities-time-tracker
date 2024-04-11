import { clsx } from 'clsx';
import { CheckCircle, Minus, WarningCircle } from '@phosphor-icons/react';
import {
  LENGTH_REQUIREMENT,
  UPPER_LOWER_CASE_REQUIREMENT,
  NUMBER_REQUIREMENT,
  SPECIAL_CHAR_REQUIREMENT,
} from '@/lib/validation';
import type { Requirement } from '@/lib/validation';

type PasswordTooltipProps = {
  requirements: Requirement[];
  markAsError: boolean;
};

const RULES: Requirement[] = [
  LENGTH_REQUIREMENT,
  UPPER_LOWER_CASE_REQUIREMENT,
  NUMBER_REQUIREMENT,
  SPECIAL_CHAR_REQUIREMENT,
];

export function PasswordTooltipContent({
  requirements = [],
  markAsError,
}: PasswordTooltipProps) {
  const renderItem = (requirement: Requirement) => {
    const isFulfilled = !requirements.includes(requirement);
    let Icon = isFulfilled ? CheckCircle : markAsError ? WarningCircle : Minus;

    return (
      <li
        key={requirement}
        className={clsx('mb-1 flex items-center', {
          'text-destructive': !isFulfilled && markAsError,
          'text-emerald-600': isFulfilled,
        })}
      >
        <Icon size="12" weight="bold" className="mr-2" />
        <span>{requirement}</span>
      </li>
    );
  };

  return (
    <div>
      <p className="mb-2 mt-1 font-medium">Password should have:</p>
      <ul>{RULES.map((requirement) => renderItem(requirement))}</ul>
    </div>
  );
}
