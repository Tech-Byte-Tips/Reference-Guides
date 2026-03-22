# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Installing ZoneMinder in a Debian/Ubuntu system

So, you have a spare PC or access to a VM and you need a Network Video Recorder system.

This is the guide for you!

We'll cover how to setup a computer as an NVR (even a very old one), for free!

## Why do this?

An NVR system can be quite expensive.  If you already have an old computer lying around and some compatible cameras, you have everything that you need.

## Pre-requisites

These are the minimum requirements to get working with this guide:

  1. A computer or VM capable of running Ubuntu (preferably 22.04 +)
  2. Some network accessible cameras, preferably with ONVIF
  3. A decent sized Hard Disk (or two for easier setup)

---

# Let's get to work!

## Pre-Requisites

  1. Install Ubuntu on the system
  
  2. If you are using only 1 big disk, make sure to resize the partitions so that you have a small partition for the filesystem and a big one for the video files.
  If you use the same partition, it will fill it and your system will stop responding.

  If you are using a separate disk for the video files, you are good to continue.

## Step #1 - Update the system

  1. Run the following commands:

  ```
  sudo apt update -y && sudo apt upgrade -y
  ```

## Step #2 - Add the official apt repo

```
sudo apt install -y software-properties-common
```

```
sudo add-apt-repository ppa:iconnor/zoneminder-1.36
```

```
sudo apt update -y
```

## Step #3 - Install MariaDB

```
sudo apt install -y mariadb-server
```

## Step #4 - Install Zoneminder

```
sudo apt install -y zoneminder
```

## Step #5 - Enable Local USB Cameras

If you plan to use a local USB or V4L2 camera (/dev/video*), the web server user must be in the video group.

```
sudo adduser www-data video
```

```
sudo reboot now
```

## Step 6 - Configure Apache

```
sudo a2enmod rewrite headers cgi
```

```
sudo a2enconf zoneminder
```

```
sudo systemctl restart apache2
```

## Step 7 - Enable and start the application

```
sudo systemctl enable zoneminder
```

```
sudo systemctl start zoneminder
```

## Step 8 - Access it

Visit the URL of the server in your browser

http://\<IP\>/zm

## Step 9 - Accept/Decline the Data Sharing Policy

Pick your poison and click "Apply"

## Stop 10 - Set your TimeZone

Click the Options at the very top.

On the left side, you should be in System.

Look for the Timezone dropdown and select your appropriate timezone.

## Step 11 - Lock your server

On the System settings look for the OPT_USE_AUTH and check it.

Look for AUTH_HASH_SECRET and type your password.

## Step 12 - Save your changes

Scroll all the way down and click the Save button.

## Step 13 - Confirm authentication

It should have taken you to the login page.  If not, refresh the page.

Login using the default user and password combination: admin/admin

## Step 14 - Change the admin credentials

On the left side of the Options menu, choose Users.

Click on the User "admin".

Change the password and click Save.

## Step 15 - Preparing the Storage

First we need to make sure that our nvr partition or external drive is mounted for use in the system.
Run the following command to identify the partition's id.  Should be something like /dev/sdX# (e.g. /dev/sda6).

```
sudo blkid
```

Copy the UUID value of that partition for later use.

  e.g. UUID="d15d4aed-d813-4312-9c58-0dcd18972b02"

Create the mountpoint in the filesystem.

```
sudo mkdir -p /nvr
```

Add the partition or disk to the /etc/fstab:

```
sudo nano /etc/fstab
```

Add this to the end:
```
# ZoneMinder NVR
UUID=d15d4aed-d813-4312-9c58-0dcd18972b02       /nvr    ext4    defaults 0      2
```

Exit and Save:

Press CTRL + X
Press Y
Press Enter

Test the configuration:

```
sudo mount -a
df -h | grep nvr
```

You should see the mounted partition or drive.

Make sure ZoneMinder can write to it.

```
sudo chown -R www-data:www-data /nvr
ls -al /
```

You should see www-data as the owner of the folder now.

## Step 16 - Configuring the Storage

On the Options left side select Storage.

Click the "Add New Storage" button.

Use the following values:

```
Name: NVR
Path: /nvr
```

Leave the rest with default values.

Click the Save button.

Mark the filesystem drive by checking the box and the click the Delete button so that it doesn't try to write files there.

## Step 17 - Adding Cameras

Make sure you are in the Console page.

Click the "+ Add" button, you will be directed to the General settings.

```
Name: Front Door
Notes: The camera that points to the front door.
Server: Auto
Source Type: Ffmpeg
Function: Record
Analysis Enabled: Uncheck
Decoding Enabled: Check
Analysis FPS: 24
Maximum FPS: 24
```

Click on Source on the left side.

```
Source Path: rtsp://<username>:<password>@<IP>:554/cam/realmonitor?channel=1&subtype=0

  * Important: If you have special characters, you have to use URL encoding to escape them.

Method: TCP
Capture Resolution: Pick a value from the dropdown on the right.
```

Click on ONVIF.

```
If you prefer to use ONVIF, you can use the following URL format in the ONVIF tab:

ONVIF_URL: rtsp://<username>:<password>@<IP>:554/cam/realmonitor?channel=1&subtype=0&unicast=true&proto=Onvif
Username: admin
Password: password
```

Click on Storage on the left side.

```
Storage Area: NVR
Save JPEGs: Disabled
Video Writer: Camera Passthrough
```

Click on Control on the left side.

```
Controllable: Check
Control Type: Amcrest HTTP API (e.g. for an Amcrest camera)
```

Click Save.

Wait a little and the camera should turn green.  You should also see if it is recording and capturing the feed.

## Step 18 - Exposing with a free subdomain

Get a free subdomain from Changeip.com.

Make sure that we have curl installed to submit an update to Change IP's records.

```
sudo apt update -y
sudo apt install -y curl
```

Create an update script:

```
sudo nano ~/update-changeip.sh
```

```
#!/bin/bash
# Update @ entry
curl -s "https://nic.changeip.com/nic/update?u=username&p=password&hostname=domain.x24hr.com"
# Update * entry
curl -s "https://nic.changeip.com/nic/update?u=username&p=password&hostname=*.domain.x24hr.com"
```

Make the script executable:

```
chmod +x update-changeip.sh
```

Test the configuration:

```
./update-changeip.sh
```

## Step 19 - Expose publicly using SSL

We need Nginx to act as a reverse proxy.

```
sudo apt install -y nginx
```

Configure the reverse proxy entry:

```
sudo nano /etc/nginx/sites-available/zoneminder
```

Copy the following:

```
server {
    listen 80;
    server_name domain.x24hr.com;

    location / {
        proxy_pass http://127.0.0.1/zm/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the proxy entry:

```
sudo ln -s /etc/nginx/sites-available/zoneminder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Add SSL from Let's Encrypt using Certbot:

```
sudo apt install -y certbot python3-certbot-nginx
```

Run it:

```
sudo certbot --nginx -d domain.x24hr.com
```

This will automatically:

* Create an HTTPS configuration
* Redirect HTTP to HTTPS
* Install certificates
* Set up auto-renewal

Verify it:

Visit the URL https://domain.x24hr.com