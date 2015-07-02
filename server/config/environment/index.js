'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var pjson = require('../../../package.json');

function requiredProcessEnv(name) {
    if(!process.env[name]) {
        throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV,

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    // Server port
    port: process.env.PORT || 9000,

    // Should we populate the DB with sample data?
    seedDB: false,

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: 'dig-secret'
    },

    // List of user roles
    userRoles: ['guest', 'user', 'admin', 'disabled'],

    // MongoDB connection options
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    },

    appVersion: pjson.version,

    euiServerUrl: process.env.EUI_SERVER_URL || 'http://localhost',
    euiServer: process.env.EUI_SERVER || 'localhost',
    euiServerPort: process.env.EUI_SERVER_PORT || 9200,
    dbServerUser: process.env.DB_SERVER_USER,
    dbServerPass: process.env.DB_SERVER_PASS,
    euiSearchIndex: process.env.EUI_SEARCH_INDEX || 'dig-latest',
    euiSearchType: process.env.EUI_SEARCH_TYPE || 'WebPage',

    imageSimUrl: process.env.IMAGE_SIM_URL || 'http://localhost',
    imageSimPort: process.env.IMAGE_SIM_PORT || 3001,

    blurImages: ((!!process.env.BLUR_IMAGES && process.env.BLUR_IMAGES === 'false') ? false : true),
    blurPercentage: process.env.BLUR_PERCENT || 2.5,
    euiConfigs: JSON.parse(fs.readFileSync(process.env.EUI_CONFIG_FILE, 'utf8'))
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});
