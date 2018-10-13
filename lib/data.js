/*
 * Library for CRUD operations
 *
 */

 // Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Data Container
let lib = {};
// Declare base directory for data store
lib.baseDir = path.join(__dirname, '/../.data/');


// Create
lib.create = function(dir, file, data, callback){
  // Open a new file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', function(err, fileDesc){
    if(!err && fileDesc){
      let strData = JSON.stringify(data);

      // Write to file
      fs.writeFile(fileDesc, strData, function(err){
        if(!err){
          // Close file
          fs.close(fileDesc, function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error: closing new file.');
            }
          });
        } else {
          callback('Error: writing to new file.');
        }
      });
    } else {
      callback('Error: Could not create new file. File may already exist.');
    }
  });
};

// Read
lib.read = function(dir, file, callback){
  // Read contents of file
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
    if(!err && data){
      let parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// Update
lib.update = function(dir, file, data, callback){
  // Open file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDesc){
    if(!err && fileDesc){
      let strData = JSON.stringify(data);

      // Truncate file
      fs.truncate(fileDesc, function(err){
        if(!err){
          // Write to file
          fs.writeFile(fileDesc, strData, function(err){
            if(!err){
              // Close file
              fs.close(fileDesc, function(err){
                if(!err){
                  callback(false);
                } else {
                  callback('Error: closing file.');
                }
              });
            } else {
              callback('Error: writing to existing file.');
            }
          });
        } else {
          callback('Error: truncating file.');
        }
      });
    } else {
      callback('Error: Could not open file for update. File may not exist.');
    }
  });
};

// Delete
lib.delete = function(dir, file, callback){
  // Unlink file
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
    if(!err){
      callback(false);
    } else {
      callback('Error: deleting file.');
    }
  });
};

// List all items in directory
lib.list = function(dir, callback){
  fs.readdir(lib.baseDir+dir+'/', function(err, data){
    if(!err && data && data.length > 0){
      let trimmedNames = [];
      // Trime file extenstions from filename
      data.forEach(function(fileName){
        trimmedNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedNames);
    } else {
      callback('Error: listing files in directory.');
    }
  })
};


// Export module
module.exports = lib;
