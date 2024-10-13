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
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 top-0 z-50 flex bg-primary/60',
        className,
      )}
    >
      <div className="m-auto text-xl font-bold text-white">
        <h3 className="mb-4">Loading</h3>
        <Logo animate showHands={false} />
      </div>
    </div>
  ) : null;
}
