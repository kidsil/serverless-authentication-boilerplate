'use strict';

// Config
const slsAuth = require('serverless-authentication');
const config = slsAuth.config;
const utils = slsAuth.utils;

// Common
const cache = require('../storage/cacheStorage');
const helpers = require('../helpers');
const createResponseData = helpers.createResponseData;

/**
 * Refresh Handler
 * @param event
 * @param callback
 */
function refreshHandler(event, callback) {
  helpers.initEnvVariables(event.stage);
  const refreshToken = event.path.refresh_token || event.refresh_token;
  // user refresh token to get userid & provider from cache table

  cache.revokeRefreshToken(refreshToken)
    .then((results) => {
      const providerConfig = config({ provider: '' });
      const id = results.id;
      const data =
        Object.assign(createResponseData(id, providerConfig), { refreshToken: results.token });
      const authorization_token =
        utils.createToken(
          data.authorizationToken.payload,
          providerConfig.token_secret,
          data.authorizationToken.options);
      callback(null, { authorization_token, refresh_token: data.refreshToken, id });
    })
    .catch((error) => callback(error));
}

exports = module.exports = refreshHandler;