import { Logo } from '@/ui/common/logo';
import { cn } from '@/lib/utils';

export function LoadingOverlay({
  show,
  className,
}: {
  show: boolean;
  className?: string;
}) {
  return show ? (
    <div className={cn('absolute z-50 top-0 left-0 right-0 bottom-0 bg-primary/60 flex', className)}>
      <div className="m-auto text-white font-bold text-xl">
        <h3 className="mb-4">Loading</h3>
        <Logo animate showHands={false} />
      </div>
    </div>
  ) : null;
}
