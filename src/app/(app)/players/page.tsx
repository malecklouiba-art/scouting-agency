import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";

const POSITIONS = [
  { value: "GK", label: "Gardien" },
  { value: "CB", label: "Défenseur central" },
  { value: "LB", label: "Latéral gauche" },
  { value: "RB", label: "Latéral droit" },
  { value: "DM", label: "Milieu défensif" },
  { value: "CM", label: "Milieu central" },
  { value: "AM", label: "Milieu offensif" },
  { value: "LW", label: "Ailier gauche" },
  { value: "RW", label: "Ailier droit" },
  { value: "ST", label: "Attaquant" },
];

export default function PlayersPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Joueurs
        </h1>
        <p className="text-sm text-muted-foreground">
          Recherchez et filtrez la base de joueurs ScoutPro.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Nom du joueur" className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((position) => (
              <SelectItem key={position.value} value={position.value}>
                {position.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Pied" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LEFT">Gauche</SelectItem>
            <SelectItem value="RIGHT">Droit</SelectItem>
            <SelectItem value="BOTH">Ambidextre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <EmptyState
        title="Aucun joueur pour l'instant"
        description="La base ScoutPro se remplit via une synchronisation depuis le Data Provider. Une fois les données synchronisées, vos recherches et filtres s'appliqueront ici."
      />
    </div>
  );
}
