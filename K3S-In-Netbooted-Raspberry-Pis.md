# YouTube Video

Install K3S (Light Kubernetes) on Network Booting Rasbperry Pis (https://www.youtube.com/watch?v=V-5QLVP6cII)

**Note, I highly recommend that the master node in your Kubernetes cluster be running from an SD Card as running from the network causes slowness and some issues when deploying complex infrastructure.**

-----------------------------------------------------------------------------------------------------------------

# Boot & File System Preparation

## 01 - Add the following at the end of the boot partition's cmdline.txt:

```
cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1
```

## 02 - Make sure to add the pi IPs and hostnames in the **/etc/hosts** file:
```
10.0.0.81	k3s1
10.0.0.82	k3s2
10.0.0.83	k3s3
10.0.0.84	k3s4
```

-----------------------------------------------------------------------------------------------------------------

# Installation

## 01 - Install on Master Pi:

```
curl -sfL https://get.k3s.io | sh -s - --node-name k3s1 --write-kubeconfig-mode 644 --snapshotter=native
```

## 02 - Validate it is working:

```
kubectl get nodes
```

## 03 - Get the Token from Master:

```
sudo cat /var/lib/rancher/k3s/server/node-token
```

## 04 - Install on Worker Pis:

Format is:

```
curl -sfL https://get.k3s.io | K3S_URL=https://<name of master>:6443 K3S_TOKEN=<token goes here> K3S_NODE_NAME=<name of node> INSTALL_K3S_EXEC="--snapshotter=native" sh -
```
  
Examples:
```
curl -sfL https://get.k3s.io | K3S_URL=https://<k3s1>:6443 K3S_TOKEN=<SOMERANDOMTOKENVALUETHATYOUGETFROMTHEMASTER> K3S_NODE_NAME=<k3s2> INSTALL_K3S_EXEC="--snapshotter=native" sh -
curl -sfL https://get.k3s.io | K3S_URL=https://<k3s1>:6443 K3S_TOKEN=<SOMERANDOMTOKENVALUETHATYOUGETFROMTHEMASTER> K3S_NODE_NAME=<k3s3> INSTALL_K3S_EXEC="--snapshotter=native" sh -
curl -sfL https://get.k3s.io | K3S_URL=https://<k3s1>:6443 K3S_TOKEN=<SOMERANDOMTOKENVALUETHATYOUGETFROMTHEMASTER> K3S_NODE_NAME=<k3s4> INSTALL_K3S_EXEC="--snapshotter=native" sh -
```

## 05 - Install kubectl autocomplete

```
echo 'source <(kubectl completion bash)' >>~/.bashrc
source <(kubectl completion bash)
```

-----------------------------------------------------------------------------------------------------------------

# Install the Kubernetes Dashboard (Optional)

## 01 - Deploy it

```
GITHUB_URL=https://github.com/kubernetes/dashboard/releases
VERSION_KUBE_DASHBOARD=$(curl -w '%{url_effective}' -I -L -s -S ${GITHUB_URL}/latest -o /dev/null | sed -e 's|.*/||')
sudo k3s kubectl create -f https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
```

## 02 - Dashboard RBAC Configuration:

Create a yml file for the admin user.
```
nano dashboard.admin-user.yml
```

It should look like this:

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
```

Create a yml file for the admin user role.
```
nano dashboard.admin-user-role.yml
```

It should look like this:

```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
- kind: ServiceAccount
  name: admin-user
  namespace: kubernetes-dashboard
```

Run the following command:

```
sudo k3s kubectl create -f dashboard.admin-user.yml -f dashboard.admin-user-role.yml
```

## 03 - Wait for an endpoint:

```
watch kubectl get endpoints kubernetes-dashboard -n kubernetes-dashboard
```

## 04 - Get the token:

```
sudo k3s kubectl -n kubernetes-dashboard create token admin-user
```

## 05 - Check the service:

```
kubectl -n kubernetes-dashboard get service
```

It should show as a ClusterIP (which doesn't let us access it outside the cluster)

## 06 - Switch its type from ClusterIP to LoadBalancer:

```
kubectl -n kubernetes-dashboard edit svc kubernetes-dashboard
```

*Press 'i' to start editing with vim, then make start making the changes.*
*Once done with the changes, press 'Esc', then ':', then type 'wq', then press 'Enter'*

The end should look like this: (We need to specify the IP to listen on our Pi)

```
  type: LoadBalancer
  externalIPs:
  - 10.0.0.80
```

## 07 - Validate it was changed:

```
kubectl -n kubernetes-dashboard get svc
```

## 08 - Grab the External IP Address

## 09 - Go to it in the browser, this takes a looong time to settle, so be patient.

```
https://10.0.0.80/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```
-----------------------------------------------------------------------------------------------------------------

# Uninstallation

## 01 - Uninstall from Worker Pi:

```
/usr/local/bin/k3s-agent-uninstall.sh
```

## 02 - Uninstall from Master Pi:

```
/usr/local/bin/k3s-uninstall.sh
```

## 03 - Deleting Kubernetes Dashboard (Optional)

```
sudo k3s kubectl delete -f https://raw.githubusercontent.com/kubernetes/dashboard/${VERSION_KUBE_DASHBOARD}/aio/deploy/recommended.yaml
```

---

# References:
  
http://chegwin.org/posts/k3s_raspi_nfs_mount/

https://docs.k3s.io/installation/kube-dashboard#advanced-remote-access-to-the-dashboard
