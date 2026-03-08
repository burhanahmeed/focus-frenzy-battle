

## Plan: Game Mode Selection in Lobby

### Overview
Add a game mode picker to the Lobby so both players must agree on which mini-game to play before readying up. Five game modes, each with its own in-game activity component rendered inside FocusArena.

### Game Modes

| Mode | Description | Activity |
|------|-------------|----------|
| Reaction | Click glowing targets (existing) | ReactionTarget |
| Typing | Type words before they disappear | New TypingChallenge component |
| Math | Solve arithmetic problems | New MathBlitz component |
| Reading | Read passages, answer comprehension questions | New ReadingChallenge component |
| Wordle | Guess a 5-letter word within the time limit | New WordleGame component |

### Changes

**1. `src/types/game.ts`**
- Add `GameMode` type: `'reaction' | 'typing' | 'math' | 'reading' | 'wordle'`
- Add a `GAME_MODES` config array with label, icon, and description for each mode

**2. `src/components/Lobby.tsx`**
- Add `selectedMode` and `onSelectMode` props
- Add a new "GAME MODE" card section (similar to duration picker) showing 5 selectable game mode cards with icon + label
- Both players must select the same mode (for now, host picks and opponent sees it)

**3. `src/pages/GameRoom.tsx`**
- Add `gameMode` state (default `'reaction'`)
- Pass it to Lobby and FocusArena
- Reset on rematch

**4. `src/components/FocusArena.tsx`**
- Accept `gameMode` prop
- Conditionally render the appropriate activity component based on mode
- Each activity reports its own stats via `onReactionStats` (generalized to `onGameStats`)

**5. New activity components** (one file each):
- `src/components/games/TypingChallenge.tsx` — Random words appear, player types them. Track WPM and accuracy.
- `src/components/games/MathBlitz.tsx` — Simple arithmetic (e.g. "7 × 8"), player inputs answer. Track correct/wrong and speed.
- `src/components/games/ReadingChallenge.tsx` — Short passages with multiple-choice comprehension questions. Track correct answers.
- `src/components/games/WordleGame.tsx` — Classic 5-letter word guess with colored tile feedback. Track attempts and solve time.

**6. `src/types/game.ts`**
- Generalize `ReactionStats` to a union or extend with mode-specific fields, or keep a generic `GameStats` with common fields (score, accuracy, avgTime) that all modes populate.

### Flow
1. Player enters lobby, sees game mode selector + duration selector
2. Player picks a mode (cards highlight on selection)
3. Both players ready up (game mode shown to both)
4. Countdown starts, then FocusArena renders the selected activity
5. Stats from the activity are shown on the result screen

