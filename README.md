# bsc_project
Project made as part of bachelor thesis.

<h2>Prerequisites:</h2>
<li>Docker</li>
<li>minikube</li>
<li>kubectl</li>
<li>k9s</li>

<h2>Note:</h2>
If you want to use existing Ingress configuration, you should add new entry to /etc/hosts file on your local machine. This mapping has been added to my machine:
````text
```
127.0.0.1 discusswithme.com
```
````text

<h2>How to run:</h2>
<ol>
	<li>Open Docker on your local machine. Make sure you have Kuberentes enabled.</li>
	<li>Open PowerShell as admin and run following command: 
	````text
	minikube start
	````
	</li>
	<li>On your file system navigate to manifest folders inside api directory and apply manifests.
	````text
	minikube kubectl -- apply -f ./
	````
	Make sure to first apply manifests for MongoDb, then manifests for microservices, and lastly apply manifest for Ingress controller.
	</li>
	<li>
	Lastly, enable request tunneling with following command:
	````text
	minikube tunnel
	````
	</li>
</ol>

<h2>React client:</h2>
<ol>
	<li>Run following command to create container:
	````text
	docker create -i -t --name react-ui -p 80:80 wildbohana/react-app:1.0
	````
	</li>
	<li>
		Run container manually from Docker Client.
	</li>
</ol>
