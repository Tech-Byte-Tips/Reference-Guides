## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# I2PSnark Standalone - Torrenting inside the I2P network

I2PSnark is the built‑in anonymous BitTorrent client inside the I2P network, designed specifically for torrenting within I2P’s encrypted, peer‑to‑peer ecosystem. It replaces traditional IP‑based peer identification with I2P destinations, routes all traffic through layered garlic routing tunnels, and operates entirely inside isolated I2P swarms; which means that no clearnet peers ever see your real IP address. I2PSnark provides a lightweight, privacy‑focused way to download and share files anonymously using features like DHT, magnet links, and peer exchange.

I2PSnark Standalone is the isolated version of I2P that does not come bundled in the Java Router.  It is meant to be used by itself and connecting to any I2P router.

## Assumptions

For this guide, we will assume that you followed the previous guide where we set up a Raspberry Pi as an always on I2Pd router, or you have I2Pd running in another linux machine.

If you installed it in Windows, you have to adjust some steps.

## Pre-Requisites

1. I2Pd - The Invisible Internet Protocol Router written in C++.  We covered how to get this working in a [previous video](https://www.youtube.com/watch?v=ZOaz6-XwBiQ).
2. Java - I2PSnark is a Java application.  You will need to have Java installed in your system for it to work.

### Installing Java

### Windows:

Download the [Java Runtime Environment installer](https://www.java.com/en/download/) and run it.

### Linux (Debian based):

```
sudo apt update -y
sudo apt install -y openjdk-11-jre
```

Verify:

```
java -version
```

Should give you something like this:

`
openjdk version "11.x.x"
`

## Download I2PSnark

Visit the official I2P+ GitHub website and visit their [Downloads](https://i2pplus.github.io/download.html) page.  
You will see a table with the downloads offered.  Select the I2PSnark [link from GitHub](https://i2pplus.github.io/installers/i2psnark-standalone.zip).

This is a zip file.  Download and save it somewhere in your computer where you can find it easily.  We will refer back to it in a bit.

## Configuring I2Pd (the router)

In a previous video, we set up I2Pd with a generic configuration file that should have enabled the protocol used by I2PSnark to establish its connections.  However, we are going to make sure that it is functioning properly and enabled.

### Checking the status of the I2CP protocol

Visit the Web Console of the I2Pd router that you set up previously.  It should be in the following URL:

If you use the hostname:

```
http://i2pd:7070
```

If you use its IP:

```
http://<Pi-IP>:7070
```

When the Web Console opens, it should show you the details about your I2Pd router.  At the very bottom, you will see the list of protocols and their status.  You want to see the following:

| Protocol | Status |
|-|-|
| I2CP | Enabled (Green) |

If it shows are Disabled (Red), then you need to enable it in the I2Pd configuration file first.

### Enabling the I2CP Protocol

1. SSH into the Raspberry Pi (or other device) that is running the I2Pd router.

   ```
   ssh <user>@i2pd
   ```

2. Edit the i2pd.conf file

   ```
   sudo nano /etc/i2pd/i2pd.conf
   ```

3. Edit the I2CP configuration

   Scroll down in the configuration file until you reach the I2CP section.  Make sure to enable it, something similar to this:

   ```
   [I2CP]
   enabled = true
   address = <the IP of the raspberry pi>
   port    = 7654
   ```

4. Save and Exit

   `CTRL + X`

   `Y`

   `Enter`

5. Restart the I2Pd service for the changes to take effect

   ```
   sudo service i2pd restart
   ```

6. Refresh the Web console.  It should now say that I2CP is enabled.

### The Length of the tunnels

Remember that we discussed how the amount of tunnels and hops inside them affects your bandwitdth vs anonimity in the network.

***More Hops*** - More anonimity & slower transfers

***Less Hops*** - Less anonimity & faster transfers

Enable and adjust these if you want.  Otherwise, it will use 3 hops by default.

```
#####################################################################
#                           EXPLORATORY                             #
#####################################################################

[exploratory]

## Exploratory inbound tunnels length. [integer]
# inbound.length = 4

## Exploratory inbound tunnels quantity. [integer]
# inbound.quantity = 4

## Exploratory outbound tunnels length. [integer]
# outbound.length = 4

## Exploratory outbound tunnels quantity. [integer]
# outbound.quantity = 4
```

With this, our router is ready to accept requests from I2PSnark and handle our secure connections.

*NOTE: Remember to restart the router service to apply any changes!*

## Installing the application in Windows

This application is "portable" so there is no installer and it will not create a shortcut for you automatically.  We need to drop the application files into our system and then run it ourselves.

Extract the contents of the zip file that we downloaded previously into a folder in your computer.

Create the following folder and drop the zip file in it.

```
C:\I2P
```

Using 7-zip, extract the zip file here.  It should result in a new folder named i2psnark with all the application files in it.

```
C:\I2P\i2psnark
```

Now you are ready to run the application.  Open the i2psnark folder and double click the file named `launch-i2psnark.bat`.  It will open the command prompt with the application running and showing you logs.

The application should automatically open your web browser on the following URL:

```
http://localhost:8002/i2psnark
```

This is where you actually use the application.

You must leave the terminal window running to use the application.  You can just minimize it.

## Configuring I2PSnark

In your browser window, open the following URL to change the configuration of the application:

```
http://localhost:8002/i2psnark/configure
```

Make the configurations are you please.

### Data Directory

This is probably the most important setting.  You have to tell I2PSnark, where in your computer you want it to download the files.  By default, it will save everything to the folder named i2psnark inside the i2psnark folder.

### Torrent Specific Tunnel Length

Here, you can specify specific tunnel length that only applies to I2PSnark and the I2Pd router will honor.

This means that you could have configured your router to have 1 hop (fastest speeds / least anonimity) but in here you can tell the router that for all connections that are for I2PSnark, you want it to use a different setting like 4 (slower / more anonimity).

Save your configurations.

## Start Torrenting

1. Visit an I2P tracker like Postman and look for a torrent that you are interested in downloading.
2. Grab the magnet link for it
3. Go back to I2PSnark and click on `Add Torrent`
4. Paste the magnet link to your torrent.
5. Leech & Seed!

# Enjoy!

That should be it.  Enjoy your anonymous torrenting, without a VPN!  Seed for others if you found something useful.