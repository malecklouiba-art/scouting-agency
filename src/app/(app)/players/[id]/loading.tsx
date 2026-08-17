export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-card" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 animate-pulse rounded-md bg-card" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-card" />
        </div>
      </div>
      <div className="h-10 w-full animate-pulse rounded-md bg-card" />
      <div className="h-40 w-full animate-pulse rounded-xl bg-card" />
    </div>
  );
}
