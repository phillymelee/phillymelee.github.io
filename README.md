# [phillymelee.github.io](https://phillymelee.github.io/)

## Overview

A simple webpage that displays the [Slippi](https://slippi.gg/) ranks of participating Philadelphia melee players.

If you are interested in the community, join the [Philly Melee Discord](https://discord.gg/zjKk9vEQNp)!

## Repository Breakdown

This front-end code for the repo is located at the root of the repo. It was made using [Create React App](https://create-react-app.dev/).

To run it locally:

1. Clone the repo.
1. Ensure you have [Node.js](https://nodejs.org/en/download/) installed (I used v18).
1. From the root of the repo, run `npm install`.
1. From the root of the repo, run `npm start`.

For the backend service, I used [Firebase](https://firebase.google.com/) cloud storage and functions. You can find the code in the `firebase` directory.

Lastly, there is a simple [Discord](https://discord.com/) bot in the `discord` directory. It is used to fetch and display the latest rank data in a Discord channel. Note: It currently uses [discord.js](https://www.npmjs.com/package/discord.js?activeTab=readme) v13 to be compatible with Node 16. This is because of a limitation with my local environment that I am running the bot on.

## Contributing

If you would like to contribute, please feel free to open a PR. If you have any questions, you can contact me directly on discord (username: `skaht`).
