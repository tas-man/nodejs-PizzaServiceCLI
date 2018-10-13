/*
 * Item Handlers
 *
 */

// Dependencies
const _data = require('../data');
const helpers = require('../helpers');


// Item Handler Container
let items = {};


/* Hardcoded pizza menu for demonstrational purposes.
 * This info should be stored in a proper data store
 * or alternatively be retrieved from some service.
 */

const itemList = [
  {'itemId' : "1", 'itemName' : 'Margherita', 'itemToppings' : ['tomato sauce', 'cheese'], 'itemPrice' : 7.00},
  {'itemId' : "2", 'itemName' : 'Salami', 'itemToppings' : ['tomato sauce', 'cheese', 'salami'], 'itemPrice' : 7.50},
  {'itemId' : "3", 'itemName' : 'Seafood', 'itemToppings' : ['tomato sauce', 'cheese', 'tuna'], 'itemPrice' : 7.50},
  {'itemId' : "4", 'itemName' : 'Vegetarian', 'itemToppings' : ['tomato sauce', 'cheese', 'olives', 'peppers'], 'itemPrice' : 8.00},
  {'itemId' : "5", 'itemName' : 'Meatlover', 'itemToppings' : ['tomato sauce', 'cheese', 'salami', 'ham'], 'itemPrice' : 8.50}
];
items.itemList = itemList;

// Get all item id:s
items.getItemIdList = function(){
  itemIdList = [];
  items.itemList.forEach(function(item){
    itemIdList.push(item.itemId);
  });
  return itemIdList;
};

// Items - GET
// Required parameters: none
// Optional parameters: none
// *** REQUIRES USER TO BE LOGGED IN ***
items.get = function(data, callback){
  // Get token from headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  if(token){
    // Verify token is valid and has not expired
    _data.read('tokens', token, function(err, tokenData){
      if(!err, tokenData){
        if(tokenData.expiration > Date.now()){
          callback(200, items.itemList);
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

// Export module
module.exports = items;
