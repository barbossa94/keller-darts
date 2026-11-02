# Keller Darts (Basement Darts)

301 darts scorer with an all-time leaderboard for the party basement. Installable offline web app (PWA), no server, no account. All data stays on the tablet.

## Features

- **Players** with a photo from the tablet camera (front/back camera, or pick an image). Players can be archived, their stats stay.
- **301** for any number of players. Straight out or double out, 1 to 4 legs to win, throwing order by tapping, shuffle, rematch.
- **Scoring**: big keypad for the 3-dart total, quick keys (26, 41, 45, 60, 100, 140), Bust and Checked out keys, or dart by dart input with Double/Triple. Undo works across legs.
- **Checkout hints** for every finish (for example 121: T20 T15 D8).
- **Celebrations**: 180 slam, Ton+ flash, winner screen with confetti and new house records.
- **Leaderboard**: games, wins, win %, 3-dart average, fair rating, max 3-dart score, best checkout, 180s. Sortable, all time or this year.
- **Hall of Fame** on the home screen: max 3-dart score (highest total of three darts in one turn, max 180), highest checkout, best game average, most 180s, longest win streak.
- **Player profile**: average-per-game chart, head to head record, 100+/140+/180 counts.
- **Backup**: one JSON file with players, photos and games. Restore it on the same or a new tablet.
- Keeps the screen awake during a game.
- **German / English** switch at the top right. Starts in German, the choice is remembered.
- Colours from the MiningMartin brand palette (`palettes.json`, dark theme). Logo and app icons are in `icons/`.

## The fair rating

`rating = (legs × player average + 5 × house average) / (legs + 5)`

Every player starts with 5 "virtual legs" at the basement's average. A newcomer with one lucky game sits close to the house average. A regular's rating is basically their real average. Players with fewer than 3 legs are marked **Rookie** and are ranked below everyone else. The raw 3-dart average is shown next to the rating. Both numbers can be changed in `js/stats.js` (`PRIOR_LEGS`, `ROOKIE_LEGS`).

## Getting it onto the tablet

**Live address: https://barbossa94.github.io/keller-darts/**

The app is hosted on GitHub Pages (repo `barbossa94/keller-darts`, branch `main`). Only the app code is there. Players, photos and games never leave the device: every phone or tablet keeps its own data. The camera and offline mode need HTTPS, which Pages provides. After the first visit the app runs offline.

To publish a change: commit and push to `main`, wait about a minute, then reopen the app twice (the first open fetches the update). Raise `VERSION` in `sw.js` with every release.

1. Open the address on the tablet or phone:
   - **Android (Chrome)**: menu ⋮ → *Install app* / *Add to Home screen*.
   - **iPhone / iPad (Safari)**: Share → *Add to Home Screen*.
   - **Windows (Edge/Chrome)**: install icon in the address bar.
2. Start it from the home screen icon, allow the camera when it asks, and play a test game.
3. Make a backup under **Settings → Download backup** now and then.

## Run it locally on a PC

```
python -m http.server 8765 --directory basement-darts
```

Then open http://localhost:8765.

## Files

```
index.html, manifest.webmanifest, sw.js   app shell, install info, offline cache
css/app.css                               theme and layout
js/app.js                                 router
js/db.js                                  IndexedDB storage
js/camera.js                              camera capture and photo resize
js/x01.js                                 301 rules, bust, checkout hints
js/stats.js                               averages, rating, records
js/fx.js                                  sounds, confetti, 180 overlay
js/i18n.js                                German and English texts
js/ui/*.js                                screens
```
