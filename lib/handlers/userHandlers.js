/*
 * User Handlers
 *
 */

// Dependencies
const _data   = require('../data');
const helpers = require('../helpers');
const conf    = require('../config');
const _tokens = require('./tokenHandlers');


// User Handler Container
let users = {};


// Users - POST (Creation of a user)
// Required parameters: name, email, address, phone, password
// Optional parameters: none
users.post = function(data, callback){
  // Validation
  let name = typeof(data.payload.name) == 'string'
                  && data.payload.name.trim().length > 0 ?
                  data.payload.name.trim() : false;
  let lname = typeof(data.payload.lname) == 'string'
                  && data.payload.lname.trim().length > 0 ?
                  data.payload.lname.trim() : false;
  let email = typeof(data.payload.email) == 'string'
                  && helpers.validateEmail(data.payload.email.trim()) ?
                  data.payload.email.trim() : false;
  let address = typeof(data.payload.address) == 'string'
                  && data.payload.address.trim().length > 0 ?
                  data.payload.address.trim() : false;
  let phone = typeof(data.payload.phone) == 'string'
                  && data.payload.phone.trim().length == 10 ?
                  data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string'
                  && data.payload.password.trim().length > 8 ?
                  data.payload.password.trim() : false;

  if(name && lname && email && address && phone && password){
    // Check if user already exists
    _data.read('users', phone, function(err, userData){
      if(err){
        // Hash password
        let passwordHashed = helpers.hashString(password);
        // Create user object
        let userObj = {
          'name' : name,
          'lname' : lname,
          'email' : email,
          'address' : address,
          'phone' : phone,
          'passwordHashed' : passwordHashed,
          'timestamp' : Date.now()
        };
        // Store user
        _data.create('users', phone, userObj, function(err){
          if(!err){
            callback(200);
          } else {
            callback(500, {'Error' : 'Could not create new user.'});
          }
        });

      } else {
        callback(400, {'Error' : 'User with given phone number already exists.'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s).'});
  }
};


// Users - GET (Retrieve user data)
// Required parameters: phone
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
users.get = function(data, callback){
  // Validation
  let phone = typeof(data.queryStringObj.phone) == 'string'
                  && data.queryStringObj.phone.trim().length == 10 ?
                  data.queryStringObj.phone.trim() : false;
  if(phone){
    // Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify token is valid for given phone number
    _tokens.validateToken(token, phone, function(tokenIsValid){
      if(tokenIsValid){
        // Lookup user
        _data.read('users', phone, function(err, userData){
          if(!err && userData){
            delete data.passwordHashed;
            callback(200, userData);
          } else {
            callback(404, {'Error' : 'User could not be found'});
          }
        });
      } else {
        callback(403, {'Error' : 'Missing required token, or token is invalid.'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s).'});
  }
};

// Users - PUT (Update user data)
// Required parameters: phone
// Optional parameters: name || lname || email || address || password (at least one)
// *** REQUIRES USER TO BE LOGGED IN ***
users.put = function(data, callback){
  // Validation
  let phone = typeof(data.payload.phone) == 'string'
              && data.payload.phone.trim().length == 10 ?
              data.payload.phone.trim() : false;
  // Optional fields
  let name = typeof(data.payload.name) == 'string'
                  && data.payload.name.trim().length > 0 ?
                  data.payload.name.trim() : false;
  let lname = typeof(data.payload.lname) == 'string'
                  && data.payload.lname.trim().length > 0 ?
                  data.payload.lname.trim() : false;
  let email = typeof(data.payload.email) == 'string'
                  && helpers.validateEmail(data.payload.email.trim()) ?
                  data.payload.email.trim() : false;
  let address = typeof(data.payload.address) == 'string'
                  && data.payload.address.trim().length > 0 ?
                  data.payload.address.trim() : false;
  let password = typeof(data.payload.password) == 'string'
                  && data.payload.password.trim().length > 8 ?
                  data.payload.password.trim() : false;
  if(phone){
    // Error if nothing is passed to update
    if(name || lname || email || address || password){
      // Get token from headers
      let token = typeof(data.headers.token) == 'string' ?
                data.headers.token : false;
      // Verify token is valid for given phone number
      _tokens.validateToken(token, phone, function(tokenIsValid){
        if(tokenIsValid){
          // Lookuo user
          _data.read('users', phone, function(err, userData){
            if(!err && userData){
              // Update user data
              if(name){
                userData.name = name;
              };
              if(lname){
                userData.name = lname;
              };
              if(email){
                userData.email = email;
              };
              if(address){
                userData.address = address;
              };
              if(password){
                userData.passwordHashed = helpers.hashString(password);
              };
              // Store updates to user
              _data.update('users', phone, userData, function(err){
                if(!err){
                  callback(200);
                } else {
                  callback(500, {'Error' : 'Could not update user'});
                }
              });
            } else {
              callback(404, {'Error' : 'User could not be found'});
            }
          });
        } else {
          callback(403, {'Error' : 'Missing required token, or token is invalid'});
        }
      });
    } else {
      callback(400, {'Error' : 'Missing field(s) to update'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Users - DELETE (Remove user data)
// Required parameters: phone
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
users.delete = function(data, callback){
  // Validation
  let phone = typeof(data.queryStringObj.phone) == 'string'
            && data.queryStringObj.phone.trim().length == 10 ?
            data.queryStringObj.phone.trim() : false;

  if(phone){
    // Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    // Verify token is valid for given phone number
    _tokens.validateToken(token, phone, function(tokenIsValid){
      if(tokenIsValid){
        // Lookup user
        _data.read('users', phone, function(err, userData){
          if(!err && userData){
            // Delete user data
            _data.delete('users', phone, function(err){
              if(!err){
                // Delete user cart
                let cartId = typeof(userData.cartId) == 'string'
                            && userData.cartId.trim().length == 20 ?
                            userData.cartId : false;
                if(cartId){
                  _data.delete('carts', cartId, function(err){
                    if(!err){
                      callback(200);
                    } else {
                      callback(500, {'Error' : 'Could not delete user cart'});
                    }
                  });
                } else {
                  callback(200);
                }

              } else {
                callback(500, {'Error' : 'Could not delete user'});
              }
            });
          } else {
            callback(404, {'Error' : 'User could not be found'});
          }
        });
      } else {
        callback(403, {'Error' : 'Missing required token, or token is invalid'});
      }
    });
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Export module
module.exports = users;
