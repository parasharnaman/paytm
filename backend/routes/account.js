const express = require("express");
const authMiddleware = require("../middleware");
const { User, Accounts } = require("../db");
const accountRouter = express.Router();
const jwt = require("jsonwebtoken");
const secret = require("../config")
const mongoose = require("mongoose");
//////////////////////////////////////////
///////////balance
/////////////////////////////////////////
accountRouter.get("/balance",authMiddleware,async (req,res)=>{
    const decoded = jwt.verify(req.headers.token.split(' ')[1],secret);
    const {_id}= await User.findOne({
        username: decoded,
    })
    const { balance }= await Accounts.findOne({
        userId: _id
    })
    res.status(200).json({
        balance: balance
    })
    return;
})


accountRouter.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    const decoded = jwt.verify(req.headers.token.split(' ')[1],secret);
    session.startTransaction();
    const { amount, to } = req.body;
    
    const {_id}= await User.findOne({
        username: decoded
    })


    // Fetch the accounts within the transaction
    const account = await Accounts.findOne({ userId: _id}).session(session);

    if (!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount = await Accounts.findOne({ userId: to }).session(session);

    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Perform the transfer
    await Accounts.updateOne({ userId: _id }, { $inc: { balance: -amount } }).session(session);
    await Accounts.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction
    await session.commitTransaction();

    res.json({
        message: "Transfer successful"
    });
});



module.exports= accountRouter;