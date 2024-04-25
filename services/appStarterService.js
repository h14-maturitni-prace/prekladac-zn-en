require('dotenv').config();
const mongoose = require('mongoose');

// Function to establish a database connection
async function connectToDatabase() {
    if (!process.env.DATABASE_URL) {
        console.error("Error: DATABASE_URL environment variable is missing.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Database connected successfully.");
    } catch (error) {
        console.error(`Database connection error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

async function startAppWithoutPythagora(app) {
    // Check for essential environment variable PORT
    if (!process.env.PORT) {
        console.error("Error: PORT environment variable is missing.");
        process.exit(1);
    }

    // Establish a database connection
    await connectToDatabase();

    // Start the Express server
    app.listen(process.env.PORT, () => {
        console.log(`Server running at http://localhost:${process.env.PORT}`);
    });
}

module.exports = { startAppWithoutPythagora, connectToDatabase };