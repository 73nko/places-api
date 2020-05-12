// Set the connection string based from the config vars of the production server
// To run locally use 'mongodb://localhost/mern-crud' instead of process.env.DB
require("dotenv").config();

const user = process.env.USER;
const password = process.env.PASS;
const server = process.env.CLUSTER;
const dbConnection = `mongodb+srv://${user}:${password}@${server}/places?retryWrites=true&w=majority`;

module.exports = {
  db: dbConnection,
};
