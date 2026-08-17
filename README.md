# ScoutPro

SaaS de scouting et de recrutement football (MVP web) : recherche de joueurs en langage naturel, fiches joueurs, shortlist et rapports, alimenté par une base PostgreSQL synchronisée depuis Transfermarkt et un moteur conversationnel Gemini.

**État actuel : les 13 étapes de la méthode de build sont codées** (voir [`docs/architecture-proposal.md`](docs/architecture-proposal.md) pour l'architecture complète, décidée à l'Étape 1). L'app est déployée et le compte/connexion fonctionne de bout en bout. Deux choses restent à faire avant que le produit soit réellement utilisable :

1. **Une clé Gemini** (gratuite sur [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) — sans elle le chat ne peut pas répondre. À ajouter en variable d'environnement `GEMINI_API_KEY`.
2. **Une synchronisation Transfermarkt réussie** — la base joueurs est vide tant qu'aucun sync n'a tourné. L'instance publique de démo (`transfermarkt-api.fly.dev`, gratuite par défaut) a été instable au moment du build ; si elle continue à renvoyer des 500, la prochaine étape est de self-host `felipeall/transfermarkt-api` et de pointer `TRANSFERMARKT_API_URL` dessus.

## Stack

Next.js (App Router, Turbopack) + TypeScript + Tailwind + shadcn/ui (Base UI) · PostgreSQL + Prisma 7 · Supabase Auth · Google Gemini (`@google/genai`) · déploiement Vercel.

## Démarrer en local

```bash
pnpm install
cp .env.example .env   # remplir DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_*, GEMINI_API_KEY
pnpm dev
```

Voir les commentaires dans `.env.example` pour le format exact de chaque variable — en particulier `DATABASE_URL` (pooler Supavisor, pas la connexion directe : voir les notes sur pourquoi).

## Synchroniser des joueurs

Deux façons de déclencher une synchro depuis Transfermarkt (recherche par texte, réservé ADMIN/OWNER) :

```bash
pnpm sync:players -- "haaland"
pnpm sync:clubs -- "real madrid"
pnpm sync:competitions -- "ligue 1"
```

Ou via `POST /api/sync` (`{ entity: "players" | "clubs" | "competitions", query: string, limit?: number }`, session requise).

## Tests

```bash
pnpm test
```

Couvre la logique pure testable sans base de données ni API live : scoring, parsing Transfermarkt, normalisation des postes, calcul d'âge.

## Structure

- `src/app/` — écrans (App Router) et routes API, UI uniquement
- `src/server/` — logique métier : services, Server Actions, intégration Gemini (client, prompts, function calling)
- `src/lib/` — utilitaires purs (âge, postes, libellés)
- `services/data-provider/` — module indépendant de Next/React : provider Transfermarkt + jobs de synchronisation
- `prisma/` — schéma et migrations
- `docs/architecture-proposal.md` — livrable de l'Étape 1, référence pour toutes les décisions de conception
