export default function Loading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 animate-pulse rounded-md bg-card" />
        <div className="h-7 w-56 animate-pulse rounded-md bg-card" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-xl bg-card" />
    </div>
  );
}
