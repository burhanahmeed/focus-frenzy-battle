

## Plan: Add Reaction Target Mini-Game to Focus Arena

### What We're Building
A click-the-target mini-game that runs during the focus session. Glowing circles spawn at random positions every 3-8 seconds. Players click them to score points. Missed targets fade away. Stats shown on the result screen.

### New Files

1. **`src/hooks/useReactionGame.ts`** — Hook managing target spawning, hit/miss tracking, and average reaction time. Spawns targets at random intervals (3-8s) at random positions within a container. Each target has a 2s lifespan before auto-dismissing (counted as miss).

2. **`src/components/ReactionTarget.tsx`** — Animated glowing circle component using Framer Motion. Appears with a scale-in animation, pulses, and shrinks out when clicked or expired. Shows a "+1" score pop on hit.

### Modified Files

3. **`src/components/FocusArena.tsx`** — Integrate `useReactionGame` hook. Add a target area container below the timer. Display live score (hits) and current streak. Targets render inside a bounded area.

4. **`src/components/ResultScreen.tsx`** — Add a stats card showing: total targets hit, targets missed, accuracy %, and average reaction time (ms). Display alongside existing time stats.

5. **`src/types/game.ts`** — Add `ReactionStats` interface: `{ hits: number, misses: number, avgReactionTime: number }`.

6. **`src/pages/GameRoom.tsx`** — Thread reaction stats from FocusArena to ResultScreen via state.

### Game Flow
- Targets start spawning ~3 seconds after game begins
- Random position within a defined play area (centered, ~400x300px)
- Random interval between spawns (3-8 seconds)
- Each target lives for 2 seconds before fading
- Clicking a target: score +1, satisfying animation, track reaction time
- Missing a target: miss +1, subtle fade out
- All stats passed to result screen when game ends

