import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT;
const DATA_DIR = path.join(import.meta.dirname, "data"); // import.meta.dirname gives us the folder where the data file lives
fs.mkdirSync(DATA_DIR, { recursive: true }); // synchronously creates the DATA_DIR folder if recursive is false if true do nothing

const WEATHER_FILE = path.join(DATA_DIR, "weather.json");
const LOG_FILE = path.join(DATA_DIR, "weather_log.csv");

app.use(express.static(path.join(import.meta.dirname, "public"))); // static tells express that we are automatically serving everything within the file

app.get("/api/weather", (req, res) => {
  try {
    const weatherData = JSON.parse(fs.readFileSync(WEATHER_FILE, "utf-8")); // utf8 is how it reasds the file
    res.json(weatherData);
  } catch (err) {
    res.status(404).json({ Error: `No weather data available. Error: ${err}` });
  }
});

app.get("/api/weather-log", (req, res) => {
  try {
    const lines = fs.readFileSync(LOG_FILE, "utf-8").trim().split("\n");
    const timestamps = [];
    const temps = [];

    for (const line of lines.slice(1)) {
      const [timestamp, temperature] = line.split(",");
      if (timestamp && temperature) {
        timestamps.push(timestamp);
        temps.push(parseFloat(temperature));
      }
    }
    res.join({ timestamps, temps });
  } catch (err) {
    res.status(404).json({ erro: `No weather log available. error: ${err}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
