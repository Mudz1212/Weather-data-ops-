import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DATA_DIR = path.join(import.meta.dirname, "data"); // import.meta.dirname gives us the folder where the data file lives
fs.mkdirSync(DATA_DIR, { recursive: true }); // synchronously creates the DATA_DIR folder if recursive is false if true do nothing

const WEATHER_FILE = path.join(DATA_DIR, "weather.json");
const LOG_FILE = path.join(DATA_DIR, "weather_log.csv");

export async function fetchWeather() {
  const apiKey = process.env.WEATHER_API_KEY;
  const city = process.env.CITY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`http error! Status: ${response.status}`);
    }
    const data = await response.json();
    const nowUTC = new Date().toISOString();
    data._last_updated_UTC = nowUTC;
    fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2)); // human readable and indented

    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "timestamp,city,temperature,description\n");
    }

    const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}`;
    fs.appendFileSync(LOG_FILE, logEntry);

    console.log(`Weather data updated for ${city} at ${nowUTC}`);
  } catch (err) {
    console.log(`Error fetching weather: ${err}`);
  }
}

fetchWeather();
