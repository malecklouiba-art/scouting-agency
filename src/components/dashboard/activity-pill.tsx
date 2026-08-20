import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { placeholderPhotoUrl } from "@/lib/avatar";

export function ActivityPill({
  playerId,
  firstName,
  lastName,
  photoUrl,
  meta,
}: {
  playerId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  meta: string;
}) {
  return (
    <Link
      href={`/players/${playerId}`}
      className="glass-surface flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-4 pl-1.5 transition-colors hover:border-primary/40"
    >
      <Avatar size="sm">
        <AvatarImage src={photoUrl ?? placeholderPhotoUrl(playerId)} alt={`${firstName} ${lastName}`} />
        <AvatarFallback>
          {firstName[0]}
          {lastName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-foreground">
          {firstName} {lastName}
        </span>
        <span className="text-[11px] text-muted-foreground">{meta}</span>
      </div>
    </Link>
  );
}
