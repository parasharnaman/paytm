const express = require("express");
const userRouter = express.Router();
const zod = require("zod");
const {User,Accounts} = require("../db");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const secret= require("../config.js");
const authMiddleware= require("../middleware")
/////////////////////////////////////////////////////
// user-signup
////////////////////////////////////////////////////

const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})
userRouter.post("/signup",async (req,res)=>{
    const userBody = req.body;
    const {success}= signupSchema.safeParse(userBody);
    if(!success){
        res.status(411).json({
            msg: "incorrect inputs"
        })
        return;
    }


    const id= req.body.username;
    let okay= await User.findOne({
        username: id
    })
    if(okay){
        res.status(411).json({
            msg: "email already taken"
        })
        return;
    }

    okay= await User.create({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    })
   
    const userid = okay._id;
    await Accounts.create({
        userId: userid,
        balance: 1+Math.random() *10000
    })
    
    if(okay){
        token= jwt.sign(okay.username,secret);
    
        res.json({
            msg: "User created Successfully",
            token: token
        })
    }
    return;


})
////////////////////////////////////////////////////////////
///////user---signin
///////////////////////////////////////////////////////////

const signinScehma = zod.object({
    username: zod.string(),
    password: zod.string()
})
userRouter.post("/signin",async (req,res)=>{
    const userSignin = req.body;
    const {success}= signinScehma.safeParse(userSignin);
    if(!success){
        res.status(411).json({
            msg: "invalid input"
        })
        return;
    }
    const userValid = await User.findOne({
        username: req.body.username,
    })
    if(userValid){
        token= jwt.sign(req.body.username,secret);
        res.status(200).json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "this user does not exist in our database"
    })
    return;
    }
)
///////////////////////////////////////////////////////////////////////
//////////user-update
//////////////////////////////////////////////////////////////////////

const updateSchema = zod.object({
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

userRouter.put("/",authMiddleware,async (req,res)=>{
    const updateBody= req.body;
    const {success}= updateSchema.safeParse(updateBody);
    if(!success){
        req.status(411).json({
            msg: "incorrect inputs"
        })
        return;
    }
    const decoded = jwt.verify(req.headers.token.split(' ')[1],secret);
    
    const valid = await User.findOneAndUpdate({ 
        username: decoded 
        },
        {   
            $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password
    }})

    res.status(200).json({
        msg: " updated successfully"
    })

})

///////////////////////////////////////////////////////////////
////////////user list
///////////////////////////////////////////////////////////////
userRouter.get("/bulk?",authMiddleware,async (req,res)=>{
    const receiver = req.query.filter;
    const usersReceiver= await User.find({
        $or:[
            {firstName:{"$regex": receiver}},
           { lastName:{"$regex":receiver}}
        ]
    })
 
        res.status(200).json({
            users: usersReceiver.map(user=>({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })
        return;


})


module.exports = userRouter;