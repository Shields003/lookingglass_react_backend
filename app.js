const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const { get, set } = require("./store");

let { ICAO } = require("./ICAO");
ICAO = ICAO.airports;
app.use("*", cors(), async (req, res, next) => {
  console.log("login and user functions");
  req.user = {
    authorized: true,
  };
  next();
});

app.get("/", (req, res, next) => {
  res.status(200).json({ message: "hello world" });
});

app.get("/dispatch", async (req, res, next) => {
  try {
    let flight_data = await get("all_flights");

    if (!flight_data) {
      console.log("cache MISS");
      flight_data = await axios.get(process.env.DISPATCH, {
        params: {
          fromDate: moment().utc().format(),
          toDate: moment().add(5, "days").utc().format(),
        },
        headers: {
          "x-api-key": process.env.DISPATCH_KEY,
          Accept: "application/json",
        },
      });
      // console.log(flight_data.data.flights);
      const missing = new Set();
      for (let i = 0; i < ICAO.length; i++) {
        for (let n = 0; n < flight_data.data.flights.length; n++) {
          if (flight_data.data.flights[n].departure === ICAO[i].icao) {
            flight_data.data.flights[n].departureInfo = ICAO[i];
          } else {
            missing.add(flight_data.data.flights[n].departure);
          }
          if (flight_data.data.flights[n].destination === ICAO[i].icao) {
            flight_data.data.flights[n].destinationInfo = ICAO[i];
          } else {
            missing.add(flight_data.data.flights[n].destination);
          }
        }
      }
      console.log(flight_data.data.flights.length);
      console.log("missing", missing);
      flight_data = await JSON.stringify({ flights: flight_data.data.flights });
      await set("all_flights", flight_data, "EX", 10);
    } else {
      console.log("cache HIT");
    }
    flight_data = await JSON.parse(flight_data);
    // console.log("pre-release", flight_data);
    res.status(200).json({ flights: flight_data.flights });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

app.use("*", (req, res, next) => {
  if (req.user && req.user.authorized) {
    next();
  } else {
    res.status(403).json({ message: "User Unauthorized" });
  }
});

app.get("/get_rows", async (req, res, next) => {
  try {
    const users = JSON.parse(await fs.readFileSync("./MOCK_DATA.json", "utf8"));

    // console.log(users);
    res.status(200).json({ users });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.listen(process.env.PORT);
