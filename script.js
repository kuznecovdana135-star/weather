
const weatherCodes = {
  0: ["Ясно", "☀️"],
  1: ["Преимущественно ясно", "🌤️"],
  2: ["Переменная облачность", "⛅"],
  3: ["Пасмурно", "☁️"],
  45: ["Туман", "🌫️"],
  48: ["Изморозь", "🌫️"],
  51: ["Лёгкая морось", "🌦️"],
  53: ["Морось", "🌦️"],
  55: ["Сильная морось", "🌧️"],
  61: ["Небольшой дождь", "🌧️"],
  63: ["Дождь", "🌧️"],
  65: ["Сильный дождь", "🌧️"],
  71: ["Небольшой снег", "🌨️"],
  73: ["Снег", "❄️"],
  75: ["Сильный снег", "❄️"],
  77: ["Снежные зёрна", "❄️"],
  80: ["Ливень", "🌧️"],
  81: ["Сильный ливень", "🌧️"],
  82: ["Очень сильный ливень", "⛈️"],
  85: ["Снегопад", "🌨️"],
  86: ["Сильный снегопад", "❄️"],
  95: ["Гроза", "⛈️"],
  96: ["Гроза с градом", "⛈️"],
  99: ["Сильная гроза", "⛈️"]
};

// Включаем анимацию в зависимости от погоды
function setWeatherEffect(code) {
  document.body.classList.remove(
    "weather-rain",
    "weather-snow"
  );

  const snowCodes = [71, 73, 75, 77, 85, 86];

  const rainCodes = [
    51, 53, 55,
    61, 63, 65,
    80, 81, 82,
    95, 96, 99
  ];

  if (snowCodes.includes(code)) {
    document.body.classList.add("weather-snow");
  } else if (rainCodes.includes(code)) {
    document.body.classList.add("weather-rain");
  }
}

async function searchWeather() {
  const city = document.getElementById("city").value.trim();
  const area = document.getElementById("weather");

  if (!city) {
    area.innerHTML = "Введите название города";
    return;
  }

  area.innerHTML = "Загружаем погоду...";

  try {
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;

    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || !geoData.results.length) {
      throw new Error("Город не найден");
    }

    const place = geoData.results[0];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=5&timezone=auto`;

      

    const response = await fetch(url);
    const data = await response.json();

    const current = data.current;
    
const hourly = data.hourly;

const now = new Date();
const currentHour = now.getHours();

const hourlyForecast = hourly.time
  .map((time, i) => {
    const hour = new Date(time).getHours();
    const weather = weatherCodes[hourly.weather_code[i]] || ["Неизвестно", "🌡️"];

    return `
      <div class="hour-card">
        <div>${String(hour).padStart(2, "0")}:00</div>
        <div>${weather[1]}</div>
        <strong>${Math.round(hourly.temperature_2m[i])}°</strong>
        <small>Осадки: ${hourly.precipitation_probability[i] ?? 0}%</small>
      </div>
    `;
  })
  .filter((_, i) => i >= currentHour)
  .slice(0, 24)
  .join("");

    const daily = data.daily;

    const weather = weatherCodes[current.weather_code] ||
      ["Неизвестно", "🌡️"];

    // Запускаем нужную анимацию
    setWeatherEffect(current.weather_code);

    const forecast = daily.time.map((date, i) => {
      const day = new Date(date + "T12:00:00")
        .toLocaleDateString("ru-RU", {
          weekday: "long"
        });

      const code = weatherCodes[daily.weather_code[i]] ||
        ["", "🌡️"];

      return `
        <div class="day">
          <span>${day}</span>
          <span>${code[1]}</span>
          <strong>
            ${Math.round(daily.temperature_2m_max[i])}°
            / ${Math.round(daily.temperature_2m_min[i])}°
          </strong>
        </div>
      `;
    }).join("");

    area.innerHTML = `
      <div class="weather-card">
        <div class="city">
          📍 ${place.name}, ${place.country}
        </div>

        <div class="description">${weather[0]}</div>

        <div class="icon">${weather[1]}</div>

        <div class="temp">
          ${Math.round(current.temperature_2m)}°
        </div>

        <div class="feels">
          Ощущается как
          ${Math.round(current.apparent_temperature)}°
        </div>
      </div>

      <div class="details">
        <div class="detail">
          <span>💧 Влажность</span>
          <strong>${current.relative_humidity_2m}%</strong>
        </div>

        <div class="detail">
          <span>💨 Ветер</span>
          <strong>${current.wind_speed_10m} км/ч</strong>
        </div>

        <div class="detail">
          <span>🌡️ Температура</span>
          <strong>${current.temperature_2m}°C</strong>
        </div>

        <div class="detail">
          <span>🌧️ Вероятность осадков</span>
          <strong>${daily.precipitation_probability_max[0]}%</strong>
        </div>
      </div>

      <h3>📅 Прогноз на 5 дней</h3>
      <div class="forecast">${forecast}</div> 
<h3>🕒 Почасовой прогноз</h3>
<div class="hourly-forecast">
  ${hourlyForecast}
</div>
`;
  } catch (error) {
    document.body.classList.remove(
      "weather-rain",
      "weather-snow"
    );

    area.innerHTML = "⚠️ " + error.message +
      "<br><br>Попробуйте другой город.";
  }
}

document.getElementById("city").addEventListener("keydown", e => {
  if (e.key === "Enter") searchWeather();
});

searchWeather();
