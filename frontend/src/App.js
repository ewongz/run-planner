import React, {useState} from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [pace, setPace] = useState("");
  const [time, setTime] = useState("");
  const [isMiles, setIsMiles] = useState(true);
  const [raceDistance, setRaceDistance] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setError(""); // Clear previous errors
    setTime("");
    setRaceDistance("");
    setPace("");
  };

  // Calculate Marathon Pace
  const fetchPace = () => {

    setError(""); // Clear previous errors
    const encodedTime = encodeURIComponent(time)
    const encodedDistance = encodeURIComponent(raceDistance)
    let unit;
    if (isMiles) {
      unit = "mi";
    } else {
      unit = "km";
    }
    axios.get(`http://127.0.0.1:8000/race_pace?finish_time=${encodedTime}&unit=${unit}&distance=${encodedDistance}`)
    .then(
      response => {
        const paceData = `${response.data.pace} / ${unit}`
        setPace(paceData); 
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.")
    });
  };

  // Function to handle input change for time
  const handleChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    // Add colon at appropriate positions
    if (value.length > 2 && value.length <= 4) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    } else if (value.length > 4) {
      value = value.slice(0, 2) + ":" + value.slice(2, 4) + ":" + value.slice(4, 6);
    }
    setTime(value); // Update the time state
  };

  const toggleUnit = () => {
    setIsMiles((prevState) => !prevState)
  };

  return (
    <div className="App">
        <header className="App-header">
            <h1>{"Marathon Training Planner"}</h1>
        </header>
        <div className="Pace-calculator">
          <div className="rowC">
            {/* Input Finish Time */}
            <input
              id="time-input"
              type="text"
              placeholder="Time (hh:mm:ss)"
              value={time}
              onChange={handleChange}
              className="styled-text-field"
              maxLength={8}
            />
            {/* Toggle Button */}
            <button
              id="unit-toggle"
              onClick={toggleUnit}
              className="toggle-button"
            >
              {isMiles ? "mi" : "km"}
            </button>
          </div>

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
          
          <div className="rowC">
            {/* Button to Trigger GET Request */}
            <button 
              onClick={fetchPace}
              className="get-pace-button"
            >Get Pace</button>
            {/* Button to Clear User Input */}
            <button 
              onClick={reset}
              className="reset-button"
            >🔄</button>
          </div>

          {/* Error Message */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* Display the Fetched Data */}
          <p style={{color: "whitesmoke"}}>{pace ? pace : ""}</p>
        </div>
    </div>
  );
}

export default App;
