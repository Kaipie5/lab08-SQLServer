'use strict';

const express = require('express');
require('dotenv').config();
const cors = require('cors');

const pg = require('pg')

// const databaseURL = 'postgres://localhost:5432/city_explorer';
// console.log(databaseURL)

const client = new pg.Client(process.env.DATABASE_URL);



client.on('error', err => {
    console.error(err)
})

const app = express();
app.use(cors());

// allows us to get real data
const superagent = require('superagent');

const PORT = process.env.PORT;

let currentLat = 0;
let currentLng = 0;
let currentCity = "";

app.get('/', (request, response) => {
    console.log("HELLLOOOOOOOO")
    response.send("Hello from the back side");
    // console.log(city);
    // let locationObj = searchLatToLong(city);
    // responseObj = {
    //     "search_query": city,
    //     "formatted_query": city,
    //     "latitude": locationObj.latitude,
    //     "longitude": locationObj.longitude
    // }
})



app.get('/location', (request, response) => {
    console.log(" ALSO HELLOOOOOO")
    

    try{  
        createResponseObjLocation(request, response);      
    }
    catch(error){
        console.error(error); // will turn the error message red if the environment supports it

        response.status(500).send('Sorry something went wrong');
    }

    
})

function createResponseObjLocation(request, response) {
    // const geoData = require('./data/geo.json');
    const city = request.query.data;
    // console.log(city)

    let locationObj;

    let sql = 'SELECT * FROM city_explorer WHERE city_name=$1;';
    let safeValues = [city];

    client.query(sql, safeValues)
    .then(results => {
        if (results.rowCount > 0) {
            let row = results.rows[0]
            locationObj = new Location(row.city_name, row.formatted_query, row.latitude, row.longitude);
             
        } else {
            locationObj = ""
        }

        console.log('locationOBJ FROM DATABASE:', locationObj)
        if (locationObj != "") {
            console.log(locationObj)
            response.send(locationObj)
        } else {
            let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`;
    
            superagent.get(url)
                .then(results => {
                    // console.log(results.body.results[0])
                    let result = results.body.results[0];
                    let locationObj = new Location(city, result.formatted_address, result.geometry.location.lat, result.geometry.location.lng);
                    // console.log(locationObj)
                    currentLat = locationObj.latitude
                    currentLng = locationObj.longitude
                    currentCity = city
                    
                    insertLocation(locationObj)
                    // console.log("RESPONSE LOCATION", locationObj);
                    response.send(locationObj);
                    
            });
        } 
    })

    

    
}

app.get('/weather', (request, response) => {

    console.log(" Weather HELLOOOOOO")
    // console.log(request)

    try{
        
    
        createResponseObjWeather(request, response);
    
        
    }
    catch(error){
        console.error(error); // will turn the error message red if the environment supports it

        response.status(500).send('Sorry something went wrong');
    }
    

})

function createResponseObjWeather(request, response) {
    // const weatherData = require('./data/darksky.json');
    console.log("LAT LNG", currentLat, currentLng)
    let url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${currentLat},${currentLng}`;

  superagent.get(url)
    .then(results => {

        let weatherObjList = results.body.daily.data.map( (dayForecast) => {
            return new Weather(dayForecast)
        });

        // console.log("WEATHER OBJ", weatherObjList)


        // console.log("RESPONSE WEATHER", weatherObjList);
        response.send(weatherObjList);
        
    });

}

app.get('/events', (request, response) => {
    console.log("Event HELLOOOOO")

    try{  
        createResponseObjEvent(request, response);      
    }
    catch(error){
        console.error(error); // will turn the error message red if the environment supports it

        response.status(500).send('Sorry something went wrong');
    }

    
})

function createResponseObjEvent(request, response) {
    // const geoData = require('./data/geo.json');
    // const city = request.query.data;
    // console.log(city)

    let url = `http://api.eventful.com/rest/events/search?app_key=${process.env.EVENTFUL_API_KEY}&location=${currentCity}&date=Future`;
    console.log("URL", url)
    const jsdom = require("jsdom");
    

  superagent.get(url)
    .then(results => {
        // console.log(Object.keys(results));
        const dom = new jsdom.JSDOM(results.text)
        let eventsArray = []
        let numEvents = 20
        if (dom.window.document.querySelectorAll("event").length < 20) {
            numEvents = dom.window.document.querySelectorAll("event").length
        }

        let allEvents = dom.window.document.querySelectorAll("event")
        
        for (let i = 0; i < numEvents; i++) {
            let event = allEvents[i]
            // console.log(event.querySelector('url').textContent)
            let link = event.querySelector("url").textContent;
            let event_date = event.querySelector("start_time").textContent;
            let name = event.querySelector("title").textContent;
            let summary = event.querySelector("description").textContent;
            let newEvent = new Event(link, name, event_date, summary);
            // console.log(newEvent)
            eventsArray.push(newEvent)
        }
        // console.log(eventsArray)
        response.send(eventsArray);
        
    
    });
}


client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
})
  .catch((err) => console.error(err));

function Location(city, formattedAddress, latitude, longitude){
    this.search_query = city;
    this.formatted_query = formattedAddress;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  function Weather(darkSkyDataResults){
    this.forecast = darkSkyDataResults.summary;
    let date = new Date(darkSkyDataResults.time * 1000)
    this.time = date.toString();
  }

  function Event(link, name, event_date, summary) {
      this.link = link
      this.name = name
      this.event_date = event_date
      this.summary = summary
  }

  app.get('/add', (request, response) =>{
      
  })

  function checkDatabase(cityName) {
    //   console.log(cityName)
    
    // if (client.query(sql, safeValues) 
  }

  function insertLocation(location) {

    console.log(location)
    // let sql = 'INSERT INTO city_explorer (city_name, formatted_query, latitude, longitude) VALUES ('seattle', 'seattle', '47', '-122')'
    let sql = 'INSERT INTO city_explorer (city_name, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
    let safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];

    client.query(sql, safeValues)

  }