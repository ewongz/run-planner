// Function to handle input change for time
export function handleTimeInput(e: { target: { value: string; }; }) {
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
// Function to handle input change for time
export function handlePercentageInput(e: { target: { value: string; }; }) {
    let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters except :
    return value;
  }