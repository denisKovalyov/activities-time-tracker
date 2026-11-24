import { Logo } from '@/ui/common/logo';
import { cn } from '@/lib/utils/common';

export function LoadingOverlay({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) {
  return show ? (
    <div
      role="status"
      className={cn('absolute inset-0 z-50 flex bg-primary/60', className)}
    >
      <div className="m-auto text-xl font-bold text-white">
        <h3 className="mb-4">Loading</h3>
        <Logo animate showHands={false} />
      </div>
    </div>
  ) : null;
}
