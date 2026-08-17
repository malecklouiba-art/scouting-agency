import { ListSkeleton } from "@/components/shared/list-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-card" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-card" />
      <ListSkeleton />
    </div>
  );
}
