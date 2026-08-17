import { ListSkeleton } from "@/components/shared/list-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-card" />
      <ListSkeleton />
    </div>
  );
}
