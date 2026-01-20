/* =========================
   MODULE IMPORTS
   ========================= */
import { fetchCityCoordinates } from "./api.js";
import { savePreferences, loadPreferences } from "./storage.js";

/* =========================
   DOM ELEMENTS
   ========================= */
const cityInput = document.getElementById("city_input");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

/* =========================
   EXISTING GLOBALS (KEEP)
   ========================= */
let api_key = "415b982a16a69988679777b2feaff166";

/* =========================
   LOADING STATE
   ========================= */
const loader = document.createElement("div");
loader.innerText = "Loading...";
loader.style.textAlign = "center";
loader.style.display = "none";
document.body.prepend(loader);

function toggleLoader(show) {
  loader.style.display = show ? "block" : "none";
}

/* =========================
   DEBOUNCE
   ========================= */
function debounce(fn, delay = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
let currentweatherCard,
    fiveDaysForecastCard,
    aqiCard,
    sunriseCard,
    humidityVal,
    pressureVal,
    visibilityVal,
    windSpeedVal,
    feelsVal,
    hourlyForecastCard;

const aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

function initWeatherElements() {
  currentweatherCard = document.querySelectorAll('.weather-left .card')[0];
  fiveDaysForecastCard = document.querySelector('.day-forecast');
  aqiCard = document.querySelectorAll('.highlights .card')[0];
  sunriseCard = document.querySelectorAll('.highlights .card')[1];

  humidityVal = document.getElementById("humidityVal");
  pressureVal = document.getElementById("pressureVal");
  visibilityVal = document.getElementById("visibilityVal");
  windSpeedVal = document.getElementById("windSpeedVal");
  feelsVal = document.getElementById("feelsVal");

  hourlyForecastCard = document.querySelector('.hourly-forecast');
}


function getweatherDetails(name,lat,lon,country,state){
    let FORECAST_API_URL =`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL =`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    AIR_POLLUTION_API_URL =`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
    days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
      let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
        aqiCard.innerHTML=`
        <div class="card-head">
              <p>Air Quality Index</p>
              <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
            </div>
            <div class="air-indices">
              <i class="fa-regular fa-wind fa-3x"></i>
              <div class="item">
                <p>PM2.5</p>
                <h2>${pm2_5}</h2>
              </div>
              <div class="item">
                <p>PM10</p>
                <h2>${pm10}</h2>
              </div>
              <div class="item">
                <p>SO2</p>
                <h2>${so2}</h2>
              </div>
              <div class="item">
                <p>CO</p>
                <h2>${co}</h2>
              </div>
              <div class="item">
                <p>NO</p>
                <h2>${no}</h2>
              </div>
              <div class="item">
                <p>NO2</p>
                <h2>${no2}</h2>
              </div>
              <div class="item">
                <p>NH13</p>
                <h2>${nh3}</h2>
              </div>
              <div class="item">
                <p>O3</p>
                <h2>${o3}</h2>
              </div>
            </div>`;
    }).catch(() => {
        alert('Failed to fetch air quality index');
    });

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentweatherCard.innerHTML=`
          <div class="current-weather">
            <div class="details">
              <p>Now</p>
              <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
              <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
              <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
            </div>
          </div>
          <hr>
          <div class="card-footer">
            <p><i class="fa-light fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
            <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
          </div>
          `;
          let {sunrise, sunset} = data.sys,
          {timezone, visibility} = data,
          {humidity, pressure, feels_like} = data.main,
          {speed} = data.wind;
          let sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A');
          let sSetTime  = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

          sunriseCard.innerHTML=`
          <div class="card-head">
              <p>Sunrise & Sunset</p>
            </div>
            <div class="sunrise-sunset">
              <div class="item">
                <div class="icon">
                  <i class="fa-light fa-sunrise fa-4x"></i>
                </div>
                <div>
                  <p>Sunrise</p>
                  <h2>${sRiseTime}</h2>
                </div>
              </div>
              <div class="item">
                <div class="icon">
                  <i class="fa-light fa-sunset fa-4x"></i>
                </div>
                <div>
                  <p>Sunset</p>
                  <h2>${sSetTime}</h2>
                </div>
              </div>
            </div>
          `;
          humidityVal.innerHTML=`${humidity}%`;
          pressureVal.innerHTML=`${pressure} hPa`;
          visibilityVal.innerHTML=`${visibility/1000}km`;
          windSpeedVal.innerHTML=`${speed} m/s`;
          feelsVal.innerHTML=`${(feels_like - 273.15).toFixed(2)}&deg;C`;
    }).catch(() => {
        alert('Failed to fetch current weather');
    });

  fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
    let hourlyForechast = data.list;
    hourlyForecastCard.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      let hrForecastDate = new Date(hourlyForechast[i].dt_txt);
      let hr = hrForecastDate.getHours();
      let a ='PM';
      if(hr < 12) a = 'AM';
      if(hr == 0) hr = 12;
      if(hr > 12) hr = hr - 12;
      hourlyForecastCard.innerHTML += `
          <div class="card">
            <p>${hr} ${a}</p>
            <img src="https://openweathermap.org/img/wn/${hourlyForechast[i].weather[0].icon}.png" alt="">
            <p>${(hourlyForechast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
          </div>
      `;
    }
    let uniqueForcastDays = [];
    let fiveDaysForecast = data.list.filter(forecast => {
      let forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForcastDays.includes(forecastDate)) {
        return uniqueForcastDays.push(forecastDate);
      }
    });
        fiveDaysForecastCard.innerHTML = '';
        for (let i = 1; i < fiveDaysForecast.length; i++) {
          let date = new Date(fiveDaysForecast[i].dt_txt);
          fiveDaysForecastCard.innerHTML += `
          <div class="forecast-item">
              <div class="icon-wrapper">
                <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                <span>${(fiveDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
              </div>
              <p>${date.getDate()} ${months[date.getMonth()]}</p>
              <p>${days[date.getDay()]}</p>
            </div>
          `}
    }).catch(() => {
        alert('Failed to fetch weather forecast');
    });
}

function gerUserCoordinates() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        toggleLoader(true);

        initWeatherElements();

        getweatherDetails(
          "Your Location",
          latitude,
          longitude,
          "",
          ""
        );

        savePreferences({
          lastCity: "Your Location",
          units: "metric"
        });
      } catch (err) {
        alert("Failed to fetch location weather");
      } finally {
        toggleLoader(false);
      }
    },
    () => {
      alert("Location access denied");
    }
  );
}

/* =========================
   MAIN CITY LOADER
   ========================= */
async function loadCity(cityName) {
  try {
    toggleLoader(true);

    initWeatherElements();
    const data = await fetchCityCoordinates(cityName);
    const { name, lat, lon, country, state } = data[0];

    // 🔥 YOUR ORIGINAL UI FUNCTION
    getweatherDetails(name, lat, lon, country, state);

    savePreferences({
      lastCity: name,
      units: "metric"
    });

    cityInput.value = "";
  } catch (err) {
    alert(err.message);
  } finally {
    toggleLoader(false);
  }
}

/* =========================
   EVENTS
   ========================= */
searchBtn.addEventListener("click", () => {
  if (!cityInput.value.trim()) return;
  loadCity(cityInput.value.trim());
});

cityInput.addEventListener(
  "input",
  debounce(e => {
    if (e.target.value.trim().length > 2) {
      loadCity(e.target.value.trim());
    }
  })
);

locationBtn.addEventListener("click", gerUserCoordinates);

/* =========================
   LOAD LAST CITY
   ========================= */
window.addEventListener("load", () => {
  const prefs = loadPreferences();
  if (prefs.lastCity) {
    cityInput.value = prefs.lastCity;
    loadCity(prefs.lastCity);
  } else {
    gerUserCoordinates();
  }
});
