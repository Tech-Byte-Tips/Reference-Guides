# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Building the directory structure

For better results attach a large enough USB drive to your Raspberry Pi and then create the following file structure inside it.

Follow the following folder structure:

```
/USB                   <-- Where you mounted your USB drive
--/filebrowser         <-- Contains all the filebrowser information
----filebrowser.db     <-- The database will be created in here by the application
----/filebrowser       <-- Contains the application's configuration file
------filebrowser.json <-- The configuration file
----/srv               <-- Contains the actual files that it will serve
```

# Download and Install

Use the official script to download and install the application.

```
curl -fsSL https://raw.githubusercontent.com/filebrowser/get/master/get.sh | bash
```

Verify it was installed.

```
filebrowser version
```

# Create a user, folder structure, and fix permissions

```
sudo mkdir -p /USB/filebrowser
sudo mkdir -p /USB/filebrowser/filebrowser
sudo mkdir -p /USB/filebrowser/srv
sudo useradd --system --home /USB/filebrowser --shell /usr/sbin/nologin filebrowser
sudo chown -R filebrowser:filebrowser /USB/filebrowser
```

# Create a config file

```
sudo nano /USB/filebrowser/filebrowser.json
```

Add the following content:

```
{
  "port": 80,
  "baseURL": "",
  "address": "0.0.0.0",
  "log": "stdout",
  "database": "/USB/filebrowser/filebrowser.db",
  "root": "/USB/srv"
}
```

Fix permissions:

```
sudo chown filebrowser:filebrowser /USB/filebrowser/filebrowser/filebrowser.json
```

# Create a System Service

Create the file using nano.

```
sudo nano /etc/systemd/system/filebrowser.service
```

Enter the following:

```
[Unit]
Description=File Browser
After=network.target

[Service]
Type=simple
User=filebrowser
Group=filebrowser
WorkingDirectory=/USB/filebrowser

# Use config file if present; otherwise run with flags
ExecStart=/usr/local/bin/filebrowser --config /USB/filebrowser/filebrowser/filebrowser.json

# Uncomment the next line instead if you prefer flags over JSON:
# ExecStart=/usr/local/bin/filebrowser -r /srv -a 0.0.0.0 -p 8080 --database /USB/filebrowser/filebrowser.db

Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

# Enable the Service

Run the following commands to enable the service.

```
sudo systemctl daemon-reload
sudo systemctl enable filebrowser
sudo systemctl start filebrowser
sudo systemctl status filebrowser
```

# Go to the Web UI

Visit http://\<your-pi-ip\> to access the web UI.

The initial password for the admin will be listed in the output of the first time that you ran the application.

# Enjoy!

That should be it.

Now, use your favorite Reverse Proxy solution to expose it to the public internet.

I gave examples with:

1. Traefik
2. Synology NAS