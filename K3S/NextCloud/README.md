# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# Nextcloud on k3s with Let's Encrypt SSL

This guide demonstrates how to deploy Nextcloud in a k3s (Lightweight Kubernetes) cluster with SSL certificates provided by Let's Encrypt, leveraging a Dynamic Domain from ChangeIP.com.

## Pre-Requisites

For this guide, we are assuming that you already fulfill the following pre-requisites:

1. You own a Public Domain or Sub Domain.
  
    You can easily get one from ChangeIP for free.  In my example, I will use **mylab.changeip.co** and the Fully Qualified Domain Name for my Nextcloud instance will be **nextcloud.mylab.changeip.co**.

2. You have assigned your Public IP to the previously mentioned domain or sub domain.

3. You have deployed a Light Kubernetes (k3s) cluster in your local network.

    This could be a baremetal installation (running in a physical machine) or running inside a virtual machine.

    You have the following components running in your kubernetes cluster:
    1) Cert Manager
    2) Traefik

4. You have port forwarded ports 80 (http) and 443 (https) from your router to the machine running the k3s cluster.

5. You have a NAS that is sharing Network File Shares (NFS) to the local network and have assigned proper permissions to read/write to them remotely.  You will need the following share and folder structure:

    ```
    /k3s          <-- Base share that contains all the files and folders for the kubernetes applications
    --/NextCloud  <-- Contains everything related to Nextcloud
    ----/appdata  <-- Contains the Nextcloud application data
    ----/db       <-- Contains the PostgreSQL database data
    ----/userdata <-- Contains all of the users' data
    ```

6. You have access to the kubernetes master node either directly or through SSH.

## IMPORTANT WARNING!

Make sure that you change the values in the kubernetes manifests that I have provided to match case!

## Diagrams

### Internal Infrastructure Diagram

This diagram shows the infrastructure components used to host and serve our application to the public internet.  In my case, I am using a virtual machine running k3s, a virtual NAS that hosts the files for my applications, and my home router.

```
                            Public Internet
                                   |
                                   |  HTTPS (443)
                                   v
                        +----------+-----------+
                        |       Router         |
                        |  Port Fwd 443 → k3s  |
                        +----------+-----------+
                                   |
                                   |  Private LAN
                                   v
                    +----------------------------------+
                    |            ESXi Host             |
                    |                                  |
                    |   +-----------+--------------+   |
                    |   |   VM: k3s Node           |   |
                    |   |   (Nextcloud, Traefik    |   |
                    |   |    Redis, Cert Manager   |   |
                    |   |    PostgreSQL)           |   |
                    |   +-----------+--------------+   |
                    |               |                  |
                    |               | NFS              |
                    |               v                  |
                    |   +-----------+--------------+   |
                    |   |   VM: NAS (NFS Server)   |   |
                    |   |   Exports Nextcloud PVCs |   |
                    |   +-----------+--------------+   |
                    +----------------------------------+

```

The Router forwards all HTTPS requests to the VM running the kubernetes cluster (k3s) to serve application traffic.

The k3s VM connects to the NAS to access the NFS shares that hold the data for the application.

### Traffic Flow Diagram

The following diagram shows how any user would connect to your nextcloud instance from the public Internet and all the infrastructure components that are involved.

```
                            +---------+---------+
                            |  [Internet User]  |
                            +---------+---------+
                                      |
                                      | 1. DNS query for dynamic domain
                                      |    (https://nextcloud.sub.domain.tld)
                                      v
                      +---------------+---------------+
                      |        [ChangeIP DDNS]        |
                      | Resolves hostname → Public IP |
                      +---------------+---------------+
                                      |
                                      | 2. Redirects/Resolves
                                      |    to your router's
                                      |    public IP address
                                      v
                      +---------------+----------------+
                      |         [Home Router]          |
                      |  Port Forward: 443 → k3s node  |
                      +---------------+----------------+
                                      |
                                      | 3. Forwards request
                                      |    into private LAN
                                      v
                      +---------------+---------------+
                      |     [k3s Node / Server]       |
                      |   Runs Traefik / Ingress      |
                      +---------------+---------------+
                                      |
                                      | 4. Ingress routes
                                      |    to Nextcloud service
                                      v
                      +---------------+---------------+
                      |    [Nextcloud Pod in k3s]     |
                      |     Application container     |
                      +---------------+---------------+
```

| Component | Description |
|---|---|
| **ChangeIP.com** | Dynamic DNS service for domains with changing IP addresses |
| **Home Router** | Your gateway to the public internet |
| **k3s** | A Lightweight Kubernetes container orchestration cluster |
| **Traefik** | Cloud-native reverse proxy and load balancer bundled with k3s |
| **Nextcloud** | An Open Source & Self-Hosted file hosting platform |

### SSL Request Flow Diagram

The following diagram shows the process followed by a light kubernetes cluster (k3s) to request a free SSL certificate from Let's Encrypt.  To do this, it leverages a tool called Certificate Manager.

```
+-------------------------------------------------------------+
|                         k3s cluster                         |
|                                                             |
|  +------------------+                                       |
|  |  Ingress (TLS)   |                                       |
|  |  nextcloud.sub.. |                                       |
|  +---------+--------+                                       |
|            |  references                                    |
|            |  tls secret                                    |
|            v                                                |
|  +------------------------+                                 |
|  |  Certificate CR (CRD)  |  <-- user applies YAML          |
|  |  spec.dnsNames:        |      (Certificate + Issuer)     |
|  |    - nextcloud.sub..   |                                 |
|  |  spec.issuerRef: LE    |                                 |
|  +-----------+------------+                                 |
|              | watched by                                   |
|              v                                              |
|        +--------------------+                               |
|        |  cert-manager      |                               |
|        |  controller        |                               |
|        +---------+----------+                               |
|                  | 1. Create Order (ACME) CR                |
|                  v                                          |
|        +--------------------+                               |
|        |  Order CR (ACME)   |                               |
|        +---------+----------+                               |
|                  | 2. Call ACME API:                        |
|                  |    "newOrder" for                        |
|                  v    nextcloud.sub.domain.tld              |
+------------------|------------------------------------------+
                   |
                   |  ACME (HTTPS API)
                   v
        +-----------------------------+
        |  Let's Encrypt ACME server  |
        +--------------+--------------+
                       | 3. Responds with challenges
                       |    (HTTP-01 or DNS-01)
                       v
        +-----------------------------+
        |  Challenge objects (remote) |
        +--------------+--------------+
                       |
                       | 4. cert-manager creates
                       |    local Challenge CR
                       v
+-------------------------------------------------------------+
|                         k3s cluster                         |
|                                                             |
|        +--------------------+                               |
|        | Challenge CR (CRD) |                               |
|        | type: HTTP-01      |                               |
|        +---------+----------+                               |
|                  | 5. Spawn solver                          |
|                  v                                          |
|        +--------------------------+                         |
|        | HTTP-01 solver pod       |                         |
|        | (or DNS solver via API)  |                         |
|        +-------------+------------+                         |
|                      |                                      |
|                      | 6. Expose token at:                  |
|                      |    http://nextcloud.sub.domain.td./  |
|                      |    .well-known/acme-challenge/<tok>  |
|                      v                                      |
|        +--------------------------+                         |
|        | Ingress rule for         |                         |
|        | ACME challenge path      |                         |
|        +--------------------------+                         |
+----------------------|--------------------------------------+
                       |
                       | 7. ACME validation request
                       |    (HTTP-01: LE → Ingress → solver)
                       v
        +-----------------------------+
        |  Let's Encrypt ACME server  |
        +--------------+--------------+
                       | 8. Validate OK
                       |    → issue certificate
                       v
        +----------------------------+
        |  Signed cert + chain       |
        +--------------+-------------+
                       |
                       | 9. ACME "finalize" response
                       v
+-------------------------------------------------------------+
|                         k3s cluster                         |
|                                                             |
|        +--------------------+                               |
|        |  cert-manager      |                               |
|        +---------+----------+                               |
|                  | 10. Store cert/key in Secret             |
|                  v                                          |
|        +----------------------------+                       |
|        |  Kubernetes Secret (TLS)   |                       |
|        |  tls.crt / tls.key         |                       |
|        +-------------+--------------+                       |
|                      | 11. Referenced by Ingress            |
|                      v                                      |
|        +----------------------------+                       |
|        |  Ingress (HTTPS enabled)   |                       |
|        +----------------------------+                       |
+-------------------------------------------------------------+
```

| Component | Description |
|---|---|
| **Let's Encrypt** | Certificate Authority providing free SSL certificates via ACME protocol |
| **k3s cluster** | The container orchestration infrastructure that hosts our application(s) |
| **Ingress (Traefik)** | Cloud-native reverse proxy and load balancer bundled with k3s |
| **Cert Manager** | An Open Source kubernetes controller that automates the issuance, renewal, and management of TLS/SSL certificates for secure communication in cloud-native environments |
| **Certificate Request (CR)** | The data that you generate on your server or application to initiate the issuance of a certificate. |
| **Certificate Order** | Is Let's Encrypt's internal record of a request for a certificate.  It represents the contract/enrollment between you and them for a specific certificate. |
| **ACME Server** | It is a service that implements the Automated Certificate Management Environment protocol and allows clients to automatically request, validate, issue, renew, and install certificates without manual intervention. |
| **Challenge Response (CR)** | A step where your client (Cert Manager) provides the correct proof to Let's Encrypt that you control the domain(s) you are requesting a certificate for. |
| **ACME Validation Request** | A step where your client (Cert Manager) tells Let's Encrypt that you want to prove you control a domain so it can issue a certificate. |
| **Signed Certificate** | Is the final SSL certificate that you will use when serving your content securely to the iIternet. |
| **Certificate Chain** | Is a sequence of certificates that links your certificate to a trusted root certificate (Let's Encrypt). |
| **Kubernetes Secret** | Is the way that kubernetes saves your certificate and makes it accessible to your applications. |

## Deployment Steps

1. Clone this repository or create the YAML manifests in this folder in your machine or the kubernetes cluster master node.

2. Make sure to update the variables according to your system.  Be on the lookout for things like IPs, Domains, Certificate Authority Names, Usernames, Passwords, etc.

3. Apply all of the manifests in this directory in order (by given numbers).

    Use the following command to deploy each of the files:

    ```
    kubectl apply -f <filename>
    ```

4. Wait until all deployed components are created and running stably.  It may take ~5 minutes.

    a. To validate the creation and status of the components you can either run the appropriate kubernetes command or use a tool like Lens to view if graphically.

    Example command to see the pods in a specific namespace:

    ```
    kubectl get pods -n nextcloud
    ```

5. Open your browser and navigate to your domain / sub domain to access the application.

6. Log in as the administrator to manage your instance.

Enjoy your unrestricted Nextcloud instance!

## Adding Collabora functionality to your Nextcloud

Once logged in as administrator do the following:

1. Navigate to the top-right icon (your initials) and click “Apps”.
2. In the left menu, click the “Office & text” category.
3. Find “Nextcloud Office” and click the “Download and enable” button.
4. Find "Collabora CODE" and click the "Download and enable" button.
4. Navigate to the top-right icon (your initials) and click “Administration settings”.
5. Click “Nextcloud Office” (sometimes, it just appears as “Office”) in the left menu.
6. Click the “Use the internal server” radio button.
7. You might have to refresh the page to see the successful connection.