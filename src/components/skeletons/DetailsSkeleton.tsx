import { Skeleton } from "../ui/skeleton";

export function DetailsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-background mt-4 sm:mt-0">
      <div className="w-full bg-primary h-14 flex items-center px-4 rounded-b-xl shadow-md z-10 sticky top-0">
        <Skeleton className="h-6 w-32 bg-primary-foreground/20" />
      </div>

      <div className="p-4 space-y-6 mt-4">
        <div className="w-full">
          <div className="grid w-full grid-cols-4 gap-1 mb-6">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <Skeleton className="h-4 w-24 mb-4" />
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
