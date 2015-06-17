'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:9000', 
    SESSION_SECRET: 'dig-secret',
EUI_SERVER_URL: 'http://vinisvr',
  EUI_SERVER_PORT: 9200,
  EUI_SERVER: 'vinisvr',
  EUI_SEARCH_INDEX: 'dig-latest',
  IMAGE_SIM_URL: 'http://vinisvr',


  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
