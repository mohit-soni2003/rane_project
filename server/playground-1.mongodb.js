
// find all user name , role 
// db.users.updateOne({name: "Accountant-1/2" }, { $set: { role: "staff" } })
// db.users.find({}, { _id:0, name:1, role:1 }).sort({ role:1 }).toArray()

db.bills().find().populate("user")