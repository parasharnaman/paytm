const jwt = require("jsonwebtoken")
const secret= require("./config.js");

 function authMiddleware(req,res,next){
    try{
        const decoded = jwt.verify(req.headers.token.split(' ')[1],secret);
      
        next();
    }catch(err){

        res.status(403).json({
            msg: "not allowed"
        })
        return;
    }
    
}
    


module.exports = authMiddleware;