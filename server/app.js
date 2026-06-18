// Import required modules
const express = require('express');
const app = express();
const mongoose = require('./src/db/mongoConnection'); // Import the db.js file
const cookieParser = require("cookie-parser")
const cors  = require("cors")
const {FRONTEND_ORIGIN_URL} = require("./keys")
const expireAgreementsJob = require("./src/cron/expireAgreementsCron")
const startExpiryJob = require("./src/cron/expireAgreementsCron")


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
expireAgreementsJob();
startExpiryJob();


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


app.use(require("./src/routes/auth"))
app.use(require("./src/routes/billroute"))
app.use(require("./src/routes/clientroute"))
app.use(require("./src/routes/paymentroute"))
app.use(require("./src/routes/commonroute"))
app.use(require("./src/routes/adminroutes"))
app.use(require("./src/routes/staffroutes"))
app.use(require("./src/routes/clientroutes"))
app.use(require("./src/routes/transactionroutes"))
app.use(require("./src/routes/documentroutes"))
app.use("/dfs",require("./src/routes/fsforwardingroutes"))
app.use("/salary",require("./src/routes/salaryroutes"))
app.use("/agreement",require("./src/routes/agreementroutes"))
app.use(require("./src/routes/generalroutes")) //contains recent activit/notification
app.use("/dashboard",require("./src/routes/dashboardroutes")) // give all detais relaed to dashboard
app.use("/notification",require("./src/routes/notificationRoutes"))
app.use("/paynote", require("./src/routes/paynoteroutes"))
app.use("/sor", require("./src/routes/sor.routes")) // give all detais relaed to dashboard
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
