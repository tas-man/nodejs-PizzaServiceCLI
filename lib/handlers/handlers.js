/*
 * Request Handlers
 *
 */

// Dependencies
const _users  = require('./userHandlers');
const _tokens = require('./tokenHandlers');
const _items  = require('./itemHandlers');
const _carts  = require('./cartHandlers');
const _orders = require('./orderHandlers');
const helpers = require('../helpers');

// Handlers Container
let handlers = {};

/*
 * HTML Handlers
 *
 */

// Index
handlers.index = function(data,callback){
  // Only accept GET
  if(data.method == 'get'){
    // Gather data for interpolation
    let templateData = {
      'head.title' : 'The Pizza Service - Greatest non existent pizzas ever!',
      'head.description' : 'Order a pizza through our service, you\'ll never get it..',
      'body.class' : 'index'
    };
    helpers.getTemplate('index',templateData,function(err,str){
      if(!err && str){
        // Add universal header and footer templates
        helpers.addUniversalTemplates(str,templateData,function(err,str){
          if(!err && str){
            callback(200,str,'html');
          } else {
            callback(500,undefined,'html');
          }
        });
      } else {
        callback(500,undefined,'html');
      }
    });
  } else {
    callback(405,undefined,'html');
  }
};

// Public assets
handlers.public = function(data,callback){
  // Only accept GET
  if(data.method == 'get'){
    let trimmedAssetName = data.trimmedPath.replace('public/','').trim();
    if(trimmedAssetName.length > 0){
      helpers.getStaticAsset(trimmedAssetName,function(err,data){
        if(!err && data){
          // Determine content type (default to plain text)
          var contentType = 'plain';
          if(trimmedAssetName.indexOf('.css') > -1){
            contentType = 'css';
          }
          if(trimmedAssetName.indexOf('.png') > -1){
            contentType = 'png';
          }
          if(trimmedAssetName.indexOf('.ico') > -1){
            contentType = 'favicon';
          }
          callback(200,data,contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

// Favicon
handlers.favicon = function(data,callback){
  // Only accept GET
  if(data.method == 'get'){
    helpers.getStaticAsset('favicon.ico',function(err,data){
      if(!err && data){
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Create Account
handlers.accountCreate = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Create your account',
        'head.description' : 'Signing up is fast and easy',
        'body.class' : 'accountCreate'
      }
      helpers.getTemplate('accountCreate', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// Edit Account
handlers.accountEdit = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Account Details',
        'body.class' : 'accountEdit'
      }
      helpers.getTemplate('accountEdit', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// Deleted Account
handlers.accountDeleted = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Account Deleted',
        'head.description' : 'Your account was permanently deleted',
        'body.class' : 'accountDeleted'
      }
      helpers.getTemplate('accountDeleted', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// Create Session
handlers.sessionCreate = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Login',
        'head.description' : 'Enter your phone number and password to access your account.',
        'body.class' : 'sessionCreate'
      }
      helpers.getTemplate('sessionCreate', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// Deleted Session
handlers.sessionDeleted = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Logged Out',
        'head.description' : 'Your were logged out of your account',
        'body.class' : 'sessionDeleted'
      }
      helpers.getTemplate('sessionDeleted', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// View Menu Items
handlers.itemList = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Menu',
        'head.description' : 'Add your favorite pizzas to your cart',
        'body.class' : 'itemList'
      }
      helpers.getTemplate('itemList', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// Shopping Cart Checkout
handlers.checkout = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Checkout',
        'head.description' : 'Place your order',
        'body.class' : 'checkout'
      }
      helpers.getTemplate('checkout', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

// View Order Log
handlers.orderLog = function(data, callback){
  // Only accept GET
    if(data.method == 'get'){
      // Gather data for interpolation
      let templateData = {
        'head.title' : 'Orders',
        'head.description' : 'Place your order',
        'body.class' : 'orderLog'
      }
      helpers.getTemplate('orderLog', templateData, function(err, str){
        if(!err && str){
          // Add universal header and footer templates
          helpers.addUniversalTemplates(str, templateData, function(err, str){
            if(!err && str){
              callback(200, str, 'html');
            } else {
              callback(500, undefined, 'html');
            }
          });
        } else {
          callback(500, undefined, 'html');
        }
      });
    } else {
      callback(405, undefined, 'html');
    }
};

/*
 * JSON API Handlers
 *
 */

/************ USERS ***************************************/
handlers.users = function(data, callback){
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _users[data.method](data, callback);
  } else {
    callback(405); // Method not allowed
  }
};

/************ TOKENS **************************************/
handlers.tokens = function(data, callback){
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _tokens[data.method](data, callback);
  } else {
    callback(405); // Method not allowed
  }
};

/************ ITEMS ***************************************/
handlers.items = function(data, callback){
  let acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _items[data.method](data, callback);
  } else {
    callback(405); // Method not allowed
  }
};

/************ CARTS ***************************************/
handlers.carts = function(data, callback){
  let acceptableMethods = ['post', 'get', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _carts[data.method](data, callback);
  } else {
    callback(405); // Method not allowed
  }
};

/************ ORDERS ***************************************/
handlers.orders = function(data, callback){
  let acceptableMethods = ['post', 'get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _orders[data.method](data, callback);
  } else {
    callback(405); // Method not allowed
  }
};

/************ PING *****************************************/
handlers.ping = function(data, callback){
  callback(200);
};
/************ NOT FOUND ************************************/
handlers.notFound = function(data, callback){
  callback(404);
};

// Export module
module.exports = handlers;
