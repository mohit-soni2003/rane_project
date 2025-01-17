const mongoose = require('mongoose')


mongoose.connect("mongodb+srv://mohit:Mohit123@cluster0.ruqg5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
mongoose.connection.on("connected", () => {
    console.log("Succesfullky Connected To Database......")
})
mongoose.connection.on("error", () => {
    console.log("Not Connected To Database......")
})

module.exports = mongoose;
