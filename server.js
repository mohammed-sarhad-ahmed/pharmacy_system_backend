const mongoose = require('mongoose');
const app = require('./app');

const {
  DB_ADDRESS,
  DB_PORT,
  DB_NAME,
  SERVER_PORT,
  SERVER_ADDRESS
} = process.env;

mongoose
  .connect(`mongodb://${DB_ADDRESS}:${DB_PORT}/${DB_NAME}`)
  .then(() => {
    console.log('Connected to MongoDB!');

    app.listen(SERVER_PORT, SERVER_ADDRESS, () => {
      console.log(`Server running at http://${SERVER_ADDRESS}:${SERVER_PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
