# YouTube Video

Install K3S (Light Kubernetes) on Network Booting Rasbperry Pis using iSCSI ()

-----------------------------------------------------------------------------------------------------------------

# Installation

  1.  Install on Master Pi:

  ```
  sudo curl -sfL https://get.k3s.io | sh -s server --write-kubeconfig-mode 644 --snapshotter=native --cluster-init
  ```

  2. Validate it is working:

  ```
  kubectl get nodes
  ```

  3. Get the Token from Master:

  ```
  sudo cat /var/lib/rancher/k3s/server/node-token
  ```

  4. Install on additional master Pis:

  ```
  sudo curl -sfL http://get.k3s.io | K3S_TOKEN=<TOKEN> sh -s server --server https://<master-ip>:6443 --write-kubeconfig-mode 644 --snapshotter=native
  ```
  
  5. Install on worker Pis:

  ```
  sudo curl -sfL http://get.k3s.io | K3S_URL=https://<master-ip>:6443 K3S_TOKEN=<TOKEN> sh -
  ```

  6. Retrieve the kubeconfig file:

  ```
  sudo cat /etc/rancher/k3s/k3s.yaml
  ```

  7. Copy and paste that into your workstation to connect to the cluster.
-----------------------------------------------------------------------------------------------------------------

# Uninstallation

  1. Uninstall from Worker Pis:

  ```
  /usr/local/bin/k3s-agent-uninstall.sh
  ```

  2. Uninstall from Master Pis:

  ```
  /usr/local/bin/k3s-uninstall.sh
  ```

---

# References:
  
https://radicalgeek.co.uk/pi-cluster/setting-up-the-pis/
