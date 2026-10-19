import { useState } from "react";
import MochiCanvas from "./mochi/MochiCanvas";
import "./App.css";

const EMOTES = [
  "love",
  "surprised",
  "proud",
  "wink",
  "yawn",
  "happy",
  "annoyed",
] as const;

const STATES = [
  "idle",
  "working",
  "thinking",
  "searching",
  "approval",
  "question",
  "error",
  "finished",
  "ratelimit",
  "sleeping",
  "dizzy",
  "listening",
] as const;

type Tab = "emotes" | "states" | "behaviors";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("emotes");
  const [rollTurns, setRollTurns] = useState(1);
  const [replay, setReplay] = useState(0);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const replayAll = () => setReplay((n) => n + 1);

  return (
    <div className="app">
      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "emotes" ? "active" : ""}`}
            onClick={() => handleTabChange("emotes")}
          >
            Emotes
          </button>
          <button
            className={`tab ${activeTab === "states" ? "active" : ""}`}
            onClick={() => handleTabChange("states")}
          >
            States & Colors
          </button>
          <button
            className={`tab ${activeTab === "behaviors" ? "active" : ""}`}
            onClick={() => handleTabChange("behaviors")}
          >
            Behaviors
          </button>
          <button className="tab replay" onClick={replayAll}>
            Replay all
          </button>
        </div>

        {activeTab === "emotes" && (
          <div className="grid">
            {EMOTES.map((emote) => (
              <div key={emote} className="card">
                <div className="canvas-wrap">
                  <MochiCanvas expanded={true} emote={emote} replay={replay} />
                </div>
                <span className="label">{emote}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "states" && (
          <div className="grid">
            {STATES.map((state) => (
              <div key={state} className="card">
                <div className="canvas-wrap">
                  <MochiCanvas expanded={true} state={state} replay={replay} />
                </div>
                <span className="label">{state}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "behaviors" && (
          <div className="grid">
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="greet" replay={replay} />
              </div>
              <span className="label">greet (coucou)</span>
            </div>
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="blink" replay={replay} />
              </div>
              <span className="label">blink</span>
            </div>
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="squash" replay={replay} />
              </div>
              <span className="label">squash</span>
            </div>
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="slap" replay={replay} />
              </div>
              <span className="label">slap</span>
            </div>
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="gulp" replay={replay} />
              </div>
              <span className="label">gulp (swallow)</span>
            </div>
            <div className="card">
              <div className="canvas-wrap">
                <MochiCanvas expanded={true} behavior="roll" rollTurns={rollTurns} replay={replay} />
              </div>
              <div className="roll-controls">
                <button onClick={() => setRollTurns(Math.max(1, rollTurns - 1))}>-</button>
                <span>{rollTurns} turn{rollTurns > 1 ? 's' : ''}</span>
                <button onClick={() => setRollTurns(rollTurns + 1)}>+</button>
              </div>
              <span className="label">roll</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
