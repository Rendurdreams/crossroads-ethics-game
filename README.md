# Crossroads Ethics Game

Crossroads is an interactive React decision simulator for scenario-based ethics, group voting, and consequence tracking.

Players respond to difficult scenarios, compare choices, and watch how collective decisions shift the state of the world. The project explores how games and simulations can make ethical tradeoffs easier to discuss, teach, and reflect on.

## Why I built it

The goal was to create a lightweight teaching and discussion tool: part game, part classroom activity, part decision simulator. Instead of presenting ethics as abstract theory, Crossroads turns decisions into visible consequences and group dynamics.

## Core features

- Scenario packs for different worlds and decision themes
- Host and player flows
- Group voting and choice tracking
- World-state/consequence meters
- Timer and roster components
- Scenario cards and interactive UI panels
- Supabase-ready integration structure

## Tech stack

- React
- Vite
- JavaScript
- CSS Modules
- Supabase client
- Framer Motion / animation utilities

## Project structure

```text
src/pages/            Main app screens: landing, host, play, grading, create
src/components/       Reusable gameplay and UI components
src/lib/              Scenario data, room codes, scoring, state tracking
src/lib/scenarios/    Scenario packs
supabase/             Database/integration assets
```

## Running locally

```bash
npm install
npm run dev
```

## Notes

This is a portfolio prototype. Before treating it as production-ready, I would tighten authentication, remove generated art/assets that are not needed in source control, and add deployment documentation.
