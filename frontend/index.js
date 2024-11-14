 import express from "express"
 import cors  from 'cors'
 const app = express();
 const PORT = process.env.FRONT_PORT || 3000;
 import {loadLogin, loadProducts} from "./controller/controller.js"


 app.use(cors({
   origin: 'http://localhost:3000',  
   methods: ['GET', 'POST', 'PUT'],
   allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true  
 }));
 
 app.set('view engine','ejs');
 app.set('views',"./views")

 app.use(express.static("public"));


 app.get("/",loadLogin)
    .get("/home",loadProducts)

 



 app.listen(PORT,()=> {
    console.log(`front-end server is running on http://localhost:${PORT}`);
    
 })