import { API_key } from "./env.js";
const form = document.querySelector("#weather-form");
const weatherContainer = document.querySelector("#weather-container");

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
    overall_humidity: data.daily[0].humidity,
    current_humidity: data.current.humidity,
    icon: `https://openweathermap.org/img/wn/${data.daily[0].weather[0].icon}@2x.png`,
    forecast: data.daily[0].summary,
  };
  return info;
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const lookup = form[0].value;
  const info = await weather(lookup);
  console.log(info);
  weatherContainer.innerHTML = `
  ${info.location}<br>
    Today's Forecast: ${info.forecast}<br>
    <img src='${info.icon}'><br>
    Current Temp: ${info.current}°F<br>
    Today's High: ${info.high}°F<br>
    Today's Low: ${info.low}°F<br>
    Today's Humidity: ${info.overall_humidity}%<br>
    `;
    weatherContainer.classList.add('weather-container-active')
});
