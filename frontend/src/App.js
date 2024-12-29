import React, {useState} from "react";
import axios from "axios";
import './App.css';

function App() {
  const [data, setData] = useState("");
  const [finishTime, setTime] = useState("");
  const [unit, setUnit] = useState("");
  const [raceDistance, setRaceDistance] = useState("");
  const [error, setError] = useState("");

  // Calculate Marathon Pace
  const fetchPace = () => {

    setError(""); // Clear previous errors
    const encodedTime = encodeURIComponent(finishTime)
    const encodedDistance = encodeURIComponent(raceDistance)
    axios.get(`http://127.0.0.1:8000/race_pace?finish_time=${encodedTime}&unit=${unit}&distance=${encodedDistance}`)
    .then(
      response => {
        const paceData = `${response.data.pace} / ${unit}`
        setData(paceData); 
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.")
    });
  };

  return (
    <div className="App">
        <header className="App-header">
            <h1>{"Marathon Training Planner"}</h1>

            {/* Input Finish Time */}
            <input
              id="time-input"
              type="text"
              placeholder="Enter time (HH:MM:SS)"
              value={finishTime}
              onChange={(e) => setTime(e.target.value)}
              className="styled-text-field"
            />

            {/* Dropdown to select unit */}
            <select
              id="unit-dropdown"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="styled-dropdown"
            >
              <option value="">-- mi / km --</option>
              <option value="mi">mi</option>
              <option value="km">km</option>
            </select>

            {/* Dropdown to select a race type */}
            <select
              id="race-dropdown"
              value={raceDistance}
              onChange={(e) => setRaceDistance(e.target.value)} // Trigger data fetch on change
              className="styled-dropdown"
            >
              <option value="">-- Select a Race Distance --</option>
              <option value="5K">5K</option>
              <option value="10K">10K</option>
              <option value="Half Marathon">Half Marathon</option>
              <option value="Marathon">Marathon</option>
            </select>
            
            {/* Button to Trigger GET Request */}
            <button onClick={fetchPace}>Get Pace</button>

            {/* Error Message */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Display the Fetched Data */}
            <p>{data ? data : ""}</p>

        </header>
    </div>
  );
}

export default App;
