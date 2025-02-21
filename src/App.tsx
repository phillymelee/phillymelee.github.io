// App.tsx

import { useEffect, useState } from "react";
import logo from "./assets/misc/logo.png";
import "./App.css";
import { getRanks } from "./utils/fetchRanks";
import {
  getCharacterImage,
  getRankClass,
  getRankIcon,
} from "./utils/getStyles";
import { addPlayer } from "./utils/addPlayer";
import { IAddPlayerResponse, IRankInfo } from "./utils/interfaces";

const refreshRate = 15; // minutes between updates
const updateOnMinutes = [1, 16, 31, 46]; // minutes of every hour to check if we should update

function App() {
  const [ranks, setRanks] = useState<IRankInfo[]>();
  const [result, setResult] = useState<IAddPlayerResponse>();

  // Player Input
  const Input = () => {
    const [waiting, setWaiting] = useState(false);
    const handleKeyDown = async (event: any) => {
      if (event.key === "Enter") {
        setWaiting(true);
        const response = await addPlayer(event.target.value);
        setWaiting(false);
        setResult(response);
      }
    };

    return (
      <span className="playerInputBoxContainer">
        <input
          disabled={waiting}
          className="playerInputBox"
          type="text"
          onKeyDown={handleKeyDown}
        />
        {waiting && (
          <span className="playerInputSpinnerContainer">
            <div className="playerInputSpinner"></div>
          </span>
        )}
      </span>
    );
  };

  // Helper for rendering character icons
  const renderCharacterIcon = (character: IRankInfo["character"]) => {
    switch (character) {
      case "FUDGE":
        return (
          <a href={require("./assets/misc/fudgington.png")}>
            <img
              className="playerCharacterIcon"
              alt={character}
              src={`${getCharacterImage(character)}`}
            ></img>
          </a>
        );
      case "IGHT":
        return (
          <a href={require("./assets/misc/ight.png")}>
            <img
              className="playerCharacterIcon"
              alt={character}
              src={`${getCharacterImage(character)}`}
            ></img>
          </a>
        );
      default:
        return (
          <img
            className={`playerCharacterIcon ${character}`}
            alt={character}
            src={`${getCharacterImage(character)}`}
          ></img>
        );
    }
  };

  const onHoverStart = (
    e: React.MouseEvent<HTMLElement>,
    eloDelta: number
  ): void => {
    if (eloDelta !== 0) {
      const span = document.createElement("span");
      const isPositive = eloDelta > 0;
      span.className = `eloDelta ${isPositive ? "positive" : "negative"}`;
      span.innerText = `${isPositive ? "+" : ""}${Math.round(eloDelta)}`;
      e.currentTarget.appendChild(span);
    }
  };

  const onHoverEnd = (e: React.MouseEvent<HTMLElement>): void => {
    const span = e.currentTarget.querySelector(".eloDelta");
    if (span) {
      e.currentTarget.removeChild(span);
    }
  };

  const renderChangeIcon = (change: IRankInfo["rankChange"]) => {
    switch (change) {
      case "up":
        return (
          <span className="playerRatingChangeIcon playerRatingChangeIconUp">
            <i className="fas fa-arrow-up"></i>
          </span>
        );
      case "down":
        return (
          <span className="playerRatingChangeIcon playerRatingChangeIconDown">
            <i className="fas fa-arrow-down"></i>
          </span>
        );
      case "new":
        return (
          <span className="playerRatingChangeIcon playerRatingChangeIconNew">
            ✨
          </span>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (ranks === undefined) {
      getRanks().then((ranks) => setRanks(ranks));
    }

    const interval = setInterval(() => {
      const now = new Date();
      // Check if the current minute is 1 minute after the 15th minute.
      // The server updates the ranks every 15 minutes, so we should check 1 minute after each update
      // to allow time for the server to processing
      if (updateOnMinutes.includes(now.getMinutes())) {
        getRanks().then((ranks) => setRanks(ranks));
      }
    }, 1000 * 60); // Run every minute
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [ranks]);

  if (ranks === undefined) {
    return (
      <div className="App logoView">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
      </div>
    );
  }

  let resultDiv;
  if (result !== undefined) {
    const success = result.status === 200;
    resultDiv = (
      <div
        className={`submissionResult ${
          success ? "successResult" : "failResult"
        }`}
      >
        {result.message}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Philly Melee Leaderboard</h1>
        <h2 className="updated">
          Updates automatically every {refreshRate} minutes
        </h2>
      </header>
      <div className="App-body">
        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th className="playerRankHead">Rank</th>
                <th className="playerInfoHead">Player</th>
                <th className="playerRatingHead">Rating</th>
                <th className="playerRatioHead">W/L</th>
                <th className="playerCharacterHead">Main</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((playerInfo, index) => {
                // Check if the previous player was Porkers. If so, we can put the porkers line above this player.
                // We would prefer to simply check if this player is Porkers, but strange CSS bugs on mobile make this
                // approach easier.
                // TODO: Make this less janky
                const shouldHavePorkersLine =
                  index !== 0 && ranks[index - 1].code === "PORK#582"
                    ? "porkersLine"
                    : "";
                return (
                  <tr
                    className={`row ${shouldHavePorkersLine}`}
                    key={playerInfo.code}
                  >
                    <td className="playerRankCell">
                      <div className="playerRank">
                        <span className="playerRankHash">#</span>
                        <span className="playerRankValue">{`${
                          index + 1
                        }`}</span>
                      </div>
                    </td>
                    <td className="playerInfoCell">
                      <div className="playerInfo">
                        <a
                          className="playerInfoSlippiLink"
                          href={`https://slippi.gg/user/${playerInfo.code.replace(
                            "#",
                            "-"
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span className="playerInfoTag">
                            {playerInfo.tag}
                          </span>
                          <span className="playerInfoCode">
                            {playerInfo.code}
                          </span>
                        </a>
                      </div>
                    </td>
                    <td
                      className="playerRatingCell"
                      // Render elo delta on hover
                      onMouseEnter={(e) => {
                        onHoverStart(e, playerInfo.eloDelta);
                      }}
                      onMouseLeave={(e) => {
                        onHoverEnd(e);
                      }}
                    >
                      <div className="playerRating">
                        <img
                          className={`playerRatingIcon ${playerInfo.rank.toLowerCase()}`}
                          src={getRankIcon(playerInfo.rank)}
                          alt={playerInfo.rank}
                        ></img>
                        <span
                          className={`playerRatingElo ${getRankClass(
                            playerInfo.elo,
                            playerInfo.rank
                          )}`}
                        >
                          {Math.round(playerInfo.elo)}
                        </span>
                        {renderChangeIcon(playerInfo.rankChange)}
                      </div>
                    </td>
                    <td className="playerRatioCell">
                      <div className="playerRatio">
                        <span className="playerRatioWins">
                          {playerInfo.wins}
                        </span>
                        <span className="playerRatioDivider">/</span>
                        <span className="playerRatioLosses">
                          {playerInfo.losses}
                        </span>
                      </div>
                    </td>
                    <td className="playerCharacterCell">
                      <div className="playerCharacter">
                        {renderCharacterIcon(playerInfo.character)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="playerInput">
          Add Player:<Input></Input>
        </div>
        {resultDiv}
      </div>

      <div className="footer">
        Made by <span className="skaht">skaht</span> -{" "}
        <span className="icons">
          <a
            href="https://github.com/phillymelee/phillymelee.github.io"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-github social-icon"></i>
          </a>
          <a
            href="https://discord.gg/zjKk9vEQNp"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-discord social-icon"></i>
          </a>
        </span>
        <br />
      </div>
    </div>
  );
}

export default App;
