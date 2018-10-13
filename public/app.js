/*
 * Frontend Logic for application
 *
 */

 var app = {};

 app.config = {
   'sessionToken' : false
 };

// Ajax client for calling the backend
 app.client = {};

// Ajax interface
app.client.request = function(headers, path, method, queryStringObject, payload, callback){
  // Determine defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ?
                              method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ?
                      queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;
  // Add query string parameters to path
  var requestUrl = path+'?';
  var counter = 0;
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If query string parameter has been added, preprend following with ampersand
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value to path
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }
  // Format request as JSON
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");
  // Add headers to request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }
  // Add current session token to headers
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }
  // Handle response
  xhr.onreadystatechange = function() {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        var statusCode = xhr.status;
        var responseReturned = xhr.responseText;
        if(callback){
          try{
            var parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }
        }
      }
  }
  // Send payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};


// Bind forms
app.bindForms = function(){
  if(document.querySelector("form")){
    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){
        // Prevent submission
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();
        // Hide potential expired error message
        if(document.querySelector("#"+formId+" .formError")){
          document.querySelector("#"+formId+" .formError").style.display = 'none';
        }
        // Hide potential expired warning
        if(document.querySelector("#"+formId+" .warning")){
          document.querySelector("#"+formId+" .warning").style.display = 'none';
        }
        // Hide potential expired success message
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }
        // Gather inputs into payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement = typeof(elements[i].classList.value) == 'string'
                                && elements[i].classList.value.length > 0 ?
                                elements[i].classList.value : '';
            var valueOfElement = typeof(elements[i].classList.value) == 'number'?
                                parseInt(elements[i].value) : elements[i].value;
            // If input is named _method, override given form method
            var nameOfElement = elements[i].name;
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              payload[nameOfElement] = valueOfElement;
            }
          }
        }
        // If the method is DELETE, send queryStringObject instead of payload
        var queryStringObject = method == 'DELETE' ? payload : {};
        // Call API
        app.client.request(undefined, path, method, queryStringObject, payload, function(statusCode,responsePayload){
          if(statusCode !== 200){
            if(statusCode == 403){
              app.logUserOut();
            } else {
              // Specify error
              var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';
              document.querySelector("#"+formId+" .formError").innerHTML = error;
              // Display form error field
              document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
          } else {
            app.formResponseProcessor(formId,payload,responsePayload);
          }
        });
      });
    }
  }
};

// Submitted form response
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  // log in user after account creation
  if(formId == 'accountCreate'){
    var newPayload = {
      'phone' : requestPayload.phone,
      'password' : requestPayload.password
    };

    app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function(newStatusCode,newResponsePayload){
      if(newStatusCode !== 200){
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';
        // Display potential error message
        document.querySelector("#"+formId+" .formError").style.display = 'block';
      } else {
        // Set token and route user
        app.setSessionToken(newResponsePayload);
        window.location = '/items/all';
      }
    });
  }
  // Set token and route user (Login)
  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload);
    window.location = '/items/all';
  }
  // Display potential success messages
  let formsWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'itemList1', 'itemList2', 'itemList3', 'itemList4', 'itemList5', 'checkoutPayment', 'checkoutCartDeletion'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }
  // Reload Checkout Page after 2s
  if(formId == 'checkoutCartDeletion'){
    setTimeout(function(){
      document.location.reload(true);
    }, 2000);
  }
  // Redirect to Orders Page in 5s after successful payment
  if(formId == 'checkoutPayment'){
    setTimeout(function(){
      window.location = '/order/log';
    }, 5000);
  }
  // Logout and route user (Account Deletion)
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }
};

// Enable/disable loggedIn class on HTML body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Bind logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){
    // Prevent immeadiate routing
    e.preventDefault();
    app.logUserOut();
  });
};

// Logout and route user
app.logUserOut = function(redirectUser){
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;
  // Get token
  var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;
  // DELETE token
  var queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function(statusCode,responsePayload){
    // Set app.config token to false
    app.setSessionToken(false);
    // Route user
    if(redirectUser){
      window.location = '/session/deleted';
    }
  });
};

/************ LOAD DATA TO HTML *************************************/

// General loader
app.loadDataToPage = function(){
  // Get current page
  var bodyClassList = document.querySelector("body").classList;
  var firstClass = typeof(bodyClassList[0]) == 'string' ? bodyClassList[0] : false;

  // Account Details
  if(firstClass == 'accountEdit'){
    app.loadAccountEdit();
  }
  // Checkout
  if(firstClass == 'checkout'){
    app.loadCheckout();
  }
  // Orderlog
  if(firstClass == 'orderLog'){
    app.loadOrderLog();
  }
};

// Load Account Details Page Data
app.loadAccountEdit = function(){
  // Get phone from token, logout user if none exists
  var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if(phone){
    // Get user data
    var queryStringObject = {
      'phone' : phone
    };
    app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, function(statusCode,responsePayload){
      if(statusCode == 200){
        // Insert data into form
        document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;
        document.querySelector("#accountEdit1 .nameInput").value = responsePayload.name;
        document.querySelector("#accountEdit1 .lnameInput").value = responsePayload.lname;
        document.querySelector("#accountEdit1 .emailInput").value = responsePayload.email;
        document.querySelector("#accountEdit1 .addressInput").value = responsePayload.address;
        // Insert hidden phone field into all forms on page
        var hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
        for(var i = 0; i < hiddenPhoneInputs.length; i++){
            hiddenPhoneInputs[i].value = responsePayload.phone;
        }
      } else {
        // Anything but 200 => log user out
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// Load Checkout Page Data
app.loadCheckout = function(){
  // Get phone from token, logout user if none exists
  var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if(phone){
    // Get cart data
    queryStringObject = {
      'phone' : phone
    };
    app.client.request(undefined, 'api/carts', 'GET', queryStringObject, undefined, function(statusCode, responsePayload){
      if(statusCode == 200){
        let cartData = typeof(responsePayload.items) == 'object'
                    && responsePayload.items instanceof Array
                    && responsePayload.items.length > 0 ?
                    responsePayload.items : false;
        let totalAmount = 0;
        if(cartData){
            for(i=0; i < cartData.length; i++){
              // Insert cart data into table
              let table = document.getElementById("cartListTable");
              // Create new row
              let newRow = table.insertRow(-1);
              newRow.classList.add("cartRow");
              // Create new cells
              let cell_0 = newRow.insertCell(0);
              let cell_1 = newRow.insertCell(1);
              let cell_2 = newRow.insertCell(2);
              // Fill cells with data
              cell_0.innerHTML = cartData[i].itemName;
              cell_1.innerHTML = cartData[i].quantity;
              cell_2.innerHTML = cartData[i].subTotal;
              // Add subtotal to totalAmount
              totalAmount += cartData[i].subTotal;
            }
            // Show Total Amount
            let totalAmountHtml = document.getElementById("totalAmount");
            totalAmountHtml.innerHTML = app.NumberToPrice(totalAmount);
          } else {
            document.getElementById("noCartMessage").style.display = 'block';
        }
      } else if (statusCode == 400 || statusCode == 404 || statusCode == 500) {
          document.getElementById("noCartMessage").style.display = 'block';
      } else {
          app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
}

app.loadOrderLog = function(){
  // Get phone from token, log user out if none exist
  let phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
  if(phone){
    // Get order data
    queryStringObject = {
      'phone' : phone
    };
    app.client.request(undefined, 'api/orders', 'GET', queryStringObject, undefined, function(statusCode, responsePayload){
      if(statusCode == 200){
        // All user orders are returned as an array
        let orders = typeof(responsePayload) == 'object'
                    && responsePayload instanceof Array
                    && responsePayload.length > 0 ?
                    responsePayload : false;
        if(orders){
          for(i=0; i < orders.length; i++){
            let orderId = typeof(orders[i].orderId) == 'string' ? orders[i].orderId : false;
            let email = typeof(orders[i].email) == 'string' ? orders[i].email : false;
            let name = typeof(orders[i].name) == 'string' ? orders[i].name : false;
            let address = typeof(orders[i].address) == 'string' ? orders[i].address : false;
            let orderTotal = typeof(orders[i].orderTotal) == 'number' ? orders[i].orderTotal : false;
            // Validate each order
            if(orderId && email && name && address && orderTotal){
              // Insert cart data into table
              let table = document.getElementById("orderListTable");
              // Create new row
              let newRow = table.insertRow(-1);
              newRow.classList.add("orderRow");
              // Create new cells
              let cell_0 = newRow.insertCell(0);
              let cell_1 = newRow.insertCell(1);
              let cell_2 = newRow.insertCell(2);
              let cell_3 = newRow.insertCell(3);
              let cell_4 = newRow.insertCell(4);
              // Fill cells with data
              cell_0.innerHTML = orderId;
              cell_1.innerHTML = email;
              cell_2.innerHTML = name;
              cell_3.innerHTML = address;
              cell_4.innerHTML = orderTotal;
            } else {
              document.getElementById("noOrdersMessage").style.display = 'block';
            }
          }
        } else {
          app.logUserOut();
        }
      } else if (statusCode == 400 || statusCode == 404) {
          document.getElementById("noOrdersMessage").style.display = 'block';
      } else {
          app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
}

app.NumberToPrice = function(num){
  if(Number.isInteger(num)){
    return num + ",00";
  } else {
    return num.toString().replace(".", ",") + "0";
  }
};

/************ SESSION TOKENS ***************************************/

// Get token from localstorage and assign to app.config
app.getSessionToken = function(){
  var tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set token in app.config object and in localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update token with new expiration time
    var payload = {
      'id' : currentToken.id,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display potential error message
      if(statusCode == 200){
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display potential error message
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token every 5 minutes
app.tokenUpdateLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};

/************ INIT ***************************************/

// Init
app.init = function(){
  // Bind all forms
  app.bindForms();
  // Bind logout logout button
  app.bindLogoutButton();
  // Get token from localStorage
  app.getSessionToken();
  // Update token repeatedly
  app.tokenUpdateLoop();
  // Load data
  app.loadDataToPage();
};

// Call init after window loads
window.onload = function(){
  app.init();
};
