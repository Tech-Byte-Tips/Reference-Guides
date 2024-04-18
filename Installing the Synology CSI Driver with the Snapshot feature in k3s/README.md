# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Learning%2dKubernetes%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Installing Synology CSI for Kubernetes

In this tutorial we will be installing the Synology Container Storage Interface (CSI) for Kubernetes.  This interface allows us to persist data by using Samba/CIFS or iSCSI LUNs in the Synology NAS.

## Why?

Instead of storing our persisted data inside the iSCSI LUNs for each raspberry pi, we can leverage our NAS to hold that data in separate LUNs or Samba/CIFS locations.  That way, we don't have to worry about our Pis running out of storage space.

## Pre-requisites

  1. Kubernetes cluster 1.19+
  2. Synology NAS with DSM 7.0+

## Steps

First, we need to install the following Custom Resource Definitions from Synology:

  a. Volume Snapshot CRDs
  b. Common Snapshot Controller

  1. Install the required CRDs:

  ```
  kubectl apply -f "01 - Synology CRDs"
  ```

  2. Make sure that you have at least one Storage Pool and one Volume in your Synology NAS.  This is done in the Storage Manager application.

  3. Check that all of the nodes in your cluster can connect to the Synology NAS.  You can ping it from each to validate connectivity:

  ```
  ping <NAS IP>
  ```

  4. Clone the Synology CSI repository. (I've added the files in the second folder but they might get old)

  ```
  git clone https://github.com/SynologyOpenSource/synology-csi.git
  ```

  5. Change directory into the repository

  ```
  cd "synology-csi"
  ```

  6. Edit the file named 'client-info.yml' in the following location:

  ```
  cp config\client-info-template.yml client-info.yml
  nano config\client-info.yml
  ```

  7. Install the full CSI driver (using the Docker Hub image so that we don't have to build anything):

  ```
  sudo ./scripts/deploy.sh install --all
  ```

  This will install the drive to the 'synology-csi' namespace, create the storage class and the volume snapshot class.

  8. Check that all pods are running:

  ```
  kubectl get pods -n synology-csi
  ```

## Testing

To provision a LUN in the NAS for the volume

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: my-pv-claim
  namespace: my-app
  labels:
    app: my-app
spec:
  storageClassName: synology-iscsi-storage
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 200Gi
```

## Uninstalling the Synology CSI Driver:

  1. Run the following command:
  
  ```
  sudo ./scripts/uninstall.sh
  ```

# Adding the ability to create volume snapshots on a schedule

A brilliant person has written a Kubernetes operator that allows you to make snapshots of the volumes using the Synology CSI on a schedule.

## Pre-requisite

We need an image of the Kubernetes Scheduled Volume Snapshotter written by Ryan E Orth.  He made it accessible through GitHub.  Currently this is not officially implemented but he spent the effort to make it available to us.

## Installing the Scheduled Volume Snapshotter

  1. Make sure that you have Helm installed in your Raspberry Pi:

  ```
  helm version
  ```

  If you don't get a response with versions, you need to install Helm:

  ```
  curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
  chmod 700 get_helm.sh
  ./get_helm.sh
  ```

  2. Install using Helm:

  Install the necessary CRDs:

  ```
  helm repo add scheduled-volume-snapshotter https://raw.githubusercontent.com/ryaneorth/k8s-scheduled-volume-snapshotter/main/repo
  ```

  Deploy the Snapshotter:

  ```
  helm upgrade --install scheduled-volume-snapshotter scheduled-volume-snapshotter/scheduled-volume-snapshotter
  ```

## How to use it

This is an example of how to create a scheduled volume snapshot:

```
apiVersion: k8s.ryanorth.io/v1beta1
kind: ScheduledVolumeSnapshot
metadata:
  name: my-pv-scheduled-snapshot
  namespace: my-app
spec:
  snapshotClassName: synology-snapshotclass
  persistentVolumeClaimName: my-pv-claim
  snapshotFrequency: 1d
  snapshotRetention: 3d
  snapshotLabels:
    firstLabel: mySnapshot
```

## Uninstalling the Scheduled Volume Snapshotter:

  1. Run the following command:
  
  ```
  helm uninstall scheduled-volume-snapshotter scheduled-volume-snapshotter/scheduled-volume-snapshotter
  ```

# Sources

[Radical Geek](https://radicalgeek.co.uk/pi-cluster/building-a-personal-development-cloud-raspberry-pi-4-kubernetes-synology-openwrt-part-4-iscsi-persistent-volumes-with-automated-volume-snapshots/?unapproved=2503&moderation-hash=5d49974e26c3a9068a5273ceb71819af#comment-2503)
[Synology Official GitHub](https://github.com/SynologyOpenSource/synology-csi)
[Ryan E Orth's GitHub](https://github.com/ryaneorth/k8s-scheduled-volume-snapshotter)