const express = require("express");
const router = require("./routes");
const mainRouter= express();
const cors= require("cors");

mainRouter.use(express.json());
mainRouter.use(cors());



mainRouter.use("/api/v1/",router);

mainRouter.listen(3000,()=>{
    console.log("listening at port 3000")
});

