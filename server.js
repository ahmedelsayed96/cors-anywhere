// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
// var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
// var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
// var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');
const express = require("express");
var https = require('https');
const app = express();
const qs = require('qs');
const axios = require('axios').default;

const cors_server = cors_proxy.createServer({
  // originBlacklist: originBlacklist,
  originWhitelist: [], // Allow all origins
  // requireHeader: ['origin', 'x-requested-with'],
  // checkRateLimit: checkRateLimit,
  
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    // 'x-request-start',
    // 'x-request-id',
    // 'via',
    // 'connect-time',
    // 'total-route-time',
    // Other Heroku added debug headers
    // 'x-forwarded-for',
    // 'x-forwarded-proto',
    // 'x-forwarded-port',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    xfwd: false,
  },
});
//   .listen(port, host, function () {
//   console.log('Running CORS Anywhere on ' + host + ':' + port);
// });

app.get('/proxy/:proxyUrl*', (req, res) => {
  req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  cors_server.emit('request', req, res);
});
app.post('/proxy/:proxyUrl*', (req, res) => {
  req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  cors_server.emit('request', req, res);
});
app.post('/token', async (req, res) => {
  const tenantId = 'db17403f-3ed0-46c8-8e97-120639b5a2ea';
  const body = {
    grant_type: 'client_credentials',
    client_id: '027986d1-25fc-41d1-8169-ebc9a45c9ebe',
    client_secret: '3VA8Q~57Utf3WhZJ0pUbAufHxatj.c9TjfFuydjJ',
    scope: 'https://kbdenim-uat.sandbox.operations.dynamics.com/.default',
    
    
  };
  var data = qs.stringify(body);

  try {
  const response  =await  axios.post('https://login.microsoftonline.com/'+tenantId+'/oauth2/v2.0/token', data ,{ headers: {
    // Overwrite Axios's automatically set Content-Type
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  });
    
  res.send(response.data);

  } catch (err){
    res.send( err);
}
});

app.listen(port, () => {
  console.log(`Server start ....... `)
})