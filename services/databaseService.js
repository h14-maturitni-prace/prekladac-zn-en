const mongoose = require('mongoose');

async function connectToDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL environment variable is missing.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connected successfully.");
    } catch (error) {
        console.error("Database connection error:", error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

module.exports = { connectToDatabase };