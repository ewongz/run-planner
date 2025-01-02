import React, {useState} from "react";
import axios from "axios";
import "./App.css";

// Function to handle input change for time
export function handleChange(e) {
  let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters except :
  // Add colon at appropriate positions
  if (value.length > 2 && value.length <= 3) {
    value = value.slice(0, 1) + ":" + value.slice(1, 3);
  } else if (value.length > 3 && value.length <= 4) {
    value = value.slice(0, 2) + ":" + value.slice(2);
  } else if (value.length > 4 && value.length <= 5) {
    value = value.slice(0, 1) + ":" + value.slice(1, 3) + ":" + value.slice(3, 5);
  } else if (value.length > 5) {
    value = value.slice(0, 2) + ":" + value.slice(2, 4) + ":" + value.slice(4, 8);
  }
  return value;
}

function App() {
  const [lastUpdated, setLastUpdated] = useState("");
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
    setLastUpdated("");
  };

  const calculate = () => {
    if (lastUpdated === "time") {
      setPace(fetchPace());
    } else if (lastUpdated === "pace") {
      setTime(fetchTime());
    } else if (pace === "") {
      setPace(fetchPace());
    } else if (time === "") {
      setTime(fetchTime());
    }
  };

  // Calculate Pace
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
        const paceData = `${response.data.pace}`
        setPace(paceData); 
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch pace.")
    });
  };

  // Calculate Time
  const fetchTime = () => {
    setError(""); // Clear previous errors
    const encodedPace = encodeURIComponent(pace)
    const encodedDistance = encodeURIComponent(raceDistance)
    let unit;
    if (isMiles) {
      unit = "mi";
    } else {
      unit = "km";
    }
    axios.get(`http://127.0.0.1:8000/race_time?pace=${encodedPace}&unit=${unit}&distance=${encodedDistance}`)
    .then(
      response => {
        const timeData = `${response.data.time}`
        setTime(timeData);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch time")
    });
  }

  const formatTime = (e) => {
    setTime(handleChange(e))
    setLastUpdated("time")
    
  }

  const formatPace = (e) => {
    setPace(handleChange(e))
    setLastUpdated("pace")
  }

  const toggleUnit = () => {
    setIsMiles((prevState) => !prevState)
  };

  return (
    <div className="App">
        <header className="App-header">
            <h1>{"Marathon Training Planner"}</h1>
        </header>
        <div className="Pace-calculator">

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

          {/* Input Finish Time */}
          <input
              id="time-input"
              type="text"
              placeholder="Time (hh:mm:ss)"
              value={time}
              onChange={formatTime}
              className="time-text-field"
              maxLength={8}
          />

          <div className="rowC">
            {/* Input Pace */}
            <input
                id="pace-input"
                type="text"
                placeholder="Pace (mm:ss)"
                value={pace}
                onChange={formatPace}
                className="pace-text-field"
                maxLength={6}
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
          
          <div className="rowC">
            {/* Button to Trigger GET Request */}
            <button 
              onClick={calculate}
              className="calculate-button"
              >🏃 Calculate </button>
            {/* Button to Clear User Input */}
            <button 
              onClick={reset}
              className="reset-button"
            >🔄</button>
          </div>

          {/* Error Message */}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    </div>
  );
}

export default App;
