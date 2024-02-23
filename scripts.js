import { API_key } from "./env.js";
const form = document.querySelector("#weather-form");
const weatherContainer = document.querySelector("#weather-container");
const longForecast = document.querySelector("#long-forecast");
const day = new Date().getDay();
const day_list = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const geolocate = async (location) => {
  let response;
  let type;
  let coords;
  if (
    (!isNaN(location) && location.length == 5) ||
    (location.search("-") != -1 && parseInt(location).toString().length == 5)
  ) {
    type = "zipcode";
    if (
      location.search("-") != -1 &&
      parseInt(location).toString().length == 5
    ) {
      location = parseInt(location);
    }
    response = await fetch(
      `http://api.openweathermap.org/geo/1.0/zip?zip=${location}&appid=${API_key}`
    );
  } else {
    type = "city";
    response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_key}`
    );
  }
  const data = await response.json();
  if (type === "zipcode") {
    coords = {
      lat: data.lat,
      lon: data.lon,
      name: data.name,
    };
  } else {
    coords = {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
    };
  }
  return coords;
};

const weather = async (location) => {
  try {
    const coords = await geolocate(location);
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&units=imperial&appid=${API_key}`
  );
  const data = await response.json();
  const info = {
    location: coords.name,
    current: Math.round(data.current.temp),
    high: Math.round(data.daily[0].temp.max),
    low: Math.round(data.daily[0].temp.min),
    feels_like: Math.round(data.current.feels_like),
    overall_humidity: data.daily[0].humidity,
    current_humidity: data.current.humidity,
    icon: `https://openweathermap.org/img/wn/${data.daily[0].weather[0].icon}@2x.png`,
    forecast: data.daily[0].summary,
  };
  let eightDay = [info];
  for (let idx in data.daily) {
    const eightInfo = {
      day: day_list[(day + Number(idx)) % 7],
      day_temp: Math.round(data.daily[idx].temp.day),
      high: Math.round(data.daily[idx].temp.max),
      low: Math.round(data.daily[idx].temp.min),
      humidity: data.daily[idx].humidity,
      icon: `https://openweathermap.org/img/wn/${data.daily[idx].weather[0].icon}@2x.png`,
      forecast: data.daily[idx].summary,
    };
    eightDay.push(eightInfo);
  }
  return eightDay;}
  catch {alert('City or Zip Code not found, please try again.')}
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lookup = form[0].value;
  const info = await weather(lookup);
  weatherContainer.innerHTML = `
    <p class="day-forecast">${info[0].location}</p>
    Today's Forecast: ${info[0].forecast}<br>
    <img src='${info[0].icon}'><br>
    Current Temp: ${info[0].current}°F<br>
    Feels Like: ${info[0].feels_like}°F<br>
    Today's High: ${info[0].high}°F<br>
    Today's Low: ${info[0].low}°F<br>
    Today's Humidity: ${info[0].overall_humidity}%<br>
    `;
  weatherContainer.classList.add("weather-container-active");
  longForecast.innerHTML = `
  <div class="accordion" id="accordion-div">
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed d-block text-center" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
            7 Day Forecast
          </button>
        </h2>
        <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#accordion-div">
          <div class="accordion-body">
          </div>
        </div>
      </div>
    </div>
  `;
  const accordion = document.querySelector(".accordion-body");
  console.log(accordion);
  for (let idx in info) {
    if (idx == 0 || idx==7) {
      continue;
    }
    console.log(idx);
    console.log(info[idx]);
    const day_forecast = document.createElement("div");
    day_forecast.classList.add('weather-container-active')
    day_forecast.classList.add('long-forecast-card')
    day_forecast.innerHTML = `
    <p class="day-forecast">${info[idx].day}</p>
    <div class="blurb-container"><p class="day-blurb">Forecast: ${info[idx].forecast}</p></div>
    <img src='${info[idx].icon}' class="day-img"><br>
    <p class="day-info">Day Temp: ${info[idx].day_temp}°F</p>
    <p class="day-info">High: ${info[idx].high}°F</p>
    <p class="day-info">Low: ${info[idx].low}°F</p>
    <p class="day-info">Humidity: ${info[idx].humidity}%</p>
    `;
    accordion.append(day_forecast);
  }
});
