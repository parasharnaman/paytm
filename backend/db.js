const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://naman:dewas3105$@cluster0.wwkjsbb.mongodb.net/paytm");

const userSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String
})

const User = mongoose.model("User",userSchema);

const accountSchema = new mongoose.Schema({
    userId:{ type:mongoose.Schema.Types.ObjectId, ref: "User"},
    balance: Number
})

const Accounts = mongoose.model("Accounts",accountSchema);


module.exports= {
    User,
    Accounts
};