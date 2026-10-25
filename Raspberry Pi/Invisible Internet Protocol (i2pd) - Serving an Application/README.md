# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# What are we building?

This guide will help you to configure 2 machines (Raspberry Pis in my case) to serve a website in the Invisible Internet in a way that is secure and you minimize the exposure of sensitive information from your web application server.

The first machine will act as the gateway for the web server in the I2P network.  The second machine will just handle the application server.

We'll create a private network between the 2 machines to guarantee that only the I2P Daemon can communicate with the server.  This way, only access from the Invisible Internet is allowed.

# Pre-requisites

We will be assuming that you followed my previous guide on how to build an I2P Router using I2Pd.  We will just be making configurations to this I2Pd router.

You should also have another machine running a Debian OS variant (Raspbian in my case) where we will be installing the Apache Web Server and setting up our application.

You need to have a USB-to-Ethernet adapter so that you can connect the first machine to the second machine, using a different device and maintaining the first ethernet device as the connection to the public internet.

You need to have basic understanding of your home or office Local Area Network.  The typical local network is one of these ranges:

| Network | CIDR | Amount of IPs | Ip Range |
|-|-|-|-|
| 192.168.1.0 | /24 | 256 (2 reserved) | 192.168.1.1 - 192.168.1.254 |
| 10.0.0.0 | /24 | 256 (2 reserved) | 10.0.0.1 - 10.0.0.254 |

We need to identify our home network range so that we build the private network in a different range.  For example:

| Home Network | CIDR | Private Network | CIDR
|-|-|-|-|
| 192.168.1.0 | /24 | 192.168.2.0 | /24 |
| 10.0.0.0 | /24 | 10.0.1.0 | /24 |

# Step 1 - Configuring the Private Network

In this step we will have both machines connected to our home router so that we can configure the interfaces to establish the private network connectivity between the 2 machines.

We will have our machines connected the following way right now.  It will allow us to perform remote sessions from our PC to both of them.

```
                              Your PC
                                 |
                                 | (eth0)
                    -----------------------------
                             Home Router
                    -----------------------------
                              |           |
                              | (eth0)    | (eth0)
                          Machine 1   Machine 2
```

## Step 1a - Remote into the machines

Log into the machines using SSH:

```
ssh <user>@<IP>
```

## Step 1b - Identify the network devices

```
ip -br addr
```

In Machine #1, you should have 2 ethernet devices: `eth0` and `eth1`.

| Device ID | Status | Network Information | Notes |
|-|-|-|-|
| lo | UNKNOWN | 127.0.0.1/8 | Loopback device |
| eth0 | UP | 10.0.0.30/24 | Current connection to the Home Network (shows its IP) |
| wlan0 | DOWN | - | If your machine has a Wi-Fi device (unused) |
| eth1 | DOWN | - | USB-to-Ethernet Adapter (currently unused) |

In Machine #2, you should have 1 ethernet device: `eth0`.

| Device ID | Status | Network Information | Notes |
|-|-|-|-|
| lo | UNKNOWN | 127.0.0.1/8 | Loopback device |
| eth0 | UP | 10.0.0.32/24 | Current connection to the Home Network (shows its IP) |

You can also use this command to see the status of the connections:

```
nmcli device status
```

Machine #1 should show you something like this:

| DEVICE | TYPE | STATE | CONNECTION |
|-|-|-|-|
| eth0 | ethernet | connected | Wired Connection 1 |
| lo | loopback | connected (externally) | lo |
| eth1 | ethernet | unavailable | -- |
| wlan0 | wifi | unavailable | -- |

Machine #2 should show you something like this:

| DEVICE | TYPE | STATE | CONNECTION |
|-|-|-|-|
| eth0 | ethernet | connected | Wired Connection 1 |
| lo | loopback | connected (externally) | lo |

## Step 1c - Machine #1 - Create a new NetworkManager connection profile

Run this command to create a new NetworkManager profile in Machine #1:

```
sudo nmcli connection add \
  type ethernet \
  ifname eth1 \
  con-name private-link \
  connection.autoconnect yes \
  connection.autoconnect-priority 100 \
  ipv4.method manual \
  ipv4.addresses 10.0.1.2/24 \
  ipv4.never-default yes \
  ipv6.method disabled
```

This command is creating a profile for the `eth1` ethernet device named `private-link` that auto-connects when available and has a priority of 100.  We are assigning the private IP `10.0.1.2` to this device when it connects and we are making sure that IPv6 is disabled.

Validate that it was created successfully with the following command:

```
nmcli connection show
```

You should see this now:

| NAME | UUID | TYPE | DEVICE
|-|-|-|-|
| Wired Connection 1 | <some large string> | ethernet | eth0 |
| lo | <some large string> | loopback | lo |
| **private-link** | **<some large string>** | **ethernet** | **--** |
| Wired Connection 2 | <some large string> | ethernet | -- |

## Step 1d - Machine #2 - Create a new NetworkManager connection profile

Run this command to create a new NetworkManager profile in Machine #1:

```
sudo nmcli connection add \
  type ethernet \
  ifname eth0 \
  con-name private-link \
  connection.autoconnect yes \
  connection.autoconnect-priority 100 \
  ipv4.method manual \
  ipv4.addresses 10.0.1.3/24 \
  ipv4.never-default yes \
  ipv6.method disabled
```

This command is creating a profile for the `eth0` ethernet device named `private-link` that auto-connects when available and has a priority of 100.  We are assigning the private IP `10.0.1.3` to this device when it connects and we are making sure that IPv6 is disabled.

Validate that it was created successfully with the following command:

```
nmcli connection show
```

You should see this now:

| NAME | UUID | TYPE | DEVICE
|-|-|-|-|
| Wired Connection 1 | <some large string> | ethernet | eth0 |
| lo | <some large string> | loopback | lo |
| **private-link** | **<some large string>** | **ethernet** | **--** |

## Step 1e - Machine #1 - Disable auto-connect on the `Wired Connection 2`

Use the following command to disable auto-connect:

```
sudo nmcli connection modify "Wired connection 2" connection.autoconnect no
```

This guarantees that this does not cause issues when we connect the ethernet cable to the USB-to-Ethernet adapter.

We want the Machine #2 to auto-connect, so, we don't touch it.

# Step 2 - Validating the private network works

In this step we are going to make sure that the connection settings that we applied are working as intended.

```
                              Your PC
                                 |
                                 | (eth0)
                    -----------------------------
                             Home Router
                    -----------------------------
                                 |
                                 | (eth0)
                              Machine 1
                                 | (eth1)
                                 |
                                 | (eth0)
                              Machine 2
```

Machine #1 should still be accessible through our home/office network.  We can SSH into the machine.

Machine #2 will not be accessible in our home/office network because it is now behind Machine #1.

In order to access Machine #2, we need to do it through Machine #1.

## Step 2a - Swap the Ethernet cable

Disconnect Machine #2 from the Home/Office router and connect it to the USB-to-Ethernet adapter in Machine #1.

*NOTE: The moment you switch the cables, your previous SSH connection to the Machine #2 will stop working.*

## Step 2b - SSH in to both machines

To SSH into Machine #1:

```
ssh <user>@<Machine-1-IP>
```

To SSH into Machine #2, use Machine #1 as a jump host:

```
ssh <user>@<Machine-1-IP>
```

then

```
ssh <user>@<Machine-2-Private-IP>
```

## Step 2c - Check the status of the network in Machine #1

Run this command in both machines:

```
ip -br addr
```

In Machine #1, you should have 2 ethernet devices: `eth0` and `eth1`.

| Device ID | Status | Network Information | Notes |
|-|-|-|-|
| lo | UNKNOWN | 127.0.0.1/8 | Loopback device |
| eth0 | UP | 10.0.0.30/24 | Current connection to the Home Network (shows its IP) |
| wlan0 | DOWN | - | If your machine has a Wi-Fi device (unused) |
| **eth1** | **UP** | **10.0.1.2/24** | **USB-to-Ethernet Adapter** (shows its private IP) |

In Machine #2, you should have 1 ethernet device: `eth0`.

| Device ID | Status | Network Information | Notes |
|-|-|-|-|
| lo | UNKNOWN | 127.0.0.1/8 | Loopback device |
| **eth0** | **UP** | **10.0.1.3/24** | **USB-to-Ethernet Adapter** (shows its private IP) |

## Step 2d - Validate both machines can talk to each other using the private network

On Machine #1 run:

```
ping -c 4 10.0.1.3
```

You should get successful responses from Machine #2.

On Machine #2 run:

```
ping -c 4 10.0.1.2
```

You should get successful responses from Machine #1.

## Step 2e - Checking the routes

On Machine #2 run:

```
ip route
```

You should see something like this:

```
10.0.1.0/24 dev eth0  proto kernel  scope link  src 10.0.1.3  metric  100
```

We have a route for our private network that communicates through the `eth0` device back to any machine on the private network and our IP there is `10.0.1.3`.

## Step 2f - Checking that we don't have internet access

On Machine #2, run the following commands to try to connect to Cloudflare's DNS server:

```
ping -c 3 1.1.1.1
```

We should get the following reply:

```
ping: connect: Network is unreachable
```

Run this other command to test access to Google:

```
curl --connect-timeout 5 -I https://google.com
```

We should get the following reply:

```
curl: (6) Could not resolve host: google.com
```

# Step 3 - Enabling Internet connectivity for maintenance tasks

Now we have connectivity between the 2 machines but Machine #2 cannot connect to the internet to download required packages that we need to install to run our application server.  We are going to create some helper commands in both Machines that will allow us to enable access to the Public Internet on Machine #2 through Machine #1.  This will be used temporarily when we need to install or update packages.  We will disable it during normal operation!

## Step 3a - Creating the Maintenance Commands in Machine #1

*NOTE: This command is hardcoding the IPs that we have been seeing through the tutorial.  If your IPs are different, make sure to update them!*

Run this command to create the `maintenance-enable` command:

```
sudo tee /usr/local/sbin/maintenance-enable >/dev/null <<'EOF'
#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
    echo "Run with sudo."
    exit 1
fi

if nft list table inet maintenance >/dev/null 2>&1; then
    echo "Maintenance access is already enabled."
    exit 1
fi

nft -f - <<'NFT'
add table inet maintenance
add chain inet maintenance forward { type filter hook forward priority 0; policy drop; }
add chain inet maintenance postrouting { type nat hook postrouting priority 100; }
add rule inet maintenance forward iifname "eth1" oifname "eth0" ip saddr 10.0.1.3 ct state new,established,related accept
add rule inet maintenance forward iifname "eth0" oifname "eth1" ip daddr 10.0.1.3 ct state established,related accept
add rule inet maintenance postrouting oifname "eth0" ip saddr 10.0.1.3 masquerade
NFT

sysctl -w net.ipv4.ip_forward=1
echo "Maintenance access ENABLED for 10.0.1.3."
EOF
```

Run this command to create the `maintenance-disable` command:

```
sudo tee /usr/local/sbin/maintenance-disable >/dev/null <<'EOF'
#!/bin/sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
    echo "Run with sudo."
    exit 1
fi

if nft list table inet maintenance >/dev/null 2>&1; then
    nft delete table inet maintenance
fi

sysctl -w net.ipv4.ip_forward=0
echo "Maintenance access DISABLED."
EOF
```

Make the commands executable:

```
sudo chmod 750 /usr/local/sbin/maintenance-enable /usr/local/sbin/maintenance-disable
```

## Step 3b - Creating the Maintenance Commands in Machine #2

*NOTE: This command is hardcoding the IPs that we have been seeing through the tutorial.  If your IPs are different, make sure to update them!*

Run this command to create the `maintenance-enable` command:

```

sudo tee /usr/local/sbin/maintenance-enable >/dev/null <<'EOF'
#!/bin/sh
set -eu

if ip route show default | grep -qv 'default via 10.0.1.2 dev eth0'; then
    echo "Unexpected default route exists; refusing to overwrite it."
    exit 1
fi

# Configure temporary DNS first.
nmcli device modify eth0 ipv4.dns "1.1.1.1 8.8.8.8"

# Add the temporary route after DNS reconfigures the device.
ip route replace default via 10.0.1.2 dev eth0

echo "Maintenance network settings ENABLED."
ip route show default
EOF
```

Run this command to create the `maintenance-disable` command:

```

sudo tee /usr/local/sbin/maintenance-disable >/dev/null <<'EOF'
#!/bin/sh
set -eu

# Remove the temporary default route.
ip route del default via 10.0.1.2 dev eth0 2>/dev/null || true

# Clear temporary DNS from the active connection.
nmcli device modify eth0 ipv4.dns ""

# Remove the route again in case the device reconfiguration restored it.
ip route del default via 10.0.1.2 dev eth0 2>/dev/null || true

echo "Maintenance network settings DISABLED."
ip route show default
EOF
```

Make the commands executable:

```
sudo chmod 750 /usr/local/sbin/maintenance-enable /usr/local/sbin/maintenance-disable
```

## Step 3c - Testing Internet Access through NAT

Now, let's enable the internet access by running the `maintenance-enable` command in both machines.

```
sudo /usr/local/sbin/maintenance-enable
```

On Machine #2, run the following commands to try to connect to Cloudflare's DNS server:

```
ping -c 3 1.1.1.1
```

We should get a successful reply like this:

```
PING 1.1.1.1 (1.1.1.1) 56(84) bytes of data.
64 bytes from 1.1.1.1: icmp_seq=1 ttl=57 time=4.30ms
64 bytes from 1.1.1.1: icmp_seq=2 ttl=57 time=4.07ms
64 bytes from 1.1.1.1: icmp_seq=3 ttl=57 time=6.58ms

--- 1.1.1.1 ping statistics ---
3 packets trasnsmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 4.069/4.983/6.584/1.135 ms
```

Run this other command to test access to Google:

```
curl --connect-timeout 5 -I https://google.com
```

We should get a successful reply now.

# Step 4 - Installing our application server (Apache)

Run the following command in Machine #2 to update the packages:

```
sudo apt update -y
```

Run the following command in Machine #2 to install Apache2:

```
sudo apt install -y apache2
```

Run the following command in Machine #2 to auto-start Apache on boot and to enable it:

```
sudo systemctl enable --now apache2
```

Run the following command in Machine #2 to check the status of Apache2:

```
sudo systemctl status apache2 --no-pager
```

It should state that the application is `active (running)`.

# Step 5 - Disabling Internet Access

Now that we have installed our application server and it is running, we need to disable internet access to harden our security.

Use the `maintenance-disable` commands that we created in both machines to disable it:

```
sudo /usr/local/sbin/maintenance-disable
```

# Step 6 - Preparing our application

We want to serve something fun to the Invisible Internet.  Let's update the application being served to the Connect 4 game that is available in the `app` folder.

## Step 6a - Updating the index.html file

Run the following command to edit the `index.html` file with nano:

```
sudo nano /var/www/html/index.html
```

Now you should see the contents of the default Apache web page.  We need to remove everything from it.

With your cursos at the top of the page, press and hold `CTRL + K`.  It will "cut" out the contents of each line.  Make sure to hold until everything is gone.

Now, open the `connect4.html` file in the `app` folder with notepad and do a `CTRL + A` and `CTRL + C` to copy the contents to memory.

Navigate back to the terminal and paste it there by pressing the right button of the mouse.

To save the changes, press `CTRL + X`, then `y`, then `Enter`.

## Step 6b - Adding the application code

Now, we need to create another file with the application JavaScript code.  Run the following commmand:

```
sudo nano /var/www/html/game.js
```

Open the `game.js` file in the `app` folder with notepad and do a `CTRL + A` and `CTRL + c` to copy the contents to memory.

Navigate back to the terminal and paste it there by pressing the right button of the mouse.

To save the changes, press `CTRL + X`, then `y`, then `Enter`.

## Step 6c - Adding the application styling

Now, we need to create another file with the look of the application.  Run the following commmand:

```
sudo nano /var/www/html/style.css
```

Open the `style.css` file in the `app` folder with notepad and do a `CTRL + A` and `CTRL + c` to copy the contents to memory.

Navigate back to the terminal and paste it there by pressing the right button of the mouse.

To save the changes, press `CTRL + X`, then `y`, then `Enter`.

Now, our Apache server has all the files it needs to serve our Connect 4 game on the Invisible Internet.

# Step 7 - Hardening our Apache to only listen for connections from the I2Pd router (Machine #1).

We want to make sure that we only serve our application to the requests that come from I2P.  For that, we will restrict where Apache is listening for requests.

Run the following command to validate where we are currently listening:

```
sudo ss -ltnp | grep ':80'
```

We'll likely get a reply like this:

```
LISTEN  0 511 0.0.0.0:80  0.0.0.0:* users:(("apache2",pid=1871,df=3),("apache2",pid=1870,fd=3),("apache2",pid=1867,fd=3))
```

We **don't want** to listen from anywhere!  That is this `0.0.0.0:80`.  We are going to restrict this to listen only to the IP of the Machine #1.

Run the following command to edit the Apache ports configuration:

```
sudo nano /etc/apache2/ports.conf
```

Change the line that says:

```
Listen 80
```

to

```
Listen 10.0.1.3:80
```

This is saying that we will only listen for connections that reach our private link to the Machine #1.

Let's validate that our configuration is valid:

```
sudo apache2ctl configtest
```

It should tell us:

```
Syntax OK
```

Let's restart Apache for the changes to take effect:

```
sudo systemctl restart apache2
```

Let's validate that the change is in effect:

```
sudo ss -ltnp | grep ':80'
```

We'll likely get a reply like this:

```
LISTEN  0 511 10.0.1.3:80  0.0.0.0:* users:(("apache2",pid=2586,df=3),("apache2",pid=2585,fd=3),("apache2",pid=2583,fd=3))
```

That confirms that we only get replies now from that network endpoint and we can test it by running the following command in both machines:

```
curl -I http://10.0.1.3
```

We should get an `HTTP/1.1 200 OK`

If we runt his command:

```
curl http://10.0.1.3
```

We should get the actual contents of the page.

# Step 8 - Publishing our website to the Invisible Internet

Now we are going to make the necessary changes in our I2PD router to expose our application to the Invisible Internet.

On Machine #1 run the following command to create a backup of our I2PD configuration:

```
sudo cp -a /etc/i2pd/tunnels.conf /etc/i2pd/tunnels.conf.backup
```

Then, let's edit the `tunnels.conf` file with nano:

```
sudo nano /etc/i2pd/tunnels.conf
```

You'll likely have only one service enabled: `IRC-ILITA`.

Write the following under its block:

```
[PRIVATE-WEBSITE]
type = http
host = 10.0.1.3
port = 80
keys = website-keys.dat
```

To save the changes, press `CTRL + X`, then `y`, then `Enter`.

Let's make sure that the directory where we will be saving our website keys is writable also:

```
sudo -u i2pd test -w /var/lib/i2pd && echo "Data directory is writable"
```

If we see the message `Data directory is writable`, the directory is writable and we should not have any issues.

Let's restart I2PD for the changes to take effect:

```
sudo systemctl restart i2pd
```

If everything ran successfully, we should also have the `website-keys.dat` file created upon restart:

```
sudo ls -l /var/lib/i2pd/website-keys.dat
```

It should show the file to us and its information like this:

```
-rw-r-----  1 i2pd  i2pd  679 Oct 24 18:09  /var/lib/i2pd/website-keys.dat
```

We can confirm that our website is available through I2P by going to the I2PD Web Console, clicking the `I2P tunnels` link and it should list a Server Tunnel like this:

```
PRIVATE-WEBSITE => <our website hash>.b32.i2p:80
```

# Step 9 - Accessing our application

Using a browser that is connected to an I2P router, we can navigate to the URL that we saw in the Web Console.

```
http://<some large string>.b32.i2p
```

Our application should load in the browser and we should be able to play Connect 4.

# Enjoy!

That should be it.

Now, use your newly built I2P application.