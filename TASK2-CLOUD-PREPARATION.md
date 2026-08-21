# Task 2: Cloud Preparation

Student ID: EYOUTH-30910010506396

## 2.1 Architecture diagram

`EYOUTH-30910010506396-ShopSphere-architecture.svg` (project root) shows the frontend, backend, database, and traffic path matching the Task 1 deployment: browser to React frontend (Vercel) to Express backend (Vercel serverless functions) to PostgreSQL (Supabase) and MongoDB (Atlas).

If your actual Task 1 deployment differs from this (different hosting choice, extra components, etc.), update the diagram to match it exactly before submitting - it is graded against your real deployment, not this template.

## 2.2 Cloud service classification

`EYOUTH-30910010506396-ShopSphere-cloud-classification.md` (project root) classifies the three services in use.

## 2.3 Multi-cloud namespace simulation

You need a local Kubernetes cluster to run this - minikube or kind both work. Steps below assume minikube.

### Setup

1. Install minikube and kubectl if you don't have them:
   https://minikube.sigs.k8s.io/docs/start/
2. Start the cluster:
   ```
   minikube start
   ```

### Build the images

```
cd backend
docker build -t shopsphere-backend:local .
cd ../frontend
docker build -t shopsphere-frontend:local .
```

Load them into minikube's local image store (minikube doesn't see your regular Docker images by default):
```
minikube image load shopsphere-backend:local
minikube image load shopsphere-frontend:local
```
(If using kind instead: `kind load docker-image shopsphere-backend:local` and the same for frontend.)

### Create the namespaces

```
kubectl apply -f k8s/namespaces.yaml
kubectl get namespaces
```
Confirm `aws-simulation` and `gcp-simulation` both appear.

### Deploy into both namespaces

The same manifests are applied twice, once per namespace, using `-n`:
```
kubectl apply -f k8s/backend-pod.yaml -n aws-simulation
kubectl apply -f k8s/frontend-pod.yaml -n aws-simulation

kubectl apply -f k8s/backend-pod.yaml -n gcp-simulation
kubectl apply -f k8s/frontend-pod.yaml -n gcp-simulation
```

Check both namespaces have running pods:
```
kubectl get pods -n aws-simulation
kubectl get pods -n gcp-simulation
```

### Verify the services respond

In one terminal:
```
kubectl port-forward svc/shopsphere-backend-svc 5000:5000 -n aws-simulation
```
In another terminal:
```
curl http://localhost:5000/
```
Should return `{"status":"API running"}`. Repeat with `-n gcp-simulation` on a different local port (e.g. `5001:5000`) to confirm that namespace responds too. Do the same for the frontend service on port 80.

### Verify isolation

Resources in one namespace must not be visible from the other:
```
kubectl get pods -n aws-simulation
kubectl get pods -n gcp-simulation
```
Each should only list its own pods. Also confirm a pod in one namespace cannot resolve the other namespace's service by its short name (this is expected Kubernetes DNS behavior - services are only addressable as `<name>` within their own namespace, or `<name>.<namespace>.svc.cluster.local` across namespaces):
```
kubectl exec -it shopsphere-backend -n aws-simulation -- sh -c "getent hosts shopsphere-backend-svc"
kubectl exec -it shopsphere-backend -n aws-simulation -- sh -c "getent hosts shopsphere-backend-svc.gcp-simulation.svc.cluster.local"
```
The first resolves (same-namespace short name). The second only resolves if you use the fully-qualified cross-namespace name - proving namespaces are isolated by default and cross-namespace access requires an explicit fully-qualified address, not something that happens accidentally.

### Cleanup (optional, after verifying)

```
kubectl delete namespace aws-simulation gcp-simulation
```
