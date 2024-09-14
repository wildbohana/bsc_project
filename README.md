bsc_project
===========
Project made as part of bachelor thesis.

Prerequisites:
==============
- Docker
- minikube
- kubectl
- k9s

Note:
----
If you want to use existing Ingress configuration, you should add new entry to /etc/hosts file on your local machine. This mapping has been added to my machine:
```bash
127.0.0.1    discusswithme.com
```

How to run:
----------

1. Open Docker on your local machine. Make sure you have Kubernetes enabled. Open PowerShell as admin and run following command: 
```bash
minikube start
```

2. On your file system navigate to manifest folders inside API directory and apply manifests.
```bash
minikube kubectl -- apply -f ./
```
Make sure to first apply manifests for MongoDb, then manifests for microservices, and lastly apply manifest for Ingress controller.


3. Lastly, enable request tunneling with following command:
```bash
minikube tunnel
```

Client:
-------------
1. Run following command to create container:
```bash
docker create -i -t --name react-ui -p 80:80 wildbohana/react-app:1.0
```
2. After container creation, run container manually.

Author:
-------
Bojana Mihajlović (@wildbohana), 2024.
