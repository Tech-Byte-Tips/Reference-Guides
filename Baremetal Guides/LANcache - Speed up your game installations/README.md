# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# Building the folder structure

This folder structure will guarantee that we have easy access to the data and that everything is coherent for us to work:

```
/                         <-- Ubuntu disk root
--/Containers             <-- Contains all the containers' data
----/LANcache             <-- Contains all the data for the LANcache application containers
------/cache              <-- Contains the cache (game) files
------/logs               <-- Contains the container log files
--/Projects               <-- Contains the Docker Compose projects
----/LANcache             <-- Contains the project for the LANcache application
------/compose.yaml       <-- The LANcache docker compose file
```

# Understanding our network

The first thing that we need to understand is the topology of our network.  Home (private) networks usually fall within the ranges:

1. 10.0.0.0 /24 
2. 192.168.1.0 /24

You need to figure out what your range is.

You will need to pick 2 IP addresses that are not being used in your network.  These will be assigned to the containers running LANcache.

In my case I will be using the following to set everything up:

| Property | Value |
|-|-|
| Home Network | 10.0.0.0 |
| CIDR | 24 (means 254 IPs in the range) |
| Home Router IP | 10.0.0.1 |
| DNS Container IP | 10.0.0.35 |
| Cache Container IP | 10.0.0.35 |
| DNS Upstream 1 | 1.1.1.1 (Cloudflare) |
| DNS Upstream 1 | 8.8.8.8 (Google) |

# Preparing the Operating System

1. Update the system package list

```
sudo apt update -y
```

2. Upgrade the packages

```
sudo apt upgrade -y
```

3. Install basic dependencies

```
sudo apt install -y git ca-certificates curl
```

4. Prepare the apt keyrings file

```
sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL \
  https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc
```

5. Add Docker's APT repository

```
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF
```

6. Install Docker & Docker Compose

```
sudo apt update

sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin
```

7. Auto start docker on system boot, start it, and check its status

```
sudo systemctl enable docker

sudo systemctl start docker

sudo systemctl status docker
```

8. Check the versions

```
docker --version

docker compose version
```

9. Test with a hello-world container

```
sudo docker run hello-world
```

10. Run without sudo

```
sudo usermod -aG docker $USER
```

# Configure the Ubuntu network interfaces

We need the Ubuntu machine to own the 2 container IPs that we will be assigning.

1. Identify your network interface

```
ip -br addr
```

2. Find your netplan configuration

```
ls -l /etc/netplan/
```

3. Open the configuration file

```
sudo nano /etc/netplan/50-cloud-init.yaml
```

4. Make sure that the ethernet interface is the same that we saw previously in step 1.

Change it to look like this:

```
network:
  version: 2
  ethernets:
    <interface name>:
      dhcp4: true
      addresses:
        - 10.0.0.<IP 1>/24
        - 10.0.0.<IP 2>/24
```

5. Validate that the configuration is correct

```
sudo netplan try
```

6. Apply the changes

```
sudo netplan apply
```

7. Verify the changes took effect

```
ip -br addr
```

# Preparing the folder structure

1. Create the folders in the root of the disk

```
sudo mkdir /Containers
sudo mkdir /Containers/LANcache
sudo mkdir /Containers/LANcache/cache
sudo mkdir /Containers/LANcache/logs
sudo mkdir /Projects
```

2. Make all folders accessible to any user (to make it easier for us)

```
sudo chmod -R 777 /Containers
sudo chmod -R 777 /Projects
```

3. Determine how much storage you have available for the cache

```
df -h /Containers/LANcache
```

Keep in mind the size that you have so that we specify this in the Docker Compose file.

# Preparing the Docker Compose

1. Create a docker-compose.yaml file

```
nano /Projects/docker-compose.yaml
```

2. Place the contents of the Docker Compose file

```
services:

  # Container #1 - DNS
  lancache-dns:
    image: lancachenet/lancache-dns:latest
    container_name: LANcache-DNS
    restart: unless-stopped

    environment:
      USE_GENERIC_CACHE: "true"
      LANCACHE_IP: "10.0.0.34"
      UPSTREAM_DNS: "1.1.1.1;8.8.8.8"

    ports:
      - "10.0.0.35:53:53/udp"
      - "10.0.0.35:53:53/tcp"

  # Container #2 - Cache
  lancache-monolithic:
    image: lancachenet/monolithic:latest
    container_name: LANcache-monolithic
    restart: unless-stopped

    environment:
      CACHE_DISK_SIZE: "400g"
      CACHE_INDEX_SIZE: "500m"
      CACHE_MAX_AGE: "3560d"
      MIN_FREE_DISK: "10g"
      UPSTREAM_DNS: "1.1.1.1 8.8.8.8"

    ports:
      - "10.0.0.34:80:80/tcp"
      - "10.0.0.34:443:443/tcp"

    volumes:
      # Machine | Container
      - /Containers/LANcache/cache:/data/cache
      - /Containers/LANcache/logs:/data/logs
```

3. Check that our ports are available

```
sudo ss -tulpn | grep -E ':(53|80|443)\b'
```

4. Build the Project

```
sudo docker-compose up -f /Projects/docker-compose.yaml
```

5. Check the status of the containers

```
sudo docker ps
```

6. Check the logs of the containers to make sure there are no errors

```
sudo docker logs LANcache-DNS

sudo docker logs LANcache-monolithic
```

# Change our DNS provider

You have two options:

1. Make the LANcache-DNS container's IP the default for all machines in your network by setting it in the router as the DNS server.

2. On each machine, change the DNS to the IP of the container.

# Test it

Download a game from Steam.

You should see the cache starts populating with data.

Delete the game from the machine and reinstall it.  It should now pull it from the cache.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.