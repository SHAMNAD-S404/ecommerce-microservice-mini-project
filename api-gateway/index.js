
import express from 'express';
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors"
const app = express ();
const PORT = process.env.API_PORT || 4000;


app.use((req,res,next) => {
  console.log(`mssg recieved at the api gateway req method : ${req.method} path : ${req.path}`)
  next()
})

app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
}));




const paths = {
  auth    : "http://auth-service:5001",
  product : "http://product-service:5002",
  order   : "http://order-service:5003",
  notification: "http://notification-service:5004"
};




app.use('/auth', createProxyMiddleware({target: paths.auth,changeOrigin: true}));
app.use('/product', createProxyMiddleware({target:paths.product , changeOrigin:true}));
app.use('/order' , createProxyMiddleware({target:paths.order , changeOrigin:true}));
app.use('/notification' , createProxyMiddleware({target:paths.notification, changeOrigin:true}));


app.listen(PORT , ()=> {
  console.log(`API Gate way server is listinig on http://localhost:${PORT}`);
})