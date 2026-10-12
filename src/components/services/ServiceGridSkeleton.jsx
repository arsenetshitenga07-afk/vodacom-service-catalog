import { Skeleton } from '@/components/ui/skeleton';

export function ServiceGridSkeleton({ count = 6 }) {
  return (
    <div
      className="grid grid-cols-1 gap-5 min-[1340px]:grid-cols-3 sm:grid-cols-2"
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="bg-card shadow-card rounded-xl border">
          <div className="flex items-start gap-3.5 p-5 pb-3">
            <Skeleton className="size-11 rounded-xl" />
            <div className="flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          </div>
          <div className="space-y-2 px-5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
          <div className="flex gap-1.5 px-5 pt-4">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="mx-5 mt-5 mb-4 h-14" />
          <div className="flex items-center justify-between border-t px-5 py-3">
            <div className="flex -space-x-1.5">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="size-7 rounded-full" />
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
