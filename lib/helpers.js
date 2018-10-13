/*
 * General helpers and integration with third party APIs
 *
 */

// Dependencies
const crypto = require('crypto');
const conf = require('./config');
const querystring = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');


// Helpers Container
let helpers = {};


// Parse JSON string to object without throwing error
helpers.parseJsonToObject = function(str){
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch(e) {
    return {};
  }
};

// Validate email using regular expressions
helpers.validateEmail = function(email){
  let regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regExp.test(email);
};


// Hash password
helpers.hashString = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    let hashed = crypto.createHmac('SHA256', conf.hashingSecret).update(str).digest('hex');
    return hashed;
  } else {
    return false;
  }
};

// Generate random string
helpers.generateRandomStr = function(len){
  len = typeof(len) == 'number' && len > 0 && len < 21 ? len : false;
  if(len){
    // Define allowed chars in token
    let allowedChars = 'abcdefghijklmnopqrstuvxyz0123456789';
    let str = '';

    for(i=1; i<=len; i++){
      let randomChar = allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      str += randomChar;
    };
    return str;
  } else {
    return false;
  }
};

// Get price string from number
helpers.NumberToPrice = function(num){
  if(Number.isInteger(num)){
    return num + ",00";
  } else {
    return num.toString().replace(".", ",") + "0";
  }
};

// Send email using MailGun API
helpers.notifyByMailGun = function(to, subject, body, callback){
  // Compose email
  let requestPayload = {
    'from' : 'admin@' + conf.mailGun_DomainName,
    'to' : to,
    'subject' : subject,
    'text' : body
  };
  let strPayload = querystring.stringify(requestPayload);
  // Create payment request parameters
  let requestParameters = {
    'protocol' : 'https:',
    'method' : 'POST',
    'hostname' : 'api.mailgun.net',
    'path' : '/v3/' + conf.mailGun_DomainName + '/messages',
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' : "Basic " + Buffer.from(conf.mailGun_apiKey).toString("base64")
    }
  };
  // Create request object
  let req = https.request(requestParameters, function(res){
    let statusCode = res.statusCode;
    if(statusCode == 200){
      callback(false);
    } else {
      callback(res.statusCode, {'Error' : 'Notification email could not be sent'});
    }
  });
  req.on('error', function(err){
    callback(400, {'Error' : e});
  });
  req.write(strPayload);
  req.end();
};

// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = function(templateName,data,callback){
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) == 'object' && data !== null ? data : {};
  if(templateName){
    var templatesDir = path.join(__dirname,'/../templates/');
    fs.readFile(templatesDir+templateName+'.html', 'utf8', function(err,str){
      if(!err && str && str.length > 0){
        // Do interpolation on the string
        var finalString = helpers.interpolate(str,data);
        callback(false,finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = function(str,data,callback){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header',data,function(err,headerString){
    if(!err && headerString){
      // Get the footer
      helpers.getTemplate('_footer',data,function(err,footerString){
        if(!err && headerString){
          // Sandwich content between them
          var fullString = headerString+str+footerString;
          callback(false,fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

// Take HTML string and handler specific data, find/replace all keys within HTML string
helpers.interpolate = function(str,data){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};
  // Add templateGlobals to data object
  for(var keyName in conf.templateGlobals){
     if(conf.templateGlobals.hasOwnProperty(keyName)){
       data['global.'+keyName] = conf.templateGlobals[keyName]
     }
  }
  // Replace handler specific key values
  for(var key in data){
     if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
        var replaceWith = data[key];
        var find = '{'+key+'}';
        str = str.replace(find,replaceWith);
     }
  }
  return str;
};

// Get contents of static asset
helpers.getStaticAsset = function(fileName,callback){
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    var publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, function(err,data){
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};

// Export module
module.exports = helpers;
