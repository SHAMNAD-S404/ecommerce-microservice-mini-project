
  import express from 'express';
  import {createProxyMiddleware} from "http-proxy-middleware";
  const app = express ();
  const PORT = process.env.API_PORT || 4000;

  
  const paths = {
    auth    : "http://localhost:5001",
    product : "http://localhost:5002",
    order   : "http://localhost:5003",
    notification: "http://localhost:5004"
  };

  app.use ('/auth' , createProxyMiddleware({target:paths.auth, changeOrigin:true}));
  app.use ('/product', createProxyMiddleware({target:paths.product , changeOrigin:true}));
  app.use ('/order' , createProxyMiddleware({target:paths.order , changeOrigin:true}));
  app.use ('/notification' , createProxyMiddleware({target:paths.notification, changeOrigin:true}));

 
  app.listen(PORT , ()=> {
    console.log(`API Gate way server is listinig on http://localhost:${PORT}`);
  })