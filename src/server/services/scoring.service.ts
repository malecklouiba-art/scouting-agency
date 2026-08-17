import type { Player } from "@/generated/prisma/client";
import { calculateAge } from "@/lib/age";
import type { PlayerSearchCriteria } from "./search.service";

export interface ScoreBreakdownEntry {
  label: string;
  points: number;
  maxPoints: number;
}

export interface PlayerScore {
  score: number;
  breakdown: ScoreBreakdownEntry[];
}

// Poids fixes qui somment à 100 quand tous les critères sont fournis (doc
// §15). Les critères non demandés ne comptent ni pour ni contre le joueur —
// le score final est ramené sur 100 relativement aux seuls critères actifs.
const WEIGHTS = { position: 25, age: 15, nationality: 10 };

type ScorablePlayer = Pick<Player, "position" | "secondaryPositions" | "dateOfBirth" | "nationality">;

export function scorePlayer(player: ScorablePlayer, criteria: PlayerSearchCriteria): PlayerScore {
  const breakdown: ScoreBreakdownEntry[] = [];
  let earned = 0;
  let possible = 0;

  if (criteria.position) {
    possible += WEIGHTS.position;
    if (player.position === criteria.position) {
      earned += WEIGHTS.position;
      breakdown.push({ label: "Poste correspondant", points: WEIGHTS.position, maxPoints: WEIGHTS.position });
    } else if (player.secondaryPositions.includes(criteria.position)) {
      const points = Math.round(WEIGHTS.position * 0.4);
      earned += points;
      breakdown.push({ label: "Poste secondaire compatible", points, maxPoints: WEIGHTS.position });
    } else {
      breakdown.push({ label: "Poste différent", points: 0, maxPoints: WEIGHTS.position });
    }
  }

  if (criteria.ageMin !== undefined || criteria.ageMax !== undefined) {
    possible += WEIGHTS.age;
    const age = calculateAge(player.dateOfBirth);
    if (age === null) {
      breakdown.push({ label: "Âge inconnu", points: 0, maxPoints: WEIGHTS.age });
    } else {
      const min = criteria.ageMin ?? age;
      const max = criteria.ageMax ?? age;
      if (age >= min && age <= max) {
        earned += WEIGHTS.age;
        breakdown.push({ label: "Âge correspondant", points: WEIGHTS.age, maxPoints: WEIGHTS.age });
      } else {
        const distance = age < min ? min - age : age - max;
        const points = Math.max(0, Math.round(WEIGHTS.age - distance * 3));
        earned += points;
        breakdown.push({ label: `Âge proche (${age} ans)`, points, maxPoints: WEIGHTS.age });
      }
    }
  }

  if (criteria.nationalities?.length) {
    possible += WEIGHTS.nationality;
    if (player.nationality && criteria.nationalities.includes(player.nationality)) {
      earned += WEIGHTS.nationality;
      breakdown.push({
        label: "Nationalité correspondante",
        points: WEIGHTS.nationality,
        maxPoints: WEIGHTS.nationality,
      });
    } else {
      breakdown.push({ label: "Nationalité différente", points: 0, maxPoints: WEIGHTS.nationality });
    }
  }

  const score = possible === 0 ? 100 : Math.round((earned / possible) * 100);
  return { score, breakdown };
}
