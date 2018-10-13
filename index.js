/*
 * Main app file
 *
 */

// Dependencies
const server = require('./lib/server');
const cliTool = require('./lib/cliTool');

// App Container
let app = {};

// Init
(app.init = function() {
  // Start server
  server.init();
  // Start cliTool after 100ms
  setTimeout(function(){
    cliTool.init();
  }, 100);

})();

// Export App
module.exports = app;
