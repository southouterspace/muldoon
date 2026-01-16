# PRD: Players Table and User Linking

## Introduction

Create a Players table and allow users to link themselves to one or more players after authenticating via magic link. This enables personalized ordering experiences where users can quickly select their linked player info when ordering customized items (jerseys, etc.).

## Goals

- Create a Players table to store player information (first name, last name, jersey number)
- Allow users to link to multiple players (e.g., a parent ordering for multiple kids)
- Enable users to create new players or select existing ones during their first login
- Skip player selection on subsequent logins if user is already linked to at least one player
- Provide admins with read-only visibility into user-player relationships

## User Stories

### US-001: Create Players database table
**Description:** As a developer, I need a Players table to store player information.

**Acceptance Criteria:**
- [ ] Create `Player` table with columns: `id` (uuid, primary key), `firstName` (text), `lastName` (text), `jerseyNumber` (integer)
- [ ] Add `createdAt` and `updatedAt` timestamp columns
- [ ] Migration runs successfully
- [ ] Typecheck passes

### US-002: Create UserPlayer junction table
**Description:** As a developer, I need a junction table to support many-to-many relationships between users and players.

**Acceptance Criteria:**
- [ ] Create `UserPlayer` table with `userId` (foreign key to User.id) and `playerId` (foreign key to Player.id)
- [ ] Add composite primary key on (userId, playerId)
- [ ] Add `createdAt` timestamp column
- [ ] Migration runs successfully
- [ ] Typecheck passes

### US-003: Add Player and UserPlayer TypeScript types
**Description:** As a developer, I need TypeScript interfaces for the new tables.

**Acceptance Criteria:**
- [ ] Add `Player` interface to `lib/types/database.ts`
- [ ] Add `UserPlayer` interface to `lib/types/database.ts`
- [ ] Typecheck passes

### US-004: Create player selection page
**Description:** As a user logging in for the first time, I want to see a player selection page so I can link myself to a player.

**Acceptance Criteria:**
- [ ] Create `/onboarding/player` page (or similar route)
- [ ] Page displays list of existing players (first name, last name, jersey number)
- [ ] Page has "Add New Player" button/option
- [ ] User can select one or more existing players to link to
- [ ] User can proceed only after selecting/adding at least one player
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Create add-player form component
**Description:** As a user, I want to add a new player if my player doesn't exist in the list.

**Acceptance Criteria:**
- [ ] Form has fields: first name (required), last name (required), jersey number (required)
- [ ] Form validates all fields are filled
- [ ] Jersey number accepts only integers
- [ ] On submit, creates player AND links it to current user
- [ ] Form shows success state and returns user to selection view
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Redirect new users to player selection after auth
**Description:** As a user completing magic link authentication, I should be redirected to player selection if I have no linked players.

**Acceptance Criteria:**
- [ ] Modify auth callback to check if user has any linked players
- [ ] If no linked players, redirect to `/onboarding/player` instead of `/`
- [ ] If user has linked players, redirect to `/` as normal
- [ ] Typecheck passes

### US-007: Protect player selection page
**Description:** As a developer, I need to ensure only authenticated users without player links see the onboarding page.

**Acceptance Criteria:**
- [ ] Unauthenticated users are redirected to login
- [ ] Users who already have linked players are redirected to home
- [ ] Typecheck passes

### US-008: Allow linking to multiple players
**Description:** As a user (e.g., a parent), I want to link myself to multiple players.

**Acceptance Criteria:**
- [ ] Player selection UI supports selecting multiple players
- [ ] "Continue" button links all selected players to user
- [ ] User can add multiple new players in sequence before continuing
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-009: Admin view of user-player links (read-only)
**Description:** As an admin, I want to see which users are linked to which players.

**Acceptance Criteria:**
- [ ] Add "Players" section to admin dashboard (or add to existing admin view)
- [ ] Display table showing: player name, jersey number, linked user emails
- [ ] No edit/delete functionality (read-only)
- [ ] Only visible to admin users
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: The system must create a `Player` table with columns: `id` (uuid), `firstName` (text), `lastName` (text), `jerseyNumber` (integer), `createdAt`, `updatedAt`
- FR-2: The system must create a `UserPlayer` junction table with columns: `userId`, `playerId`, `createdAt` and composite primary key
- FR-3: When a user completes magic link auth, the system must check if they have any linked players
- FR-4: If user has no linked players, redirect to player selection page; otherwise redirect to home
- FR-5: The player selection page must display all existing players with first name, last name, and jersey number
- FR-6: Users must be able to select multiple existing players to link to their account
- FR-7: Users must be able to create new players via a form with first name, last name, and jersey number fields
- FR-8: Creating a new player must automatically link that player to the current user
- FR-9: Multiple users can be linked to the same player (no uniqueness constraint on playerId in UserPlayer)
- FR-10: The player selection page must require at least one player to be selected/created before proceeding
- FR-11: Admins must be able to view a read-only list of players and their linked users

## Non-Goals

- No ability for admins to edit or delete user-player links
- No ability for users to unlink from players after initial setup
- No player profile editing after creation
- No player search/filter on selection page (can be added later)
- No import/bulk upload of players
- No player photos or additional player metadata

## Design Considerations

- Player selection page should be simple and mobile-friendly
- Existing players should be displayed in a scannable list (consider alphabetical sort by last name)
- Multi-select could use checkboxes or a "chips" pattern
- Add new player form could be inline or a modal
- Consider showing jersey number prominently for quick identification

## Technical Considerations

- Use Supabase for database operations (consistent with existing codebase)
- Junction table allows the many-to-many relationship required by 1B + 5B answers
- Auth callback modification should happen after session exchange but before final redirect
- Consider using a middleware or layout check for the onboarding protection logic
- Player UUID allows for future flexibility (unlike auto-increment integer)

## Success Metrics

- Users can complete player selection flow in under 60 seconds
- 100% of new users are routed through player selection before accessing main app
- Zero users exist with no linked players after using the app

## Open Questions

- Should there be a way for users to add more players later (after initial onboarding)?
- Should player jersey numbers be unique within the system or can duplicates exist?
- Should the add-player form check for potential duplicates before creating?
