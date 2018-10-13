/*
 * Cart Handler
 *
 */


// Dependencies
const _data   = require('../data');
const helpers = require('../helpers');
const _items  = require('./itemHandlers');

// Cart Handler Container
let carts = {};

// Carts - POST (Creation of a cart by adding first item/ Adding item to existing cart)
// Required parameters: itemId, quantity
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
carts.post = function(data, callback){
  // Validation
  let itemId = typeof(data.payload.itemId) == 'string'
              && _items.getItemIdList().indexOf(data.payload.itemId) > -1 ?
              data.payload.itemId : false;
  let quantity = typeof(data.payload.quantity) == 'string'
              && data.payload.quantity > 0
              && data.payload.quantity <= 10
              && data.payload.quantity % 1 == 0 ?
              data.payload.quantity : false;
  if(itemId && quantity){
    // Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    if(token){
      // Verify token is valid and has not expired
      _data.read('tokens', token, function(err, tokenData){
        if(!err && tokenData){
          if(tokenData.expiration > Date.now()){
            // Identify user based on token data
            let phone = tokenData.phone;

            // Get item data
            let item = _items.itemList[_items.getItemIdList().indexOf(itemId)];
            let subTotal = item.itemPrice * quantity;

            // Check if user already has a cart
            _data.read('users', phone, function(err, userData){
              if(!err && userData){
                // Validate read cartId
                let cartId = typeof(userData.cartId) == 'string'
                            && userData.cartId.trim().length == 20 ?
                            userData.cartId : false;

                  // Determines if a previously created cart will be added to,
                  // or if a new one will be created for the user
                  if(cartId){
                    // *** Add a new item to existing cart
                    // Create new cartItem object
                    let cartItem = {
                      'itemId'    : item.itemId,
                      'itemName'  : item.itemName,
                      'quantity'  : quantity,
                      'subTotal'  : subTotal
                    }
                    // Lookup cart
                    _data.read('carts', cartId, function(err, cartData){
                      if(!err && cartData){
                        // Push new item to cart
                        cartData.items.push(cartItem);
                        // Store new data to file
                        _data.update('carts', cartId, cartData, function(err){
                          if(!err){
                            callback(200, cartData);
                          } else {
                            callback(500, {'Error' : 'Could not save updated cart'});
                          }
                        });
                      } else {
                        callback(404, {'Error' : 'Could not find cart ID'});
                      }
                    });

                  } else {
                    // *** Create a new cart for the user
                    cartId = helpers.generateRandomStr(20);
                    // Create cart object
                    let cartObj = {
                      'phone' : phone,
                      'items' : []
                    };
                    // Create new cartItem object
                    let cartItem = {
                      'itemId'    : item.itemId,
                      'itemName'  : item.itemName,
                      'quantity'  : quantity,
                      'subTotal'  : subTotal
                    }
                    cartObj.items.push(cartItem);
                    // Create new file for user cart
                    _data.create('carts', cartId, cartObj, function(err){
                      if(!err){
                        // Assign new cart to the user
                        userData.cartId = cartId;
                        // Store new data to file
                        _data.update('users', phone, userData, function(err){
                          if(!err){
                            callback(200, cartItem);
                          } else {
                            callback(500, {'Error' : 'Could not update user with new cart'});
                          }
                        });
                      } else {
                        callback(500, {'Error' : 'Could not create new cart'});
                      }
                    });
                  }

              } else {
                callback(404, {'Error' : 'User could not be found'});
              }
            });
          } else {
            callback(403, {'Error' : "Token has expired"});
          }
        } else {
          callback(403, {'Error' : 'Token is invalid'});
        }
      });
    } else {
      callback(403, {'Error' : 'This action requires login'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Carts - GET
// Required parameters: none
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
carts.get = function(data, callback){
  // Get token from headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  if(token){
    // Verify token is valid and has not expired
    _data.read('tokens', token, function(err, tokenData){
      if(!err && tokenData){
        if(tokenData.expiration > Date.now()){
          // Identify user based on token data
          let phone = tokenData.phone;

          // Check if user has a cart
          _data.read('users', phone, function(err, userData){
            if(!err && userData){
              // Validate read cartId
              let cartId = typeof(userData.cartId) == 'string'
                          && userData.cartId.trim().length == 20 ?
                          userData.cartId : false;
                if(cartId){
                  // Lookup cart
                  _data.read('carts', cartId, function(err, cartData){
                    if(!err && cartData){
                      callback(200, cartData);
                    } else {
                      callback(500, {'Error' : 'Cart could not be read'});
                    }
                  });
                } else {
                  callback(400, {'Error' : 'Specified user has no cart, please create new cart'});
                }
            } else {
              callback(404, {'Error' : 'User could not be found'});
            }
          });
        } else {
          callback(403, {'Error' : "Token has expired"});
        }
      } else {
        callback(403, {'Error' : 'Token is invalid'});
      }
    });
  } else {
    callback(403, {'Error' : 'This action requires login'});
  }
};


// Carts - PUT (Updating single item in existing cart)
// Required parameters: itemId, quantity
// Optional parameters:
// *** REQUIRES USER TO BE LOGGED IN ***
carts.put = function(data, callback){
  // validation
  let itemId = typeof(data.payload.itemId) == 'number'
              && _items.getItemIdList().indexOf(data.payload.itemId) > -1 ?
              data.payload.itemId : false;
  let quantity = typeof(data.payload.quantity) == 'number'
              && data.payload.quantity > 0
              && data.payload.quantity <= 20
              && data.payload.quantity % 1 == 0 ?
              data.payload.quantity : false;
  if(itemId && quantity){
    // Get token from headers
    let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    if(token){
      // Verify token is valid and has not expired
      _data.read('tokens', token, function(err, tokenData){
        if(!err && tokenData){
          if(tokenData.expiration > Date.now()){
            // Identify user based on token data
            let phone = tokenData.phone;
            // Lookup user to get cartId
            _data.read('users', phone, function(err, userData){
              if(!err, userData){
                // Lookup user cart
                _data.read('carts', userData.cartId, function(err, cartData){
                  if(!err && cartData){
                    let items = typeof(cartData.items) == 'object'
                                && cartData.items instanceof Array
                                && cartData.items.length > 0 ?
                                cartData.items : false;
                    // Get item data and calculate new subtotal
                    let item = _items.itemList[_items.getItemIdList().indexOf(data.payload.itemId)];
                    let subTotal = item.itemPrice * quantity;
                    if(items){
                      let cartItemWasFound = false
                      // Get item to be updated from the item array of the stored cart object
                      items.forEach(function(itemInArray){
                        // Update cart item
                        if(itemInArray.itemId == itemId && !cartItemWasFound){
                          cartItemWasFound = true
                          itemInArray.quantity = quantity;
                          itemInArray.subTotal = subTotal;
                        }
                      });
                      if(cartItemWasFound){
                        // Store updated cart object
                        _data.update('carts', userData.cartId, cartData, function(err){
                          if(!err){
                            callback(200, cartData);
                          } else {
                            callback(500, {'Error' : 'Could not store updated cart'})
                          }
                        });

                      } else {
                        callback(400, {'Error' : 'Specified item could not be found in cart. Cart was not updated.'})
                      }
                    } else {
                      callback(400, {'Error' : 'Cart is empty'})
                    }
                  } else {
                    callback(404, {'Error' : 'Cart ID could not be found'});
                  }
                });
              } else {
                callback(404, {'Error' : 'User could not be found'});
              }
            });
          } else {
            callback(403, {'Error' : 'Token has expired'});
          }
        } else {
          callback(403, {'Error' : 'Token is invalid'});
        }
      });
    } else {
      callback(403, {'Error' : 'This action requires login'});
    }
  } else {
    callback(400, {'Error' : 'Missing required field(s)'});
  }
};


// Carts - DELETE
// Required parameters: none
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
carts.delete = function(data, callback){
  // Get token from headers
  let token = typeof(data.headers.token) == 'string' ?
              data.headers.token : false;
  if(token){
    // Verify token is valid and has not expired
    _data.read('tokens', token, function(err, tokenData){
      if(!err && tokenData){
        if(tokenData.expiration > Date.now()){
          // Identify user based on token data
          let phone = tokenData.phone;
          // Lookup user to get cartId
          _data.read('users', phone, function(err, userData){
            if(!err && userData){
              // Lookup user cart
              _data.read('carts', userData.cartId, function(err, cartData){
                if(!err && cartData){
                  // Delete user cart
                  _data.delete('carts', userData.cartId, function(err){
                    if(!err){
                      // Delete cart ID from user
                      delete userData.cartId;
                      _data.update('users', userData.phone, userData, function(err){
                        if(!err){
                          callback(200);
                        } else {
                          callback(500, {'Error' : 'Could not delete user cart ID'});
                        }
                      });
                    } else {
                      callback(500, {'Error' : 'Could not delete user cart'});
                    }
                  });
                } else {
                  callback(404, {'Error' : 'Cart ID could not be found'});
                }
              });
            } else {
              callback(404, {'Error' : 'User could not be found'});
            }
          });
        } else {
          callback(403, {'Error' : 'Token has expired'});
        }
      } else {
        callback(403, {'Error' : 'Token is invalid'});
      }
    });
  } else {
    callback(403, {'Error' : 'This action requires login'});
  }
}


// Export module
module.exports = carts;
