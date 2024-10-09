const mongoose = require('mongoose');
require("dotenv").config();

const connectWithDB = () => {
    
  mongoose.connect(process.env.MONGODB_URI, {
  })
    .then(() => {

      console.log('DB connected');
    })
    .catch((error) => {
      console.log('DB Error');
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDB;
