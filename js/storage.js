export function savePreferences(prefs) {
  localStorage.setItem("weatherPrefs", JSON.stringify(prefs));
}

export function loadPreferences() {
  return JSON.parse(localStorage.getItem("weatherPrefs")) || {
    lastCity: null,
    units: "metric"
  };
}
