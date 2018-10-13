/*
 *  Order Handlers
 *
 */

// Dependencies
const _data   = require('../data');
const helpers = require('../helpers');
const conf = require('../config');
const querystring = require('querystring');
const https = require('https');

// Order Handler Container
let orders = {};


// Orders - POST  (Place an order)
// Required parameters: none
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
orders.post = function(data, callback){
  // Get token from headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  if(token){
    // Verify token is valid and has not expired
    _data.read('tokens', token, function(err, tokenData){
      if(!err, tokenData){
        if(tokenData.expiration > Date.now()){
          // Identify user based on token data
          let phone = tokenData.phone;
          // Lookup user
          _data.read('users', phone, function(err, userData){
              if(!err && userData){
                let cartId = typeof(userData.cartId) == 'string'
                            && userData.cartId.trim().length == 20 ?
                            userData.cartId : false;
                if(cartId){
                  // Lookup cart
                  _data.read('carts', cartId, function(err, cartData){
                    if(!err && cartData){
                      let items = typeof(cartData.items) == 'object'
                                  && cartData.items instanceof Array
                                  && cartData.items.length > 0 ?
                                  cartData.items : false;
                      if(items){
                        // Create order id
                        let orderId = helpers.generateRandomStr(20);
                        // Calculate order total
                        let orderTotal = 0;
                        items.forEach(function(itemInArray){
                          orderTotal += itemInArray.subTotal;
                        });

                        // Create order object
                        let orderObj = {
                          'orderId' : orderId,
                          'email' : userData.email,
                          'name' : userData.name,
                          'address' : userData.address,
                          'items' : items,
                          'orderTotal' : orderTotal,
                          'timestamp' : Date.now()
                        };

                        // Create payment request body
                        let requestPayload = {
                          'amount' : orderTotal*100,  // Value expected in cents
                          'currency' : 'eur',
                          'source' : conf.stripe_sourceToken,
                          'description' : 'Simulated charge for educational purposes. ' + 'Order ID: ' + orderId
                        };
                        let strPayload = querystring.stringify(requestPayload);

                        // Create payment request parameters
                        let requestParameters = {
                          'protocol' : 'https:',
                          'method' : 'POST',
                          'hostname' : 'api.stripe.com',
                          'path' : '/v1/charges',
                          'headers' : {
                            'Content-Type' : 'application/x-www-form-urlencoded',
                            'Authorization' : conf.stripe_apiKey
                          }
                        };

                        // Create request object for sending payment details to Stripe API
                        let req = https.request(requestParameters, function(res){
                          let statusCode = res.statusCode;
                          if(statusCode == 200){
                            // Store order if it was successful
                            _data.create('orders', orderId, orderObj, function(err){
                              if(!err){
                                // Remove cart assigned to user
                                delete userData['cartId'];
                                // Assign order to user
                                let userHasPreviousOrders = typeof(userData.orders) == 'object'
                                                          && userData.orders instanceof Array ?
                                                          true : false;
                                if(userHasPreviousOrders){
                                  // Add new order to the end of the array
                                  userData.orders.push(orderId);
                                } else {
                                  // Create a new array
                                  userData.orders = [orderId];
                                }
                                // Update user
                                _data.update('users', phone, userData, function(err){
                                  if(!err){
                                    // Delete cart
                                    _data.delete('carts', cartId, function(err){
                                      if(!err){
                                        // Create price format
                                        let orderTotalStr = helpers.NumberToPrice(orderTotal);
                                        let subTotalStr = "";
                                        // Create notification email message for user
                                        let subject = 'PizzaDeliveryAPI - Receipt - Order ID: ' + orderId;
                                        let body = 'Order issued by: ' + userData.name + '\n\nAddress: ' + userData.address + '\nAmount Paid: ' + orderTotalStr + '€\n\nOrdered Items:';
                                        items.forEach(function(itemInArray){
                                          subTotalStr = helpers.NumberToPrice(itemInArray.subTotal);
                                          body += '\n\n' + itemInArray.itemName + " | Quantity: " + itemInArray.quantity + ' | SubTotal: ' + subTotalStr + '€';
                                        });
                                        // Send order notification email to user through MailGun API
                                        helpers.notifyByMailGun(userData.email, subject, body, function(err){
                                          if(!err){
                                            callback(200, orderObj);
                                          } else {
                                            callback(400, {'Error' : err});
                                          }
                                        });

                                      } else {
                                        callback(500, {'Error' : 'Could not delete cart'});
                                      }
                                    });

                                  } else {
                                    callback(500, {'Error' : 'Could not update user with order ID'});
                                  }
                                });

                              } else {
                                callback(500, {'Error' : 'Could not store new order'});
                              }
                            });
                          } else {
                            callback(res.statusCode, {'Error' : 'Payment could not be completed!'});
                          }
                        });
                        // Handle error on request
                        req.on('error', function(e){
                          callback(400, {'Error' : e});
                        });
                        // Add payload to request
                        req.write(strPayload);
                        req.end();


                      } else {
                        callback(400, {'Error' : 'Cart is empty'});
                      }
                    } else {
                      callback(404, {'Error' : 'Cart could not be found'});
                    }
                  });
                } else {
                  callback(400, {'Error' : 'User has no cart'});
                }

              } else {
                callback(404, {'Error' : 'User could not be found'});
              }
          });
        } else {
          callback(400, {'Error' : 'Token has expired'});
        }
      } else {
          callback(404, {'Error' : 'Token could not be found'});
      }
    });
  } else {
    callback(400, {'Error' : 'This action requires login'});
  }
};


// Orders - GET
// Required parameters: none
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
orders.get = function(data, callback){
  // Get token from headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  if(token){
    // Verify token is valid and has not expired
    _data.read('tokens', token, function(err, tokenData){
      if(!err && tokenData){
        // Verify token is valid and has not expired
        if(tokenData.expiration > Date.now()){
          // Identify user based on token
          let phone = tokenData.phone;
          // Lookup user
          _data.read('users', phone, function(err, userData){
            if(!err && userData){
              // Get all orders assigned to user
              let orders = typeof(userData.orders) == 'object'
                          && userData.orders instanceof Array ?
                          userData.orders : false;
              if(orders){
                // Gather order information for user
                let orderInfo = [];
                let i = 0;

                (readOrderFile = function(i){
                  _data.read('orders', orders[i], function(err, orderData){
                    if(!err && orderData){
                      orderInfo.push(orderData);
                      if(i < orders.length - 1){
                        readOrderFile(++i);
                      } else{
                        callback(200, orderInfo);
                      }
                    } else {
                      callback(404, {'Error' : 'Order could not be found'});
                    }
                  });
                })(i);

              } else {
                // If the user has no orders, return an empty array
                callback(200, []);
              }
            } else {
              callback(404, {'Error' : 'User could not be found'});
            }
          });

        } else {
          callback(403, {'Error' : 'Token has expired'});
        }
      } else {
        callback(403, {'Error' : 'Token could not be found'});
      }
    });
  } else {
    callback(403, {'Error' : 'This action requires login'});
  }
};


// Export module
module.exports = orders;
