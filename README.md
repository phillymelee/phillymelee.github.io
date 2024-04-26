# [phillymelee.github.io](https://phillymelee.github.io/)

## Overvier

A simple webpage that displays the [Slippi](https://slippi.gg/) ranks of participating Philadelphia melee players.

If you are interested in the community, join the [Philly Melee Discord](https://discord.gg/zjKk9vEQNp)!

## Repository Breakdown

This repo only contains the front-end code. It was made using [Create React App](https://create-react-app.dev/).

To run it locally:

1. Clone the repo.
1. Ensure you have [Node.js](https://nodejs.org/en/download/) installed (I used v18).
1. From the root of the repo, run `npm install`.
1. From the root of the repo, run `npm start`.

For the backend service, I used [Firebase](https://firebase.google.com/) cloud storage and functions. Every 15 minutes, it automatically fetches each registered player's rank. For now, I left the code out of this repo, but if people are interested I can potentially add it to the repo.

## Contributing

If you would like to contribute, feel free to open a PR. If your improvement requires changes to the backend service, please contact me directly on discord (username: `skaht`).
