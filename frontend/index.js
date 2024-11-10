
 import express from "express"
 const app = express();
 const PORT = process.env.FRONT_PORT || 3000;

 app.set('view engine','ejs');
 app.set('views',"./views")

 app.use(express.static("public"));


 app.get("/",(req,res) => {
    res.render('login')
 })

 



 app.listen(PORT,()=> {
    console.log(`front-end server is running on http://localhost:${PORT}`);
    
 })