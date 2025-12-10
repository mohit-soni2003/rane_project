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
  origin: FRONTEND_ORIGIN_URL,  // Your frontend URL
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
  res.send('Hello, World! Express server is running. on version 3.0');
});

app.get("/test-cookie", (req, res) => {
  res.cookie("testToken", "12345", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    // domain: "rane-project.vercel.app",  // Important
    path: "/",  // Important
    maxAge:300 * 1000, // 7 days
});

  res.set('Cache-Control', 'no-store');  

  res.json({ message: "Cookie set!" }); 
});


app.use(require("./routes/auth"))
app.use(require("./routes/billroute"))
app.use(require("./routes/clientroute"))
app.use(require("./routes/paymentroute"))
app.use(require("./routes/commonroute"))
app.use(require("./routes/adminroutes"))
app.use(require("./routes/staffroutes"))
app.use(require("./routes/clientroutes"))
app.use(require("./routes/transactionroutes"))
app.use(require("./routes/documentroutes"))
app.use("/dfs",require("./routes/fsforwardingroutes"))
app.use("/salary",require("./routes/salaryroutes"))
app.use("/agreement",require("./routes/agreementroutes"))
app.use("/recent-activity",require("./routes/generalroutes")) //contains recent activit/notification
app.use("/dashboard",require("./routes/dashboardroutes")) // give all detais relaed to dashboard
app.use("/notification",require("./routes/notificationRoutes"))
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
