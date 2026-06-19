# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# The directory structure

When we install the I2P daemon, it will store important files in the following locations:

```
/
--/etc
----/i2pd         <-- CONFIGURATION files
------/i2pd.conf  <-- CONFIG file
----/init.d
------/i2pd       <-- Legacy SysV init scripts (start/stop)
--/run
----/i2pd         <-- Runtime state (PID files, sockets, etc.)
--/usr
----/bin
------/i2pd       <-- Executable binaries
----/share
------/i2pd       <-- Shared resources
--/var
----/lib
------/i2pd       <-- Data and persistent state files
----/log
------/i2pd       <-- LOGS
```

# Download and Install

## Identifying the installer file

We will be using the official debian package release from GitHub.  You can find the releases [here](https://github.com/PurpleI2P/i2pd/releases).

It is highly recommended that you download the latest version to have the most secure version of the application.

Use this as an example of which file to look for:

| Pi Version | I2PD installer file |
| - | - |
| 1B/Zero/ZeroW | i2pd_2.60.0-1trixie-rpi1_armhf.deb |
| Pi2 | i2pd_2.60.0-1_armhf.deb |
| Pi3/Pi4/Pi5 | i2pd_2.60.0-1trixie1_arm64.deb / i2pd_2.60.0-1_arm64.deb |

## Getting the file

Download it using the following command:

```
wget https://github.com/PurpleI2P/i2pd/releases/download/2.60.0/i2pd_2.60.0-1trixie-rpi1_armhf.deb
```

## Install the I2P Daemon

```
sudo apt update -y
```

```
sudo apt install ./i2pd_2.60.0-1trixie-rpi1_armhf.deb
```

# Protocols

I2P uses several protocols to guarantee service quality, network stability, and anonimity.

## About the Network Protocols

Both SSU2 and NTCP2 serve the same general purpose (router-to-router transport), but differ in how they move data:

| Feature	| SSU2 | NTCP2 |
| - | - | - |
| Transport	| UDP | TCP |
| Speed/overhead | Lower overhead, faster in many cases |	Slightly heavier but stable |
| NAT traversal |	Strong | Moderate |
| Connection style | Packet-based | Stream-based |
| Use case | Flexible, efficient routing | Reliable long-lived connections |

In practice, I2P uses both, choosing dynamically depending on network conditions.

## TCP Network Transport Protocol

NTCP2 is one of the main router-to-router transport protocols used by the I2P network.

Its purpose is simple in concept but critical in practice: it provides a secure, encrypted TCP-based way for I2P routers to communicate over the public internet.

NTCP2 handles the “plumbing” between I2P nodes by:

  - Establishing encrypted connections between routers over TCP
  - Authenticating and negotiating secure sessions using modern cryptography
  - Carrying I2P routing traffic (tunnel building, netDb queries, data forwarding)
  - Maintaining stable long-lived connections between peers

Without NTCP2 (and its companion SSU2), I2P routers wouldn’t be able to reliably connect to each other.

By default, it should be enabled but if you want to make sure it is configured and the port doesn't change, you can do the following:

### Enabling the TCP Protocol

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [ntcp2] section and change it like this:

```
[ntcp2]
## Enable NTCP2 transport
enabled = true
## Publish address in RouterInfo
## IMPORTANT!
## Publishing will make your connection faster and more stable; your participation ## on the network will also be more reliable.  However, it also exposes your 
## Public IP as an i2p node, which could potentially be monitored for traffic 
## patterns.
## Your application traffic will remain encrypted though.
published = true
## Port for incoming connections
port = 4567
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

## UDP Network Transport Protocol

SSU2 is one of the two main router-to-router transport protocols used by the I2P network. It stands for Secure Semireliable UDP version 2.

Its purpose is to provide a secure, UDP-based way for I2P routers to communicate and exchange encrypted traffic across the internet.

SSU2 handles low-level network communication between routers by:

  - Establishing encrypted connections over UDP
  - Exchanging router information and tunnel data
  - Supporting NAT traversal (helping routers behind home networks connect)
  - Providing fast, efficient packet delivery for I2P traffic

Unlike TCP (used by NTCP2), UDP:

  - Does not require a continuous connection
  - Has lower overhead
  - Allows more flexible packet routing behavior

This makes SSU2 useful for:

  - Faster connection setup
  - Better performance in some network environments
  - More effective traversal of NAT and restrictive routers

By default, it should be enabled but if you want to make sure it is configured and the port doesn't change, you can do the following:

### Enabling the UDP Protocol

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [ssu2] section and change it like this:

```
[ssu2]
## Enable SSU2 transport
enabled = true
## Publish address in RouterInfo
## IMPORTANT!
## Publishing will make your connection faster and more stable; your participation ## on the network will also be more reliable.  However, it also exposes your 
## Public IP as an i2p node, which could potentially be monitored for traffic 
## patterns.
## Your application traffic will remain encrypted though.
published = true
## Port for incoming connections
port = 4567
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

## I2P Control Protocol

I2CP is the low-level internal protocol between I2P applications and the router core (originally in the Java implementation, also understood conceptually by i2pd components).

It is not meant for general applications since they do not connect to I2CP directly.  It is used by router-native or internal components like:

  - Core I2P router functions
  - Built-in services
  - Some advanced Java-based I2P applications

It is the "brain interface" of I2P that:

  - Creates tunnels
  - Requests leasesets
  - Manages destinations
  - Controls router behavior

Think of it as "how the router itself talks to its internal networking engine."

By default, it should be disabled as it is not used unless you have a very specific use case.

### Enabling the I2CP Protocol

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [i2cp] section and change it like this:

```
[i2cp]
## Enable the I2CP protocol
enabled = true
## Address and port service will listen on (127.0.0.1:7654)
address = 0.0.0.0
port = 7654
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

# Configuration File

A starter configuration file is included in this repository.

## Purpose

The I2P Daemon offers several services within the router that allow you to do many things like:

| Service | Purpose | Notes / Examples |
| - | - | - |
| HTTP Proxy | To browse and serve "eepsites" | Websites with the .i2p top level domain.  Examples: Blogs, Forums, Mirror Sites, Whistleblowing Pages |
| Torrenting / File Sharing | BitTorrent and P2P file distribution | Clients like: qBittorrent (with I2P plugin/config) and BiglyBT |
| IRC Chat Networks | Fully anonymous IRC servers inside I2P | Anonymous chat rooms, community coordination |
| Email | Mail using I2P-based mail protocols | Clients like: Susimail (webmail inside I2P), I2P-to-I2P mail services |
| Instant Messaging / Chat | Lightweight chat systems over I2P tunnels | I2P Chat, XMPP servers |
| File Hosting and Sharing Services | Websites like Dropbox | I2P-Bote attachments or file drop sites |
| Distributed Forums | Fully anonymous forums hosted inside I2P | Community boards and Discussion platforms |
| Git / Code Repositories | Git servers over I2P tunnels | Anonymous Git hosting or mirrored open-source projects for privacy focused development |
| Gaming Servers | Some TCP-based games can run over I2P tunnels | Private multiplayer servers but latency can be high |
| Remote Access Services | SSH over I2P tunnels and Remote admin panels | Anonymous server administration |
| APIs and Backend Services | REST APIs hosted inside the I2P network | Private microservices or anonymous backend endpoints |
| VPN or Proxy like chaining | SOCKS/HTTP tunnels via I2P | Routing apps anonymously, chaining anonymity layers |

The necessary connectivity for these services can be enabled or disabled using the configuration file located in /**etc/i2pd/i2pd.conf**

## Management - Address Book Subscriptions

Some Eepsites are not readily available if you don't have their encrypted URL.  Other websites provide lists that allow you to access them.
You need to subscribe to their lists to gain more access to sites.

### Subscribing to other registries

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [addressbook] section and change it like this:

```
[addressbook]
# Default subscription for initial setup
# defaulturl = http://shx5vqsw7usdaunyzr2qmes2fq37oumybpudrd4jjj4e4vk4uusa.b32.i2p/hosts.txt
# Additional subscriptions, separated by comma
subscriptions = http://reg.i2p/hosts.txt,http://identiguy.i2p/hosts.txt,http://stats.i2p/cgi-bin/newhosts.txt
```

Some commonly subscribed hostlists:

```
http://reg.i2p/hosts.txt
http://identiguy.i2p/hosts.txt
http://notbob.i2p/hosts.txt
http://stats.i2p/cgi-bin/newhosts.txt
http://skank.i2p/hosts.txt
http://opentracker-public.i2p/subscriptions.txt
```

## Management - I2PControl

I2PControl is a modern JSON-based remote management API for I2P routers.

It is designed for:

  - Monitoring router status
  - Configuring settings remotely
  - Managing tunnels and services
  - Integrating with GUIs or dashboards

It is used by:

  - Router admin panels
  - Remote monitoring tools
  - Lightweight GUIs
  - Android I2P management apps
  - Remote router control from another machine
  - Scripts that monitor bandwidth, peers, and uptime
  - Server orchestration setups

It is for "managing the router itself from outside or via Web UI."

It is disabled by default.  Enable only if needed.

### Enabling I2PControl

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [i2pcontrol] section and change it like this:

```
[i2pcontrol]
## Enable the I2PControl protocol
enabled = true
## Address and port service will listen on (default: 127.0.0.1:7650)
address = 0.0.0.0
port = 7650
## Authentication password (default: itoopie)
password = itoopie
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

## Management - UPnP

UPnP (Universal Plug and Play) is a feature that helps your router automatically open network ports on your home router so that the I2P node can receive inbound connections more easily in the I2P network.

UPnP can:

  - Ask your home router to automatically forward ports
  - Open ports used by
    - NTCP2 (TCP)
    - SSU2 (UDP)
  - Make your I2P router reachable from outside your local network

In simple terms "it removes the need for manual port forwarding in your router settings."

Without it, your I2P node is often firewalled or NAT restricted.  Which means that you can still use I2P but:

  - Fewer peers can connect directly to you
  - Your router may rely more on outbound-only connections (you start them)
  - Network performance and integration can be slightly reduced

With it, your I2P node:

  - Becomes more fully reachable
  - Peer discovery improves
  - Tunnel building can be more efficient

It does not:
  - Affect encryption
  - Control tunnels
  - Expose your browser activity
  - Publish your identity inside I2P directly

It only changes how reachable your router is on your local network and the internet edge.  For this reason, it is recommended to be enabled.

### Enabling UPnP

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [upnp] section and change it like this:

```
[upnp]
## Enable or disable UPnP: automatic port forwarding (enabled by default in WINDOWS, ANDROID)
enabled = true
## Name i2pd appears in UPnP forwardings list (default: I2Pd)
name = i2pd
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

## Management - Web Console Access

The i2pd Web Console is a built-in local dashboard for the router software.  

Its main purpose is to give you a browser-based way to monitor and manage your I2P router without needing to use command-line tools or configuration files.

It acts like a status page and control panel.  You can use it to see whether your router is running correctly, how well it is connected to the network, and what tunnels (inbound and outbound) are currently active.  It typically also shows peer connections, bandwidth usage, and overall network health.

Beyond monitoring, it helps with basic management and troubleshooting. For example, you can inspect logs to diagnose connectivity issues, check whether floodfill participation is working, view routing statistics, and sometimes adjust or restart tunnels. Depending on the build and configuration, it may also provide access to things like the address book, SAM bridge status, and general configuration summaries.

In short, the i2pd web console is a lightweight local control center that makes it easier to observe and maintain your I2P router while it participates in the anonymous overlay network.

It is normally accessible only on the local machine at **http://localhost:7070**.

### Enabling Remote Access

1. Open the configuration file

```
sudo nano /etc/i2pd/i2pd.conf
```

2. Look at the [http] section and change it like this:

```
[http]
## Enable the Web Console
enabled = true
## Hostname is specified if you want to access the Web Console without having to use an SSH tunnel.
## The host name is the name that you assigned to your raspberry pi, when you used the Raspberry Pi Imager.
## You would put the following address in the browser of another machine: http://<hostname>:7070 in that case.
# hostname = <hostname>
## Address and port that the service will listen on
address = 0.0.0.0
port = 7070
## If you want to put it behind a username/password combination, uncomment below
# auth = true
# user = <username>
# pass = <password>
```

3. You must restart the service for the changes to be applied:

```
sudo service i2pd restart
```

### Accessing remotely (if you don't set the hostname)

Access to the web console is restricted to the local machine because the hostname will automatically be set to "localhost".

If you try to visit http://\<hostname\>:7070, you will likely get an error that says: "host mismatch".

The good news is that you can still access it remotely by tunneling the connection using SSH.

NOTE: This is a hassle though.  You would have to open the SSH connection every time that you want to access it.  Hence, it is better to set the hostname in the configuration.

In Windows, run the following command to route your remote machine's traffic on port 7070 to the raspberry pi running i2pd.  It will look as if you are querying the Web Console from your raspberry pi directly:

```
ssh -L 7070:localhost:7070 <pi-user>@<pi-ip>
```

Open a browser and go to: http://localhost:7070.  You should now see the web console.

## Service 1 - HTTP Proxy

The HTTP Proxy service in i2pd is the component that lets your normal web browser access sites inside the anonymous I2P network.

Its main purpose is to act as a gateway between your regular internet traffic (HTTP/HTTPS requests from a browser) and the internal I2P network.

In practical terms, it does a few key things:

It listens on a local address (127.0.0.1:4444) and receives your browser’s HTTP requests. When you try to visit an I2P “eepsite” (sites ending in .i2p), the proxy translates that request into something the I2P router can handle, then sends it through encrypted tunnels across the network. The response comes back through I2P and is delivered to your browser as a normal webpage.

It also handles name resolution for I2P domains, so your browser doesn’t need to understand I2P addresses directly. Instead, the proxy resolves them through the network’s internal address book system.

Another important role is privacy isolation: your browser never connects directly to I2P peers. All traffic is mediated by the proxy, which helps keep your browsing separated from the underlying anonymous routing layer.

Optionally, depending on configuration, the HTTP proxy can also work with “outproxies,” which allow limited access from I2P out to the normal internet —in most setups, it’s primarily used for accessing internal I2P sites only.

In short, the HTTP proxy is what makes I2P usable in a browser by turning anonymous network destinations into standard web traffic your browser can display.

### Enabling the HTTP Proxy

  1. Open the configuration file

  ```
  sudo nano /etc/i2pd/i2pd.conf
  ```

  2. Look at the [httpproxy] section and change it like this:

  ```
  [httpproxy]
  ## Enable the HTTP Proxy
  enabled = true
  ## Address and port that the service will listen on
  address = 0.0.0.0
  port = 4444
  ## If you want to have an outproxy to access the normal internet, uncomment and change the value below
  # outproxy = http://false.i2p
  ```

  3. You must restart the service for the changes to be applied:

  ```
  sudo service i2pd restart
  ```

## Service 2 - SOCKS Proxy

The SOCKS proxy is a local gateway that lets regular applications send their traffic into the I2P network without needing to understand I2P themselves.

It is different from NTCP2 and SSU2 because those are router-to-router transport protocols, while SOCKS is a user/application-facing interface.

It does the following:

  - Listens on a local port (127.0.0.1:4447)
  - Accepts traffic from applications that support SOCKS5
  - Forwards that traffic into I2P tunnels
  - Returns responses back to the application

In simple terms, it acts as a bridge between normal programs and the I2P network.

You use the SOCKS proxy when you want non-I2P-aware apps to work inside I2P, such as:

  - Web browsers (to access .i2p eepsites without an HTTP-specific proxy)
  - Command-line tools (curl, wget, etc.)
  - Custom applications that support SOCKS5

Instead of connecting directly to the internet, the app sends traffic to the SOCKS proxy, and i2pd routes it through I2P tunnels.

### Enabling the SOCKS Proxy

  1. Open the configuration file

  ```
  sudo nano /etc/i2pd/i2pd.conf
  ```

  2. Look at the [socksproxy] section and change it like this:

  ```
  [socksproxy]
  ## Enable the SOCKS proxy
  enabled = true
  ## Address and port service will listen on (127.0.0.1:4447)
  address = 0.0.0.0
  port = 4447
  ```

  3. You must restart the service for the changes to be applied:

  ```
  sudo service i2pd restart
  ```

## Service 3 - SAM Bridge

SAM (Simple Anonymous Messaging) is a programming interface (API) that lets applications directly use the I2P network without needing to implement I2P internals themselves.

It is different from SOCKS or HTTP proxies because it is not just a traffic relay.  It is a structured control protocol for building and using I2P connections programmatically.

SAM allows applications to:

  - Create I2P stream connections (like TCP sockets)
  - Send and receive datagrams (messages)
  - Create and manage I2P destinations (identities)
  - Build client or server-style services inside I2P
  - Control tunnels indirectly through the API

In short, SAM is how software “talks I2P natively."

SAM exposes a local TCP interface (127.0.0.1:7656) that applications connect to.  Through it, they can:

  - Create anonymous endpoints
    - Generate or load I2P identities (destinations)
    - Act like a hidden service inside I2P
  - Open connections
    - Connect to .i2p destinations (like making a socket connection)
    - Accept inbound connections anonymously
  - Send data
    - Stream mode (reliable byte streams)
    - Datagram mode (message-based communication)

It was designed to:

  - Let developers integrate I2P without rewriting networking stacks
  - Support applications like chat, file sharing, or services inside I2P
  - Provide more control than SOCKS proxies

Useful for:

  - Custom I2P applications
  - Daemon services inside I2P
  - P2P apps that need identity management

### Enabling the SAM bridge

  1. Open the configuration file

  ```
  sudo nano /etc/i2pd/i2pd.conf
  ```

  2. Look at the [socksproxy] section and change it like this:

  ```
  [sam]
  ## Enable the SAM bridge
  enabled = true
  ## Address and ports service will listen on (127.0.0.1:7656, udp: 7655)
  address = 0.0.0.0
  port = 7656
  portudp = 7655
  ```

  3. You must restart the service for the changes to be applied:

  ```
  sudo service i2pd restart
  ```

## Service 4 - BOB Bridge

BOB (Basic Open Bridge) is a legacy application interface for the I2P network that allows programs to create and use I2P connections through a simple control protocol.

It was one of the earliest ways for external applications to interact with I2P.

BOB provides a lightweight interface that lets an application:

  - Open I2P stream connections
  - Create local I2P sockets
  - Set up tunnels (client/server)
  - Send and receive data over I2P
  - Work with I2P destinations (addresses)

In short, it is a simple bridge for apps to talk through I2P without implementing the network itself.

BOB was created to:

  - Provide a very simple API for early I2P applications
  - Allow scripting or lighweight integration with I2P
  - Offer a minimal alternative to more complex interfaces like I2CP

It was useful when the ecosystem was small and experimental but now it rarely used.  Exist mainly for compatibility reasons.

### Enabling the BOB bridge

  1. Open the configuration file

  ```
  sudo nano /etc/i2pd/i2pd.conf
  ```

  2. Look at the [bob] section and change it like this:

  ```
  [bob]
  ## Enable the BOB command channel (default: false)
  enabled = true
  ## Address and port service will listen on (default: 127.0.0.1:2827)
  address = 0.0.0.0
  port = 2827
  ```

  3. You must restart the service for the changes to be applied:

  ```
  sudo service i2pd restart
  ```

# Getting the service ready

Now that we have completed the configuration, we can enable the service to auto start and to run with the following commands:

```
sudo systemctl enable i2pd
```

```
sudo systemctl start i2pd
```

To check that everything was successful:

```
sudo systemctl status i2pd
```

# Connecting a Web Browser to I2P

You need a web browser that allows you to configure a proxy.  Firefox and most Chromium based browsers do.

In this example, I will be using Firefox.

  1. Open your browser
  2. Click on Settings
  3. Navigate to the bottom
  4. Click on "Configure proxy" 
  5. Select "Manual proxy configuration"
  6. Use the following values:
    - **HTTP Proxy:** \<PI IP\>
    - **Port:** 4444
  7. Check the box "Also use this proxy for HTTPS"
  8. Check the box "Proxy DNS when using SOCKS v5"

# Testing Access to Eepsites

Open a new tab and enter the following address:

```
http://tracker2.postman.i2p
```

Postman should load.  Postman is the public torrent indexer and tracker of I2P.

# Enjoy!

That should be it.

Now, use your newly built I2P Daemon router.