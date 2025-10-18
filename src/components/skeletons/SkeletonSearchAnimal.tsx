const SkeletonSearchAnimal = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground p-4">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />

        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />

          <div className="space-y-2">
            <div className="h-3 w-5/6 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>

        <div className="h-5 w-5 rounded-full bg-muted animate-pulse"></div>
      </div>
    </div>
  );
};

export default SkeletonSearchAnimal;
