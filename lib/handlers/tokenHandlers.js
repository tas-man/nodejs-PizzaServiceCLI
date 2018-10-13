/*
 * Token Handlers
 *
 */
// Dependencies
const _data   = require('../data');
const helpers = require('../helpers');
const conf    = require('../config');

// Token Handler Container
let tokens = {};

// Verify that token belongs to given user and has not expired
tokens.validateToken = function(token, phone, callback){
  _data.read('tokens', token, function(err, tokenData){
    if(!err && tokenData){
      if(tokenData.phone == phone && tokenData.expiration > Date.now()){
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};


// Tokens - POST
// Required parameters: phone, password
// Optional parameters: none
// *** FACILITATES LOGIN ***
tokens.post = function(data, callback){
  // Validation
  let phone = typeof(data.payload.phone) == 'string'
                  && data.payload.phone.trim().length == 10 ?
                  data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string'
                  && data.payload.password.trim().length > 8 ?
                  data.payload.password.trim() : false;
  if(phone && password){
    // Lookup user
    _data.read('users', phone, function(err, userData){
      if(!err && userData){
        // Hash password and compare to stored one
        let passwordHashed = helpers.hashString(password);
        if(passwordHashed == userData.passwordHashed){
          // Create new token with random id. Expiration 1 hour
          let tokenId = helpers.generateRandomStr(20);
          let expiration = Date.now() + 1000 * 60 * 60;

          // create token object
          let tokenObject = {
            'id' : tokenId,
            'phone' : phone,
            'expiration' : expiration
          };
          // Store new token
          _data.create('tokens', tokenId, tokenObject, function(err){
            if(!err){
              callback(200, tokenObject);
            } else {
              callback(500, {'Error' : 'Could not create token'});
            }
          });
        } else {
          callback(400, {'Error' : 'Password did not match specified user'});
        }
      } else {
        callback(404, {'Error' : 'User could not be found'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Tokens - GET
// Required parameters: id
// Optional parameters: none
tokens.get = function(data, callback){
  // Validation
  let id = typeof(data.queryStringObj.id) == 'string'
          && data.queryStringObj.id.trim().length == 20 ?
          data.queryStringObj.id.trim() : false;
  if(id){
    // Lookup token
    _data.read('tokens', id, function(err, tokenData){
      if(!err && tokenData){
        callback(200, tokenData);
      } else {
        callback(404, {'Error' : 'User could not be found'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Tokens - PUT (Update/extend token expiration time)
// Required parameters: id, extend
// Optional parameters: none
tokens.put = function(data, callback){
  // Validation
  let id = typeof(data.payload.id) == 'string'
          && data.payload.id.trim().length == 20 ?
          data.payload.id.trim() : false;
  let extend = typeof(data.payload.extend) == 'boolean'
              && data.payload.extend == true ? data.payload.extend : false;
  if(id && extend){
    // Lookup token
    _data.read('tokens', id, function(err, tokenData){
      if(!err && tokenData){
        // Check if token has already expired
        if(tokenData.expiration > Date.now()){
          // Extend expiration time by 2 hours
          tokenData.expiration = Date.now() + 1000 * 60 * 60;
          // Store updated token
          _data.update('tokens', id, tokenData, function(err){
            if(!err){
              callback(200);
            } else {
              callback(500, {'Error' : 'Could not update token expiration time'});
            }
          })
        } else {
          callback(400, {'Error' : 'Token has expired'});
        }
      } else {
        callback(404, {'Error' : 'Token could not be found'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Tokens - DELETE
// Required parameters: id
// Optional parameters: none
tokens.delete = function(data, callback){
  // Validation
  let id = typeof(data.queryStringObj.id) == 'string'
          && data.queryStringObj.id.trim().length == 20 ?
          data.queryStringObj.id.trim() : false;
  if(id){
    // Lookup token
    _data.read('tokens', id, function(err, tokenData){
      if(!err && tokenData){
        // Delete token
        _data.delete('tokens', id, function(err){
          if(!err){
            callback(200);
          } else {
            callback(500, {'Error' : 'Could not delete specified token'});
          }
        });
      } else {
        callback(404, {'Error' : 'Token could not be found'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};

// Export module
module.exports = tokens;
