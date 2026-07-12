# Welcome to your Lovable project

## Box & Bust

The app includes **Box & Bust** at `/game` — a single-player, turn-based container
shipping strategy game. You run a container line on the Asia–Europe trade for 24
rounds: set your freight rate, charter ships (they arrive with a delay and carry a
minimum commitment), order newbuilds (they deliver 6 rounds later), and try to stay
profitable through demand shocks, port congestion, and competitor-driven rate cycles.
The end-of-game debrief scores your profit, service level, and a **bullwhip ratio**
showing whether your capacity decisions amplified the market cycle.

- Game engine (pure, deterministic per seed): `src/lib/game/`
- UI: `src/pages/GamePage.tsx` and `src/components/game/`
- Progress is saved to `localStorage`, so you can leave and resume a game.

## Project info

**URL**: https://lovable.dev/projects/bd191e28-b0a8-4ddb-854f-107296e9e185

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bd191e28-b0a8-4ddb-854f-107296e9e185) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bd191e28-b0a8-4ddb-854f-107296e9e185) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
