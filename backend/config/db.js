const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Hardcoded MongoDB URI
    const mongoUri = 'mongodb://localhost:27017/healthcare_wellness';
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

