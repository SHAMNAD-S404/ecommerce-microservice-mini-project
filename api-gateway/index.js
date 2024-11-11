
  import express from 'express';
  import {createProxyMiddleware} from "http-proxy-middleware";
  import cors from 'cors'
  const app = express ();
  const PORT = process.env.API_PORT || 4000;

  app.use(express.json() );
  app.use(cors( {origin:'http://localhost:3000' } ));

  app.use( (req,res,next) => {
    console.log("Incoming request to API Gateway:", req.method, req.url);
    next();
  })

  const paths = {
    auth    : "http://localhost:5001",
    product : "http://localhost:5002",
    order   : "http://localhost:5003",
    notification: "http://localhost:5004"
  };



  app.use('/auth', createProxyMiddleware({
    target: paths.auth,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
    onProxyReq: (proxyReq, req, res) => {
       console.log("Forwarding request to auth-service:", req.method, req.url);
    },
    timeout: 60000, // Set a higher timeout to prevent request abortion
 }));
 

  app.use ('/product', createProxyMiddleware({target:paths.product , changeOrigin:true}));
  app.use ('/order' , createProxyMiddleware({target:paths.order , changeOrigin:true}));
  app.use ('/notification' , createProxyMiddleware({target:paths.notification, changeOrigin:true}));

 
  app.listen(PORT , ()=> {
    console.log(`API Gate way server is listinig on http://localhost:${PORT}`);
  })