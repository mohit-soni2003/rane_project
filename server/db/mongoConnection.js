const mongoose = require('mongoose')
const {MONGO_URL}=require("../keys")


mongoose.connect(MONGO_URL)
mongoose.connection.on("connected", () => {
    console.log("Succesfullky Connected To Database......")
})
mongoose.connection.on("error", () => {
    console.log("Not Connected To Database......")
})






module.exports = mongoose;
