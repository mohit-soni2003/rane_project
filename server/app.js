// Import required modules
const express = require('express');
const app = express();
const mongoose = require('./db/mongoConnection'); // Import the db.js file
const cookieParser = require("cookie-parser")
const cors  = require("cors")


// Middleware to parse JSON data
app.use(cookieParser())
const corsOptions = {
  origin: "http://localhost:5173",  // Explicitly allow the frontend's origin
  credentials: true,  // Allow cookies to be sent
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS)
app.options('*', cors(corsOptions));  // Respond to OPTIONS requests with CORS headers

app.use(express.json());

// Define a port for the server
const PORT = 3000;

// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, World! Express server is running.');
});

app.use(require("./routes/auth"))
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
