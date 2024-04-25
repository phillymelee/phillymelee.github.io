// App.tsx

import { useEffect, useState } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import { getRanks } from "./utils/fetchRanks";
import {
  getCharacterImage,
  getRankClass,
  getRankIcon,
} from "./utils/getStyles";
import { addPlayer } from "./utils/addPlayer";
import { IAddPlayerResponse, IRankInfo } from "./utils/interfaces";

const refreshRate = 15; // minutes

function App() {
  const [ranks, setRanks] = useState<IRankInfo[]>();
  const [result, setResult] = useState<IAddPlayerResponse>();

  // Player Input
  const Input = () => {
    const handleKeyDown = async (event: any) => {
      if (event.key === "Enter") {
        const response = await addPlayer(event.target.value);
        setResult(response);
      }
    };

    return <input className="inputBox" type="text" onKeyDown={handleKeyDown} />;
  };

  useEffect(() => {
    if (ranks === undefined) {
      getRanks().then((ranks) => setRanks(ranks));
    }

    const interval = setInterval(() => {
      const now = new Date();
      // Check if the current minute is the 16th minute of the hour.
      // We update the cache every 15th minute, so we should give an extra minute to process
      if (now.getMinutes() % (refreshRate + 1) === 0) {
        getRanks().then((ranks) => setRanks(ranks));
      }
    }, 1000 * 60); // Run every minute
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [ranks]);

  if (ranks === undefined)
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
      </div>
    );

  let resultDiv;
  if (result !== undefined) {
    const success = result.status === 200;
    resultDiv = (
      <div className={success ? "successResult" : "failResult"}>
        {result.message}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="title">Philly Melee Leaderboard</div>
        <div className="updated">
          Updates automatically every {refreshRate} minutes
        </div>
      </header>
      <div className="App-body">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Rank</th>
              <th>Rating</th>
              <th>W/L</th>
              <th>Main</th>
            </tr>
          </thead>
          <tbody>
            {ranks.map((rankInfo) => {
              return (
                <tr className="row" key={rankInfo.code}>
                  <td>
                    <div>{rankInfo.tag}</div>
                    <div className="playerCode">{rankInfo.code}</div>
                  </td>
                  <td>
                    <img
                      className="rankIcon"
                      src={getRankIcon(rankInfo.rank)}
                      alt={rankInfo.rank}
                    ></img>
                  </td>
                  <td className={getRankClass(rankInfo.elo)}>{rankInfo.elo}</td>
                  <td>
                    <span className="wins">{rankInfo.wins}</span>/
                    <span className="losses">{rankInfo.losses}</span>
                  </td>
                  <td>
                    <img
                      className="characterIcon"
                      alt={rankInfo.character}
                      src={`${getCharacterImage(rankInfo.character)}`}
                    ></img>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="input">
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
            href="https://twitter.com/skaht12"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-twitter social-icon"></i>
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
