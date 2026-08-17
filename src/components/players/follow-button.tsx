"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button, type buttonVariants } from "@/components/ui/button";
import { toggleFollowPlayerAction } from "@/server/actions/shortlist.actions";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

export function FollowButton({
  playerId,
  initialFollowing,
  size = "sm",
  label = true,
}: {
  playerId: string;
  initialFollowing: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
  label?: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    startTransition(async () => {
      await toggleFollowPlayerAction(playerId, wasFollowing);
    });
  }

  return (
    <Button
      type="button"
      variant={isFollowing ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={isFollowing}
      title={isFollowing ? "Retirer de la shortlist" : "Ajouter à la shortlist"}
    >
      <Star className={cn("size-4", isFollowing && "fill-current")} />
      {label && (isFollowing ? "Suivi" : "Suivre")}
    </Button>
  );
}
