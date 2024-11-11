
 import express from "express"
 const app = express();
 const PORT = process.env.FRONT_PORT || 3000;
 import {loadLogin, loadProducts} from "./controller/controller.js"

 app.set('view engine','ejs');
 app.set('views',"./views")

 app.use(express.static("public"));


 app.get("/",loadLogin)
    .get("/home",loadProducts)

 



 app.listen(PORT,()=> {
    console.log(`front-end server is running on http://localhost:${PORT}`);
    
 })