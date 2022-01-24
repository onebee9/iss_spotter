const request = require('request');

const fetchMyIP = function (callback) {
  request('https://api.ipify.org', function (error, response, body) {

    if (error) {//error from the request call if invalid domain, user is offline, etc.
      return callback(error, null);
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = body;
    if (data) {// check if we recieve any data 
      return callback(null, data);
    } else {
      return callback('No description for this IP', null);
    }

  });
}

const fetchCordinatesByIP = function (ip, callback) {
  // use request to fetch geo location from API
  request(`https://freegeoip.app/json/${ip}`, function (error, response, body) {

    if (error) {//error from the request call if invalid domain, user is offline, etc.
      return callback(error, null);
    }

    //if not == 200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching GEO location: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);
    if (data) {// check if we recieve any data 
      return callback(null, data);
    } else {
      return callback('No description for this IP', null);
    }

  });
}

const fetchISSFlyOverTimes = function (coords, callback) {
  let latitude = coords['latitude'];
  let longitude = coords['longitude'];
  request(`https://iss-pass.herokuapp.com/json/?lat=${latitude}&lon=${longitude}`, function (error, response, body) {

    if (error) {//error from the request call if invalid domain, user is offline, etc.
      return callback(error, null);
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching pass times: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);

    if (data) {// check if we recieve any data 
      return callback(null, data);
    } else {
      return callback('No description for these pass times', null);
    }

  });
};

const nextISSTimesForMyLocation = function (callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCordinatesByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { nextISSTimesForMyLocation };