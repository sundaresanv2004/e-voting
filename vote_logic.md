# Voting Logic Specifications

This document serves as the master specification for the voting logic in the E-Voting application. Because the voting process involves numerous settings, edge cases, and security requirements, we will document the exact logic for each step here before implementing it in code.

## 1. Initial Access Code Validation

When a user enters an access code on the `/auth/vote` page, the system must validate the code and determine the election and category contexts.

### Step 1.1: Resolve Election and Category from Code
The code entered by the user could be either a general Election Code or a specific Category Code.
- **Action**: Query the database for the provided `code` (case-insensitive/uppercase matching depending on schema definition).
  - Check if the `code` matches an `Election.code`. If found:
    - The voter is accessing the **General Election**.
    - Set Context: `Election` = found election, `Category` = `null`.
  - Check if the `code` matches an `ElectionCategory.code`. If found:
    - The voter is accessing a **Specific Category** (e.g., a specific "house" in a school election).
    - Set Context: `Election` = the related election, `Category` = found category.
- **Failure**: If the code matches neither an Election nor an ElectionCategory:
  - Return Error: "Invalid access code. Please check your code and try again."

### Step 1.2: Check Online Voting Settings
Once the election is resolved, we must verify if online voting is permitted.
- **Action**: Check `election.settings.allowOnlineVoting`.
- **Failure**: If `allowOnlineVoting` is `false`:
  - Return Error: "Voting is disabled. Please contact your organization or election administrator."

### Step 1.3: Validate Election Timeframe
The system must ensure the election is currently active based on its scheduled start and end times.
- **Action**: Compare the current time (`now`) against `election.startTime` and `election.endTime`.
### Step 1.4: Admin Block
The system must prevent logged-in administrators (or any authenticated org users) from accessing the voting portal to prevent session confusion.
- **Action**: Check if a user session exists via `auth`.
- **Failure**: If a session exists:
  - Return Error/Toast: "Administrators cannot vote while logged in. Please log out first."
  - Disable the code input.

### Step 1.5: Paused Election — Allow Entry, Show In-Portal Dialog
A **PAUSED** election is a special state: the admin may be making last-minute changes. The voter should NOT be blocked at the code-entry step (`/auth/vote`). They are allowed in, but immediately informed once they reach the portal.
- **Action**: Do NOT check for `PAUSED` status in `validateElectionCodeAction`. Allow the voter through to `/vote/[code]`.
- **Server Page (`/vote/[code]/page.tsx`)**: Resolve the election normally. If the election status is `PAUSED`, render the portal with an `isPaused={true}` flag — do **not** return `notFound()`.
- **Portal Entry (Lobby screen)**: On mount, if `isPaused` is `true`, immediately open the **Paused Dialog** instead of the normal welcome flow.
- **Paused Dialog UI**: Display two action buttons:
  - **"Exit Election"**: Exit fullscreen, clear all local voter session data, and navigate to `/auth/vote`.
  - **"Retry"**: Re-check the election status via a server action. If still paused, keep the dialog open with a toast notification. If now active, dismiss the dialog and allow the voter to proceed normally.
- **Pre-Submit Paused Check**: Immediately before `submitBallotAction` is called (when the voter clicks "Cast Ballot"), the portal must re-check the election status. If it is `PAUSED`, abort the submission, exit the ballot interface, reset all local vote data (votes, voter state, ballot data), and open the Paused Dialog. This ensures the voter must re-start from scratch after the pause is lifted, accounting for any changes the admin may have made.
- **Refresh/Back Navigation while Paused**: Because the page is a server component, a hard refresh will re-fetch the server data. If the election is still `PAUSED`, the `isPaused` flag will be true again and the Paused Dialog will re-open. All local state is lost on refresh, so the voter automatically returns to the clean entry state — no additional logic is required.

## 2. Portal Configuration

Once the code is validated and the portal loads, we configure the UI based on settings.

### Step 2.1: Organization Branding
- **Action**: Check `OrganizationSettings.allowCustomBranding`.
- **Behavior**: If `true`, display the organization's logo in the voting portal header. If `false` or missing, hide the logo.

### Step 2.2: Voter Authorization (Voter ID)
- **Action**: Check `ElectionSettings.authorizeVoters`.
- **Behavior**: 
  - If `true`, the user MUST pass the Voter Identification step.
  - If `false`, the Voter Identification step is skipped, allowing an anonymous ballot.

## 3. Voter Authentication & Category Enforcement

When `authorizeVoters` is true, the user submits a `uniqueId`.

### Step 3.1: Verify Voter Unique ID
- **Action**: Query the `Voter` table where `electionId` matches the current election, and `uniqueId` matches the input.
- **Failure**: If no voter is found:
  - Return Error: "Invalid Voter ID. Please check your ID and try again."

### Step 3.2: Enforce Category Assignments
A Voter may or may not be assigned to a specific Category (`Voter.categoryId`).
- **Rule A (Assigned Voter)**: If `Voter.categoryId` is NOT null:
  - The voter MUST have entered the portal using that specific Category's access code.
  - **Failure**: If they used the general Election code or a different Category code, return Error: "You are assigned to a specific category. Please use your assigned category code to access your ballot."
- **Rule B (Unassigned Voter)**: If `Voter.categoryId` IS null:
  - The voter is allowed to vote in whatever context they entered (General Election OR a specific Category).
  - **Action**: Proceed without error. When the ballot is eventually submitted, the `Ballot` will record the `categoryId` of the portal they used, but the `Voter` record's `categoryId` will remain null.

### Step 3.3: Enforce Vote Count Limits
- **Action**: Check `ElectionSettings.allowMultipleVotes` and `maxVotesPerUser`.
- **Rule**: If `allowMultipleVotes` is `false`, the voter may only cast **1 ballot**, regardless of what `maxVotesPerUser` is set to. The `maxVotesPerUser` field is ignored in this case.
- **Rule**: If `allowMultipleVotes` is `true`, the voter may cast up to `maxVotesPerUser` ballots.
- **Failure**: If `voter.ballotCount >= effectiveMaxVotes`, return Error: "You have already cast your ballot for this election."

### Step 3.4: Load Ballot Roles (Category-Scoped Role Filtering)
Role visibility on the ballot is determined by how the voter entered the portal (general code vs. category code).

- **General Election Code Entry** (`category` context is `null`):
  - Fetch **ALL** `ElectionRole` records for the election, ordered by `order` ascending.
  - The voter sees every role in the election.

- **Category Code Entry** (`category` context is NOT `null`, e.g., "House-1"):
  - Fetch only the `ElectionRole` records that are **linked to that specific `ElectionCategory`** via the many-to-many `categories` relation on `ElectionRole`.
  - The voter sees only the roles assigned to their category. This allows the admin to create roles that are common to the whole election AND roles that are exclusive to specific categories.
  - **Implementation**: In the Prisma query, filter `roles` with `where: { categories: { some: { id: categoryId } } }`.

- **Candidate Query**: Only include candidates where `deletedAt` is null (soft-delete aware).

- **UI Role Filtering (after fetch)**:
  - Any role that has **zero active candidates** is silently skipped in the ballot UI.
  - If, after filtering, there are **no roles left** (none configured, or all have 0 candidates), show the **"No data or candidates to vote"** empty state with an **Exit** button.

## 4. Ballot Display Rules

These settings control how the ballot is visually presented to the voter.

### Step 4.1: Candidate Profile Images (`showCandidateProfiles`)
- **If `true`**: Show the candidate's profile photo on their card. If no photo is uploaded, show the candidate's initial (first letter of their name) as a styled placeholder.
- **If `false`**: Show only the candidate's first-name initial as a placeholder. Never show a profile image, even if one exists.

### Step 4.2: Candidate Symbol Images (`showCandidateSymbols`)
- **If `true`**: Show the candidate's election symbol image on their card. If no symbol is uploaded, show an empty dashed placeholder box.
- **If `false`**: Do not render the symbol area at all. The name is always shown.

### Step 4.3: NOTA (None of the Above) (`allowNota`)
- **If `true`**: Append a special "NOTA" card at the very end of the candidates list for each role. This card has a distinct design (dashed border, cross icon). When submitted, the vote is recorded with a `null` `candidateId`.
- **If `false`**: The NOTA card is never shown.
- **Rule**: NOTA must **always** be the last card, even when `shuffleCandidates` is `true`. It is appended only **after** the shuffle is applied.

### Step 4.4: Shuffle Candidates (`shuffleCandidates`)
- **If `true`**: The candidate cards are shuffled using a deterministic, per-voter, per-role hash (seeded with `election.id + voter.id + role.id + candidate.id`) so each voter sees a different order, but the order is stable on refresh.
- **If `false`**: Candidates are shown in their defined order.
- **Rule**: NOTA is always exempt from shuffling and remains last.

- **Failure Cases**:
  - If `now < election.startTime`:
    - Return Error: "Elections vote starts on [Date] at [Time]." (Format the date and time beautifully for the user).
  - If `now > election.endTime`:
    - Return Error: "This election has ended." (Do not show the end date/time, just state it has ended).

---
*(Further logic steps will be added here as we progress through the voting flow implementation.)*
