

--- ThePizzaService --- 



Business front attached to a restful API


This is a project featuring both the UI, frontend logic and server side structures of a fictional 
online Pizza Service. Both frontend and backend were written using NodeJs and no external frameworks.

The frontend lets users perform many of the same functions as most e-commerce sites.
Users are able to create and manage accounts, login and place orders etc.
The backend is made up of a restful API allowing the application to perform CRUD operations, 
and serve up HTML, among other functions. 




Additional features:

The application also interacts with the Stripe.com API to facilitate credit card payments,
and with the Mailgun.com API to send verification emails to users when a succesful payment has
been performed.



---------------------------------------------------------------------------------------------------------------
INSTRUCTIONS
---------------------------------------------------------------------------------------------------------------
In case you want to download the project and try it out for yourself, please follow these simple steps:

1. Download project
2. In project root, create a folder named ".data" and add following folders to it => "users", "tokens", "carts", "orders" 
   (These will serve as your data stores)
3. Add a valid api key and source token for Stripe integartion.
4. Add a valid api key and domain name for Mailgun integartion.
5. Start up your server, a browser window and navigate to the URL.


(Please refer to "nodejs-PizzaServiceAPI" repository for more details on the API)
https://github.com/tas-man/nodejs-PizzaServiceAPI
