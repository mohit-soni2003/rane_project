// Import required modules
const express = require('express');
const app = express();
const mongoose = require('./db/mongoConnection'); // Import the db.js file
const cookieParser = require("cookie-parser")
const cors  = require("cors")
const {FRONTEND_ORIGIN_URL} = require("./keys")


// Middleware to parse JSON data
app.use(cookieParser())
const corsOptions = {
  origin: "https://rane-project.vercel.app",  // Your frontend URL
  credentials: true,  // Allow cookies to be sent
};

// Apply CORS middleware globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));  // Handle OPTIONS preflight requests
app.use(express.json());

// Define a port for the server
const PORT = 3000;

// Define a sample route
app.get('/', (req, res) => {
  res.send('Hello, World! Express server is running.');
});

app.get("/test-cookie", async(req, res) => {
  await res.cookie("testToken", "12345", {
      httpOnly: true,  
      secure: true,  
      sameSite: "None",  
      maxAge: 7 * 24 * 60 * 60 * 1000  // Cookie will expire in 7 days

  });
  res.set('Cache-Control', 'no-store');  // Ensure no caching for this response

  res.json({ message: "Cookie set!" }); // ✅ Returns JSON instead of plain text
});


app.use(require("./routes/auth"))
app.use(require("./routes/billroute"))
app.use(require("./routes/clientroute"))
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
