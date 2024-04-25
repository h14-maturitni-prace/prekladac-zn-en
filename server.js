// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const translateRoutes = require('./routes/translateRoutes'); // Added translateRoutes
const { startAppWithoutPythagora } = require('./services/appStarterService'); // Import startAppWithoutPythagora
const { connectToDatabase } = require('./services/databaseService'); // Import connectToDatabase

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3001; 

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to catch JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    console.error(`JSON parsing error: ${err.message}`);
    return res.status(400).send('Invalid JSON in the request body.');
  }
  next();
});

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Translate Routes
app.use(translateRoutes); // Using the translateRoutes

// Root path response
app.get("/", (req, res) => {
  res.render("translatePage"); // Render the translatePage view when visiting the root URL
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Conditional start without Pythagora
if (process.env.USE_PYTHAGORA === 'false') {
    console.log("Starting app without Pythagora based on USE_PYTHAGORA environment variable.");
    startAppWithoutPythagora(app).catch(error => {
      console.error(`Failed to start app without Pythagora: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    }); // Call startAppWithoutPythagora if USE_PYTHAGORA is 'false', passing the app instance
} else {
    console.log("Starting app with Pythagora based on USE_PYTHAGORA environment variable.");
    // Ensure database is connected before starting the server
    connectToDatabase().then(() => {
      app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });
    }).catch(error => {
      console.error(`Failed to connect to database: ${error.message}`);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { app }; // Export the app for use in appStarterService.js