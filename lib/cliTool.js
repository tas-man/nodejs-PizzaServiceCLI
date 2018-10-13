/*
 *  CLI Tool for getting information from the application datastores
 *
 */

// Dependecies
const readline = require('readline');
const util = require('util');
const events = require('events');
const v8 = require('v8');
const os = require('os');
const fs = require('fs');
const helpers = require('./helpers');
const _data = require('./data');
const _items = require('./handlers/itemHandlers');

class _events extends events{};
let ee = new _events();

let cliTool = {};

const acceptedCommands = ['help', 'list menu', 'list orders', 'list order id:', 'list users', 'list user id:', 'q'];
const acceptedCommandDesc = { 'help':             'Show manual',
                              'list menu':        'Show list of menu items',
                              'list orders':      'Show list of orders made during last 24h',
                              'list order id:':  'Show order specified by id:{orderId}',
                              'list users':       'Show list of users registered during last 24h',
                              'list user id:':   'Show user specified by id:{phone}',
                              'q':                'KILL cli tool along with the rest of the app'
                            };

// Event Listeners
ee.on('help', function(input){
  cliTool.responder.help();
});

ee.on('q', function(input){
  cliTool.responder.exit();
});

ee.on('list menu', function(input){
  cliTool.responder.listMenu();
});

ee.on('list orders', function(input){
  cliTool.responder.listOrders();
});

ee.on('list order id:', function(input){
  cliTool.responder.listOrderId(input);
});

ee.on('list users', function(input){
  cliTool.responder.listUsers();
});

ee.on('list user id:', function(input){
  cliTool.responder.listUserId(input);
});

// -----------------------------------------------------------------------------
// RESPONDERS

// Responder object
cliTool.responder = {};

// List commands & descriptions
cliTool.responder.help = function(){
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("PIZZA SERVICE - CLI TOOL MANUAL");
  cliTool.addHorizontal();
  cliTool.addVertical();
  // Show descriptions in purple/yellow
  for(let key in acceptedCommandDesc){
    if(acceptedCommandDesc.hasOwnProperty(key)){
      let value = '\x1b[33m' + acceptedCommandDesc[key] + '\x1b[0m';
      let line = '  \x1b[35m ' + key + '   \x1b[0m';
      let paddingL = 40 - line.length;
        for(i=0; i < paddingL; i++){
          line += ' ';
        }
      line += value;
      console.log(line);
      cliTool.addVertical();
    }
  }
  cliTool.addHorizontal();
  cliTool.addVertical();
};

// Quit CLI tool
cliTool.responder.exit = function(str){
  process.exit(0);
};

// List menu items
cliTool.responder.listMenu = function(){
  // Get menu
  let itemList = _items.itemList;
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("MENU");
  cliTool.addHorizontal();
  cliTool.addVertical();
  // Print out each menu item
  itemList.forEach(function(item){
    for(let key in item){
      let value = '\x1b[33m' + item[key] + '\x1b[0m';
      let line = '  \x1b[32m' + key + '   \x1b[0m'
      let paddingL = 40 - line.length;
        for(i=0; i < paddingL; i++){
          line += ' ';
        }
      line += value;
      console.log(line);
    }
    cliTool.addVertical();
  });
  cliTool.addHorizontal();
  cliTool.addVertical();
};

// List orders made during last 24h
cliTool.responder.listOrders = function(){
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("ORDERS - Placed during last 24h");
  cliTool.addHorizontal();
  cliTool.addVertical();
  // Get order files
  _data.list('orders', function(err, data){
    if(!err && data){
      let filesRead = 0;
      // Get order file contents
      for(let i=0; i < data.length; i++){
        _data.read('orders', data[i], function(err, orderData){
          if(!err && orderData){
            filesRead++;
              // Print out each order
              let value = '';
              if(orderData.timestamp > (Date.now() - (1000 * 60 * 60 * 24))){
                  for(let key in orderData){
                    if(key === 'items' && typeof(orderData[key]) == 'object'){
                      let itemNames = '';
                      orderData[key].forEach(function(item){
                        itemNames += item.itemName + ': ' + item.quantity + ', ';
                      });
                      value = '\x1b[33m' + itemNames + '\x1b[0m';
                    } else {
                      value = '\x1b[33m' + orderData[key] + '\x1b[0m';
                    }
                    let line = '  \x1b[32m' + key + '   \x1b[0m'
                    let paddingL = 40 - line.length;
                    for(let j=0; j < paddingL; j++){
                      line += ' ';
                    }
                    line += value;
                    console.log(line);
                  }
                  cliTool.addVertical();
              }
              if(filesRead === data.length){ // End with dashed line
                cliTool.addHorizontal();
                cliTool.addVertical();
              }
          } else {
            console.log("Error reading order files");
          }
        });
      }
    } else {
      console.log("Error reading orders directory");
    }
  });
};

// Display specific order
cliTool.responder.listOrderId = function(str){
  console.log(str);
  let arr = str.split(':');
  let orderId = typeof(arr[1]) == 'string' && arr[1].trim().length == 20 ?
                arr[1].trim() : false;
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("ORDER BY ID");
  cliTool.addHorizontal();
  cliTool.addVertical();
  if(orderId){
    // Read order file
    _data.read('orders', orderId, function(err, orderData){
      if(!err && orderData){
        // Print out each order
        let value = '';
        for(let key in orderData){
          if(key === 'items' && typeof(orderData[key]) == 'object'){
            let itemNames = '';
            orderData[key].forEach(function(item){
              itemNames += item.itemName + ': ' + item.quantity + ', ';
            });
            value = '\x1b[33m' + itemNames + '\x1b[0m';
          } else {
            value = '\x1b[33m' + orderData[key] + '\x1b[0m';
          }
          let line = '  \x1b[32m' + key + '   \x1b[0m'
          let paddingL = 40 - line.length;
          for(let j=0; j < paddingL; j++){
            line += ' ';
          }
          line += value;
          console.log(line);
        }
        cliTool.addVertical();
        cliTool.addHorizontal();
        cliTool.addVertical();
      } else {
        console.log("Error reading order file");
      }
    });
  } else {
    console.log("Please specify a valid order id:{orderId}");
  }
};

// List users who registered during last 24h
cliTool.responder.listUsers = function(){
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("USERS - Registered during last 24h");
  cliTool.addHorizontal();
  cliTool.addVertical();
  // Get user files
  _data.list('users', function(err, data){
    if(!err && data){
      let filesRead = 0;
      // Get user file contents
      for(let i=0; i < data.length; i++){
        _data.read('users', data[i], function(err, userData){
          if(!err && userData){
            filesRead++;
            // Print out each user
            if(userData.timestamp > (Date.now() - (1000 * 60 * 60 * 24))){
              for(let key in userData){
                // Do not printout user password
                if(key === 'passwordHashed') continue;
                let value = '\x1b[33m' + userData[key] + '\x1b[0m';
                let line = '  \x1b[32m' + key + '   \x1b[0m'
                let paddingL = 40 - line.length;
                  for(let j=0; j < paddingL; j++){
                    line += ' ';
                  }
                line += value;
                console.log(line);
              }
              cliTool.addVertical();
            }
            if(filesRead === data.length){ // End with dashed line
              cliTool.addHorizontal();
              cliTool.addVertical();
            }
          } else {
            console.log("Error reading user files");
          }
        });
      }
    } else {
      console.log("Error reading users directory");
    }
  });
};

// List specific user
cliTool.responder.listUserId = function(str){
  let arr = str.split(':');
  let phone = typeof(arr[1]) == 'string' && arr[1].trim().length == 10 ?
              arr[1].trim() : false;
  // Display Header
  cliTool.addVertical();
  cliTool.addHorizontal();
  cliTool.centerText("USER BY ID");
  cliTool.addHorizontal();
  cliTool.addVertical();
  if(phone){
    _data.read('users', phone, function(err, userData){
      if(!err && userData){
        // Print out each user
        for(let key in userData){
          // Do not printout user password
          if(key === 'passwordHashed') continue;
          let value = '\x1b[33m' + userData[key] + '\x1b[0m';
          let line = '  \x1b[32m' + key + '   \x1b[0m'
          let paddingL = 40 - line.length;
            for(let j=0; j < paddingL; j++){
              line += ' ';
            }
          line += value;
          console.log(line);
        }
        cliTool.addVertical();
        cliTool.addHorizontal();
        cliTool.addVertical();
      } else {
      console.log("Error reading user files");
      }
    });
  } else {
    console.log("Please specify a valid user id:{phone}");
  }
};

// -----------------------------------------------------------------------------
// GENERAL CLI OUTPUT FORMATTING

// Add newline(s)
cliTool.addVertical = function(lines){
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for(i=0; i < lines; i++){
    console.log('');
  }
};

// Add dash line
cliTool.addHorizontal = function(){
  // Get available screen width
  let width = process.stdout.columns;
  let line = '';
  for(i=0; i < width; i++){
    line+='-';
  }
  console.log(line);
};

// Create centeredText text
cliTool.centerText = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';
  // Get current CLI screen width
  let width = process.stdout.columns;
  // Calculate left padding
  let leftPadding = Math.floor((width - str.length) / 2);
  let line = '';
  for(i=0; i < leftPadding; i++){
    line += ' ';
  }
  line += str;
  console.log(line);
};

// -----------------------------------------------------------------------------
// INITIALIZATION & USER INPUT DELEGATION

cliTool.parseInput = function(input){
  let isCommandMatch = false;
  let str = typeof(input) == 'string' && input.trim().length > 0 ? input.trim() : false;
  // Discard empty input line
  if(str){
    acceptedCommands.some(function(cmd){
      // Emit event on accepted command input
      if(str.toLowerCase().indexOf(cmd) > -1){
        isCommandMatch = true;
        ee.emit(cmd, str);
        return true;
      }
    });
    if(!isCommandMatch){
      console.log("Unrecognized command, please try again");
    }
  }
};


cliTool.init = function(){
  console.log('\x1b[35m%s\x1b[0m',"CliTool is running");
  // Start UI
  let _interface = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
    prompt : '>>'
  });
  // Create initial prompt
  _interface.prompt();

  // Handle line input
  _interface.on('line', function(input){
    cliTool.parseInput(input);
    // Re-initialize prompt
    setTimeout(function(){
      _interface.prompt();
    }, 100);
  });

  // Kill cliTool on user close
  _interface.on('close', function(input){
    process.exit(0);
  });
};

module.exports = cliTool;
