/*
 * Server tasks
 *
 */

// Dependencies
const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const util = require('util');
const debug = util.debuglog('server');
const conf = require('./config');
const handlers = require('./handlers/handlers');
const helpers = require('./helpers');

// Server Container
let server = {};

// Instantiate server
server.httpSrv = http.createServer(function(req, res){
  server.genServer(req, res);
});

// Generic server logic, (HTTPS support may be easily added)
server.genServer = function(req, res){
  // Get url, path, query string, method and headers from request
  const pUrl = url.parse(req.url, true);
  const path = pUrl.pathname;
  const trimPath = path.replace(/^\/+|\/+$/g, '');
  const queryStringObj = pUrl.query;
  const method = req.method.toLowerCase();
  const headers = req.headers;

  // Get payload
  const decoder = new stringDecoder('utf8');
  let buf = '';
  // Eventhandler: Incoming data
  req.on('data', function(data){
    buf += decoder.write(data);
  });
  // Eventhandler: Data stream ended
  req.on('end', function(){
    buf += decoder.end();
    // Acquire appropriate request handler
    let selectedHandler = typeof(server.router[trimPath]) !== 'undefined' ? server.router[trimPath] : handlers.notFound;
    // If request is within public directory, use public handler
    selectedHandler = trimPath.indexOf('public/') > -1 ? handlers.public : selectedHandler;

    // Gather data for handlers
    let data = {
      'trimmedPath' : trimPath,
      'queryStringObj' : queryStringObj,
      'method' : method,
      'headers' : headers,
      'payload' : helpers.parseJsonToObject(buf)
    }

    // Route request to handler
    selectedHandler(data, function(statusCode, payload, contentType){
      contentType = typeof(contentType) == 'string' ? contentType : 'json';
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      let payloadStr = '';
      if(contentType == 'json'){
        res.setHeader('Content-Type', 'application/json');
        payload = typeof(payload) == 'object' ? payload : {};
        payloadStr = JSON.stringify(payload);
      }
      if(contentType == 'html'){
        res.setHeader('Content-Type', 'text/html');
        payloadStr = typeof(payload) == 'string' ? payload : '';
      }
      if(contentType == 'css'){
        res.setHeader('Content-Type', 'text/css');
        payloadStr = typeof(payload) !== 'undefined' ? payload : '';
      }
      if(contentType == 'png'){
        res.setHeader('Content-Type', 'image/png');
        payloadStr = typeof(payload) !== 'undefined' ? payload : '';
      }
      if(contentType == 'favicon'){
        res.setHeader('Content-Type', 'image/x-icon');
        payloadStr = typeof(payload) !== 'undefined' ? payload : '';
      }
      if(contentType == 'plain'){
        res.setHeader('Content-Type', 'text/plain');
        payloadStr = typeof(payload) !== 'undefined' ? payload : '';
      }

      // Return response parts common to all content types
      res.writeHead(statusCode);
      res.end(payloadStr);

      // In case of 200 response => print GREEN, otherwise print RED
      if(statusCode == 200){
       debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimPath+' '+statusCode);
      } else {
       debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimPath+' '+statusCode);
      }
    });
  });
};

// Define request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/deleted' : handlers.accountDeleted,
  'account/edit' : handlers.accountEdit,
  'session/create' : handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'items/all' : handlers.itemList,            // @TODO
  'cart/checkout': handlers.checkout,         // @TODO
  'order/log' : handlers.orderLog,            // @TODO
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/items' : handlers.items,
  'api/carts' : handlers.carts,
  'api/orders' : handlers.orders,
  'ping' : handlers.ping,
  'public' : handlers.public,
  'favicon.ico' : handlers.favicon
};

// Init script
server.init = function(){
  // Start server
  server.httpSrv.listen(conf.httpPort, function() {
    console.log('\x1b[36m%s\x1b[0m','Server is listening on port '+conf.httpPort);
  });
};


// Export server
module.exports = server;
