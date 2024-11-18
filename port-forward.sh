#!/bin/bash

# Port forwarding for each service
kubectl port-forward svc/auth-service 5001:5001 &
kubectl port-forward svc/product-service 5002:5002 &
kubectl port-forward svc/order-service 5003:5003 &
kubectl port-forward svc/notification-service 5004:5004 &
kubectl port-forward svc/frontend-service 3000:3000 &
kubectl port-forward svc/apigateway-service 4000:4000 &

# Wait for all background jobs to finish
wait
