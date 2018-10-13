/*
 * App configuration
 *
 */

// Environment Container
let environment = {};

// Staging (default)
environment.staging = {
  'httpPort' : 3000,
  'envName' : 'staging',
  'hashingSecret' : 'stagingAppSecret',
  'stripe_sourceToken' : 'A_USER_CREADIT_CARD',   // Replace with valid data
  'stripe_apiKey' : 'Bearer A_UNIQUE_API_KEY',    // Replace with valid data
  'mailGun_DomainName' : 'A_DOMAIN_NAME',         // Replace with valid data
  'mailGun_apiKey' : 'A_UNIQUE_API_KEY',          // Replace with valid data
  'templateGlobals' : {
  'appName' : 'PizzaService',
  'companyName' : 'NotARealCompany, Inc.',
  'yearCreated' : '2018',
  'baseUrl' : 'http://localhost:3000/'
  }
};

// Production
environment.production = {
  'httpPort' : 3001,
  'envName' : 'production',
  'hashingSecret' : 'productionAppSecret',
  'stripe_sourceToken' : 'A_USER_CREADIT_CARD',   // Replace with valid data
  'stripe_apiKey' : 'Bearer A_UNIQUE_API_KEY',    // Replace with valid data
  'mailGun_DomainName' : 'A_DOMAIN_NAME',         // Replace with valid data
  'mailGun_apiKey' : 'A_UNIQUE_API_KEY',           // Replace with valid data
  'templateGlobals' : {
  'appName' : 'PizzaService',
  'companyName' : 'NotARealCompany, Inc.',
  'yearCreated' : '2018',
  'baseUrl' : 'http://localhost:3001/'
  }
};

// Determine environment specified through command-line
const currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// Validate environment argument, default to 'staging'
const envToExport = typeof(environment[currentEnv]) == 'object' ? environment[currentEnv] : environment.staging;

// Export module
module.exports = envToExport;
