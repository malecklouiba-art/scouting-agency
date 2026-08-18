# ScoutPro — Proposition d'architecture (Étape 1)

> Ce document est le livrable de l'**Étape 1** de la méthode définie par le porteur de projet : *"Analyser le projet et proposer : architecture, arborescence, schéma Prisma, flux Gemini, architecture Data Provider, écrans. NE PAS CODER avant cette analyse."*
> Aucun code applicatif n'est présent dans ce dépôt à ce stade — c'est volontaire. Le code (squelette Next.js) démarre à l'Étape 2, après validation de cette proposition.

## 0. Cadrage du MVP

**But unique à démontrer** : un scout peut trouver et organiser les bons joueurs beaucoup plus vite avec ScoutPro qu'avec une navigation traditionnelle, via une recherche en langage naturel.

**Dans le périmètre** : recherche en langage naturel (Gemini + function calling), recherche classique filtrée, fiches joueurs, score de pertinence déterministe, shortlist, rapports, synchronisation manuelle Transfermarkt.

**Hors périmètre (explicitement)** : apps mobiles natives, scraping massif, ML prédictif, CRM agent, contrats, marketplace, transferts, API publique, facturation SaaS. L'architecture reste conçue pour absorber une future app React Native, mais rien de mobile n'est construit maintenant.

Toute fonctionnalité qui ne sert pas directement l'objectif ci-dessus est reportée après le MVP.

## 1. Vue d'ensemble de l'architecture

```
                     ┌─────────────────────────────┐
                     │        Navigateur (Web)      │
                     └──────────────┬───────────────┘
                                    │ HTTPS
                     ┌──────────────▼───────────────┐
                     │   Next.js (App Router)        │
                     │   UI uniquement — aucune       │
                     │   logique métier dans les      │
                     │   composants React             │
                     └──────────────┬───────────────┘
                                    │ Server Actions / API routes
                     ┌──────────────▼───────────────┐
                     │   Couche services (src/server) │
                     │   player / search / scoring /  │
                     │   shortlist / report / gemini  │
                     └───┬───────────────────┬───────┘
                         │                   │
              ┌──────────▼─────────┐  ┌──────▼───────────┐
              │   PostgreSQL        │  │  Google Gemini    │
              │   (via Prisma)      │  │  (compréhension,   │
              │                     │  │   pas source de    │
              │                     │  │   vérité)          │
              └──────────▲─────────┘  └───────────────────┘
                         │ écrit par
              ┌──────────┴─────────────────┐
              │  services/data-provider      │
              │  (module indépendant)        │
              │  PlayerDataProvider           │
              │  └─ TransfermarktProvider     │
              └──────────────┬───────────────┘
                             │ HTTP, rate-limited, sync manuelle
                     ┌───────▼────────┐
                     │ Transfermarkt   │
                     │ (via felipeall/ │
                     │ transfermarkt-  │
                     │ api, self-hosted)│
                     └─────────────────┘

  Auth : Supabase Auth        Storage : Supabase Storage (photos, exports)
```

**Décision structurante : un seul dépôt Next.js, pas un monorepo multi-packages pour le MVP.**
La règle "aucune logique métier dans les composants, backend indépendant du web" (section 21 du brief) n'exige pas un monorepo avec des packages séparés — elle exige une **frontière de code stricte** : `src/app/**` et `src/components/**` ne font que de l'UI et appellent des Server Actions ; toute la logique vit dans `src/server/**` et `services/data-provider/**`, sans aucun import React. Le jour où l'app React Native existera, elle consommera les mêmes endpoints HTTP — elle n'a pas besoin d'importer le code serveur directement. Un vrai monorepo (Turborepo/pnpm workspaces) reste une évolution possible plus tard, mais l'ajouter maintenant serait de la complexité inutile (règle 28 : ne pas construire une "énorme plateforme").

## 2. Arborescence proposée

```
scoutpro/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                                   # UI uniquement (Next.js App Router)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/                             # zone authentifiée
│   │   │   ├── layout.tsx                     # Header + navigation (section 12)
│   │   │   ├── dashboard/page.tsx              # écran central + chat
│   │   │   ├── players/
│   │   │   │   ├── page.tsx                    # recherche classique (section 14)
│   │   │   │   └── [id]/page.tsx                # fiche joueur (section 16)
│   │   │   ├── shortlist/page.tsx
│   │   │   └── reports/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── api/
│   │   │   ├── chat/route.ts                   # streaming Gemini + function calling
│   │   │   └── sync/route.ts                    # déclenchement manuel de synchro (ADMIN)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                                  # primitives shadcn/ui
│   │   ├── chat/                                # ChatWindow, MessageBubble, InlinePlayerCards
│   │   ├── players/                             # PlayerCard, PlayerTable, Filters, ScoreBadge
│   │   ├── shortlist/
│   │   └── reports/
│   ├── server/                                   # === toute la logique métier, zéro UI ===
│   │   ├── actions/                             # Server Actions (fine couche d'orchestration)
│   │   │   ├── players.actions.ts
│   │   │   ├── shortlist.actions.ts
│   │   │   ├── reports.actions.ts
│   │   │   └── chat.actions.ts
│   │   ├── services/                            # réutilisable web ET future mobile (via API)
│   │   │   ├── player.service.ts
│   │   │   ├── search.service.ts                # critères structurés -> requête Prisma
│   │   │   ├── scoring.service.ts                # score de pertinence déterministe (section 15)
│   │   │   ├── shortlist.service.ts
│   │   │   ├── report.service.ts
│   │   │   └── comparison.service.ts
│   │   ├── gemini/
│   │   │   ├── client.ts
│   │   │   ├── prompts/
│   │   │   ├── functions/                        # une fonction = un fichier (section 10)
│   │   │   │   ├── searchPlayers.ts
│   │   │   │   ├── getPlayer.ts
│   │   │   │   ├── comparePlayers.ts
│   │   │   │   ├── addToShortlist.ts
│   │   │   │   ├── removeFromShortlist.ts
│   │   │   │   ├── getShortlist.ts
│   │   │   │   ├── createReport.ts
│   │   │   │   ├── getRecentPlayers.ts
│   │   │   │   └── findSimilarPlayers.ts
│   │   │   └── router.ts                          # dispatch + gating de confirmation
│   │   ├── auth/session.ts                        # helpers Supabase côté serveur
│   │   └── db/prisma.ts                            # client Prisma singleton
│   └── lib/                                        # utilitaires purs (âge, formatage valeur, etc.)
├── services/
│   └── data-provider/                              # module indépendant, sans dépendance à Next/React
│       ├── provider.interface.ts                   # PlayerDataProvider
│       ├── types.ts                                # PlayerSearchCriteria, Player DTO, Transfer, etc.
│       ├── transfermarkt/
│       │   ├── transfermarkt.provider.ts           # implémente PlayerDataProvider
│       │   ├── transfermarkt.client.ts             # appelle felipeall/transfermarkt-api
│       │   ├── transfermarkt.mapper.ts             # DTO externe -> modèle interne
│       │   └── rateLimiter.ts
│       └── sync/
│           ├── syncPlayers.ts
│           ├── syncClubs.ts
│           ├── syncTransfers.ts
│           ├── syncCompetitions.ts
│           ├── syncLogger.ts                        # écrit dans SyncLog (section 23)
│           └── runSync.ts                            # point d'entrée CLI (pnpm sync:players)
├── .claude/
│   └── settings.json                                 # plugins Claude Code pour ce projet
├── docs/
│   └── architecture-proposal.md                       # ce document
└── package.json
```

## 3. Schéma Prisma proposé

Couvre les entités demandées (section 22), les champs joueur riches (section 6), la provenance obligatoire (section 7) et les logs de synchronisation (section 23).

**Note de conception : `âge` n'est pas stocké.** On stocke `dateOfBirth` et on calcule l'âge à la lecture. Un champ "âge" stocké se périmerait chaque jour et fausserait les filtres — c'est un anti-pattern classique. Le score et les filtres utilisent une valeur calculée à la volée.

```prisma
enum Role {
  OWNER
  ADMIN
  SCOUT
  VIEWER
}

enum Foot {
  LEFT
  RIGHT
  BOTH
}

enum DataSource {
  TRANSFERMARKT
  MANUAL
}

enum ShortlistStatus {
  TO_WATCH      // À suivre
  INTERESTING   // Intéressant
  PRIORITY      // Prioritaire
  DISCARDED     // Écarté
}

enum ReportRecommendation {
  TO_WATCH
  INTERESTING
  PRIORITY
  DISCARD
}

enum SyncEntity {
  PLAYER
  CLUB
  TRANSFER
  COMPETITION
}

enum SyncStatus {
  RUNNING
  SUCCESS
  FAILED
}

model Organization {
  id         String   @id @default(cuid())
  name       String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  users      User[]
  shortlists Shortlist[]
  reports    Report[]
}

model User {
  id             String   @id @default(cuid())
  supabaseUserId String   @unique
  email          String   @unique
  firstName      String?
  lastName       String?
  role           Role     @default(SCOUT)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  shortlists     Shortlist[]
  reports        Report[]
  conversations  Conversation[]

  @@index([organizationId])
}

model Competition {
  id           String     @id @default(cuid())
  source       DataSource @default(TRANSFERMARKT)
  sourceId     String?
  sourceUrl    String?
  lastSyncedAt DateTime?

  name         String
  country      String?
  tier         Int?

  clubs        Club[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([source, sourceId])
}

model Club {
  id            String     @id @default(cuid())
  source        DataSource @default(TRANSFERMARKT)
  sourceId      String?
  sourceUrl     String?
  lastSyncedAt  DateTime?

  name          String
  country       String?
  logoUrl       String?
  competitionId String?
  competition   Competition? @relation(fields: [competitionId], references: [id])

  players       Player[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([source, sourceId])
  @@index([name])
  @@index([country])
}

model Player {
  id                     String     @id @default(cuid())

  // Provenance (section 7) — obligatoire sur toute donnée externe
  source                 DataSource @default(TRANSFERMARKT)
  sourceId               String?
  sourceUrl              String?
  lastSyncedAt           DateTime?

  // Identité (section 6)
  firstName              String
  lastName               String
  dateOfBirth            DateTime?
  nationality            String?
  secondaryNationalities String[]  @default([])
  heightCm               Int?
  preferredFoot          Foot?
  position               String?
  secondaryPositions     String[]  @default([])
  shirtNumber            Int?
  marketValueEur         Int?
  photoUrl               String?

  clubId                 String?
  club                   Club?     @relation(fields: [clubId], references: [id])

  transfers              Transfer[]
  history                PlayerHistory[]
  stats                  PlayerStat[]
  reports                Report[]
  shortlistPlayers       ShortlistPlayer[]

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([source, sourceId])
  @@index([position])
  @@index([nationality])
  @@index([clubId])
  @@index([marketValueEur])
  @@index([lastName, firstName])
  @@index([dateOfBirth])
}

model Transfer {
  id           String     @id @default(cuid())
  source       DataSource @default(TRANSFERMARKT)
  sourceId     String?
  sourceUrl    String?

  playerId     String
  player       Player   @relation(fields: [playerId], references: [id])
  fromClubName String?
  toClubName   String?
  date         DateTime?
  feeEur       Int?
  isLoan       Boolean  @default(false)

  createdAt    DateTime @default(now())

  @@index([playerId])
}

model PlayerHistory {
  id              String   @id @default(cuid())
  playerId        String
  player          Player   @relation(fields: [playerId], references: [id])
  season          String
  clubName        String?
  competitionName String?
  appearances     Int?
  goals           Int?
  assists         Int?
  minutesPlayed   Int?

  createdAt       DateTime @default(now())

  @@index([playerId])
}

model PlayerStat {
  // alimente le score de pertinence (section 15) ; clé libre pour rester extensible
  id        String   @id @default(cuid())
  playerId  String
  player    Player   @relation(fields: [playerId], references: [id])
  season    String?
  key       String   // ex: "speed", "defensiveDuelsWonPct", "passAccuracy"
  value     Float

  createdAt DateTime @default(now())

  @@unique([playerId, season, key])
  @@index([playerId])
  @@index([key])
}

model Shortlist {
  id             String   @id @default(cuid())
  name           String   @default("Ma shortlist")
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  ownerId        String
  owner          User     @relation(fields: [ownerId], references: [id])

  players        ShortlistPlayer[]

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([organizationId])
}

model ShortlistPlayer {
  id          String          @id @default(cuid())
  shortlistId String
  shortlist   Shortlist       @relation(fields: [shortlistId], references: [id])
  playerId    String
  player      Player          @relation(fields: [playerId], references: [id])
  status      ShortlistStatus @default(TO_WATCH)
  lastNote    String?
  addedAt     DateTime        @default(now())

  @@unique([shortlistId, playerId])
  @@index([playerId])
}

model Report {
  id             String   @id @default(cuid())
  playerId       String
  player         Player   @relation(fields: [playerId], references: [id])
  authorId       String
  author         User     @relation(fields: [authorId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  date           DateTime @default(now())
  context        String?
  rating         Int?
  strengths      String?
  weaknesses     String?
  comment        String?
  recommendation ReportRecommendation?

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([playerId])
  @@index([authorId])
}

model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  title     String?
  messages  Message[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String   // "user" | "assistant" | "system"
  content        String
  functionCalls  Json?    // trace des function calls exécutés (audit, section 10-11)
  createdAt      DateTime @default(now())

  @@index([conversationId])
}

model SyncLog {
  id           String     @id @default(cuid())
  entity       SyncEntity
  status       SyncStatus @default(RUNNING)
  startedAt    DateTime   @default(now())
  finishedAt   DateTime?
  fetched      Int        @default(0)
  created      Int        @default(0)
  updated      Int        @default(0)
  errors       Int        @default(0)
  errorDetails Json?
  triggeredBy  String?    // userId, ou "manual" / "cron"

  @@index([entity, startedAt])
}
```

## 4. Architecture Data Provider (sections 3, 5, 23, 24, 25)

```typescript
// services/data-provider/provider.interface.ts
interface PlayerDataProvider {
  searchPlayers(criteria: PlayerSearchCriteria): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  getPlayerTransfers(id: string): Promise<Transfer[]>;
  getPlayerHistory(id: string): Promise<PlayerHistory[]>;
  syncPlayer(id: string): Promise<void>;
}
```

- **`TransfermarktProvider`** implémente cette interface en s'appuyant sur `felipeall/transfermarkt-api` (FastAPI, à déployer comme service séparé). Aucun composant du produit n'appelle Transfermarkt directement — tout passe par cette classe.
- **Aucune licence commerciale n'est présumée** sur les données Transfermarkt (rappel section 4) : chaque enregistrement externe porte `source` / `sourceId` / `sourceUrl` / `lastSyncedAt`, et l'UI affiche toujours cette provenance (section 7) — jamais présenté comme généré par ScoutPro.
- **Rate limiting** implémenté dans `transfermarkt/rateLimiter.ts` (token bucket simple), au niveau du provider — jamais contournable depuis une recherche utilisateur.
- **Aucune synchronisation massive déclenchée par une requête utilisateur** (section 25) : le bouton "Synchroniser" (réservé ADMIN/OWNER) lance un job asynchrone qui s'exécute côté serveur, journalisé dans `SyncLog` (début, fin, récupérés, créés, modifiés, erreurs — section 23).
- **MVP = synchronisation manuelle**, avec le modèle de données déjà prêt (`lastSyncedAt`) pour évoluer vers une synchro quotidienne (cron) puis incrémentale, sans migration de schéma.
- `worldfootballR` n'est pas une dépendance — traité uniquement comme référence technique si consulté (section 24).
- Le moteur de recherche ScoutPro interroge **uniquement PostgreSQL**, jamais Transfermarkt en direct (section 5) : `Transfermarkt → Data Provider → Sync → PostgreSQL → moteur de recherche → utilisateur`.

## 5. Flux Gemini (sections 8, 9, 10, 11)

```
Utilisateur → Chat UI → /api/chat → Gemini (system prompt + tools déclarés)
   → Gemini émet un function call (ex: search_players avec critères structurés)
   → src/server/gemini/router.ts dispatch vers le handler serveur correspondant
   → src/server/services/search.service.ts traduit les critères en requête Prisma
   → PostgreSQL renvoie les joueurs → scoring.service.ts calcule le score (section 15)
   → résultats structurés renvoyés à Gemini → Gemini rédige la réponse en langage naturel
   → Chat UI affiche le texte + les composants PlayerCard cliquables (section 13)
```

**Gemini n'est jamais la source de vérité** : il transforme la demande en `PlayerSearchCriteria` structuré, le backend interroge Postgres, et Gemini ne fait que reformuler des résultats déjà calculés — il n'invente jamais de joueur ni de statistique.

**Fonctions exposées (function calling, section 10)**, une par fichier sous `src/server/gemini/functions/` :
`search_players`, `get_player`, `compare_players`, `add_to_shortlist`, `remove_from_shortlist`, `get_shortlist`, `create_report`, `get_recent_players`, `find_similar_players`.
Chacune est exécutée **strictement côté serveur** ; le modèle ne touche jamais directement la base de données.

**Gating de confirmation (section 11)** : les fonctions sont classées en deux catégories.
- *Lecture seule* (`search_players`, `get_player`, `compare_players`, `get_shortlist`, `get_recent_players`, `find_similar_players`) → exécution immédiate.
- *Mutation* (`add_to_shortlist`, `remove_from_shortlist`, `create_report`) → la fonction renvoie d'abord un objet `pending_action` (ce qui va être fait, sur quels joueurs) affiché dans le chat avec un bouton **Confirmer** ; seul le clic déclenche une Server Action distincte qui exécute réellement la mutation, référencée par l'ID du `pending_action`. Le modèle ne peut donc jamais écrire en base sans un geste explicite de l'utilisateur.

## 6. Score de pertinence déterministe (section 15)

Aucun ML. Formule pondérée et explicable, calculée en TypeScript pur dans `scoring.service.ts` (unit-testable) :

- Chaque critère structuré reçu de Gemini (`position`, `maxAge`/plage d'âge, `countries`, `attributes.*`) a un **poids fixe** qui somme à 100 :
  - Position : 25 pts si correspondance exacte, 10 pts si poste secondaire compatible, 0 sinon.
  - Âge : 15 pts si dans la plage demandée, dégressif linéaire au-delà (jusqu'à 0).
  - Pays / nationalité : 10 pts si correspondance.
  - Attributs numériques (`PlayerStat`, ex. vitesse, duels défensifs) : poids restant réparti également entre les attributs demandés ; pour chacun, score proportionnel à l'écart entre la valeur du joueur et le seuil demandé, plafonné au poids du critère.
- Le total est arrondi sur 100 et **chaque contribution est conservée** (quel critère a apporté combien) pour générer l'explication affichée sur la fiche joueur (section 15) :
  `✓ âge correspondant · ✓ position correspondant · ✓ très bon dans les duels · ...`
- Cette même fonction sert à la fois à la recherche classique (section 14, tri par score) et aux résultats affichés dans le chat (section 13).

## 7. Écrans (sections 12–20)

| Écran | Route | Contenu clé |
|---|---|---|
| Auth | `/login`, `/register` | Supabase Auth, formulaire minimal |
| Dashboard | `/dashboard` | "Bonjour [Prénom]", grand champ de chat, suggestions de requêtes |
| Chat (intégré au dashboard) | — | Réponses Gemini + `PlayerCard` cliquables, actions `[Voir] [Shortlist] [Comparer]` inline |
| Joueurs (recherche classique) | `/players` | Barre de recherche, filtres (nom, position, âge, nationalité, club, pied, valeur, score), tri, vue cartes/tableau |
| Fiche joueur | `/players/[id]` | Header (photo, nom, âge, nationalité, club, poste), score expliqué, potentiel si dispo, valeur marchande, onglets Profil / Statistiques / Historique / Transferts / Rapports / Notes, provenance des données visible |
| Shortlist | `/shortlist` | Joueurs, score, statut (À suivre / Intéressant / Prioritaire / Écarté), date d'ajout, dernière note |
| Rapports | `/reports`, `/reports/[id]` | Formulaire (contexte, note, points forts/faibles, commentaire, recommandation) + génération assistée par Gemini depuis texte libre |

Principes transverses (sections 19–20) appliqués à tous les écrans : densité d'information inspirée FM mais jamais surchargée, maximum 1 à 3 actions pour toute tâche principale, textes simples sans jargon, confirmation pour toute action de mutation, recherche toujours accessible depuis le header (repliée sous `sm:` — la recherche complète reste sur `/players`, à une touche via la navbar).

**Mise à jour post-MVP (demande explicite) :** la palette sombre premium d'origine (`#0F1720` fond, `#17212B` surface, `#1D2935` surface secondaire) a été remplacée par un thème clair unique — fond `#F8FAFC`, surfaces blanches, accent vert olive `#65A30D` (assombri depuis le lime `#A3E635` d'origine pour rester lisible sur fond clair). Toujours un seul thème fixe, pas de bascule clair/sombre. La navigation principale (Accueil/Joueurs/Shortlist/Rapports), auparavant des pastilles dans le header, est maintenant une navbar fixe en bas d'écran (`src/components/layout/bottom-nav.tsx`), seule barre de nav sur toutes les tailles d'écran — le header ne garde que logo, recherche et compte.

**Mise à jour post-MVP #2 (demande explicite, « vrai style Apple ») :** navigation desktop passée à une sidebar gauche repliable (`src/components/layout/left-sidebar.tsx`, icônes seules une fois repliée) — `bottom-nav.tsx` reste la seule nav en `md:`- (mobile). L'accent est repassé du vert olive au bleu marine `#14213D` (même rôle : `--primary`/`--ring`/`--sidebar-primary`/`--sidebar-ring`, un seul token source par usage). Coins arrondis élargis (`--radius` 0.625rem → 0.875rem) et boutons icône désormais circulaires. Pile de polices system-first (`-apple-system, BlinkMacSystemFont` avant Geist) pour rendre en SF Pro natif sur les appareils Apple. Traitement « verre » (glassmorphism) ajouté sur boutons, nav bars et fiche joueur — trois utilitaires dans `globals.css` (`.glass`, `.glass-on-color`, `.glass-surface`) combinant `backdrop-filter: blur()+saturate()`, fond translucide via `color-mix()`, liseré clair et reflet interne haut.

## 8. Authentification & multi-tenant

- **Supabase Auth** pour l'inscription/connexion (email + mot de passe pour le MVP).
- Un `User` ScoutPro est lié à `supabaseUserId` et rattaché à une `Organization` — créée automatiquement à l'inscription pour le MVP (une organisation personnelle par défaut). Le modèle est déjà prêt pour des invitations d'équipe plus tard, sans migration.
- Toute donnée métier (`Shortlist`, `Report`, `Conversation`) est rattachée à un `organizationId` et/ou `ownerId` pour permettre un futur mode multi-utilisateur par structure sans refonte.

## 9. Design system et librairies visuelles

Palette imposée reprise telle quelle (voir section 7 du tableau ci-dessus). Identité visuelle originale, inspirée de l'esprit Football Manager sans en reprendre les éléments graphiques.

Concernant les librairies mentionnées (Anime.js, Spline, Three.js, GSAP, Animate UI, UI Verse, Forge UI, Vengeance UI, motionsites.ai) : pour un outil de données dense comme ScoutPro, je recommande **GSAP** pour des micro-interactions et transitions légères (ouverture de fiche, apparition des `PlayerCard`), au-dessus de **Tailwind + shadcn/ui** comme socle. **Three.js et Spline (3D)** sont hors périmètre MVP — coût de développement et de performance élevé pour une valeur faible sur un outil de scouting orienté données. Les galeries de composants (**Animate UI, UI Verse, Forge UI, Vengeance UI, motionsites.ai**) serviront d'inspiration visuelle ponctuelle à l'Étape 8 (Dashboard) et à l'Étape 11 (recherche/fiches joueurs), pas comme dépendances du projet.

**Outillage Claude Code** : ce dépôt active désormais (`.claude/settings.json`) le plugin officiel **Frontend Design** (Anthropic) et **UI/UX Pro Max** pour la conception visuelle à partir de l'Étape 8, ainsi que **Superpowers** (méthodologie multi-agents) pour les étapes de build. Voir la note séparée livrée avec ce PR pour le détail de ce qui a été activé et ce qui ne l'a pas été.

## 10. Sécurité et conformité — rappels transverses

- Pas de contournement de CAPTCHA, d'authentification ou de protections anti-bot (section 25).
- Provenance obligatoire et visible sur toute donnée externe (section 7) ; jamais présentée comme générée par ScoutPro.
- Aucune donnée de paiement/facturation dans le MVP (hors périmètre, section 1).
- Le modèle Gemini n'a jamais d'accès direct à la base de données ; toutes les écritures passent par des fonctions serveur validées.

## 11. Traçabilité avec les objectifs du premier build (section 26)

| # | Objectif | Livré à l'étape |
|---|---|---|
| 1–2 | Créer un compte, arriver sur le Dashboard | Étape 4 (auth) + Étape 8 (dashboard) |
| 3–7 | Chat → Gemini → recherche Postgres → joueurs classés | Étape 9 (Gemini) + Étape 10 (chat + function calling) |
| 8 | Fiche joueur | Étape 11 |
| 9 | Ajouter à une shortlist | Étape 12 |
| 10 | Créer un rapport | Étape 12 |
| 11 | Comparer deux joueurs | Étape 10 (function `compare_players`) |
| 12 | Retrouver sa shortlist | Étape 12 |
| 13 | Synchroniser via le Data Provider | Étape 5–6 |

## 12. Prochaine étape

Cette proposition couvre l'intégralité de la demande de l'Étape 1. Aucune ligne de code applicatif n'a été écrite, conformément à la consigne. Si cette architecture est validée, l'Étape 2 (squelette Next.js) peut démarrer dans une prochaine session/PR.
