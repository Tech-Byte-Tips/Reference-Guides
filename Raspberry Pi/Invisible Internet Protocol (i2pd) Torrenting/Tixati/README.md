## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# Tixati - Torrenting inside the I2P network

Tixati is another well supported anonymous BitTorrent client used inside the I2P network. It allows you to torrent using both the regular internet and BitTorrent protocol and/or the Invisible Internet version of BitTorrent. 

This client can be used to share regular torrents over the open internet. If you decide to use the open internet, you should consider using a proxy or a VPN behind it.

If you are using only the I2P version, it replaces traditional IP‑based peer identification with I2P destinations, routes all traffic through layered garlic routing tunnels, and operates entirely inside isolated I2P swarms; which means that no clearnet peers ever see your real IP address. Just like I2PSnark, it provides a lightweight, privacy‑focused way to download and share files anonymously using features like DHT, magnet links, and peer exchange.

Given that you can use both the regular internet BitTorrent and the I2P version, this client allows you to perform cross-seeding. Cross-seeding refers to sharing files from the regular internet BitTorrent protocol into the I2P network.

## Assumptions

For this guide, we will assume that you followed the previous guide where we set up a Raspberry Pi as an always on I2Pd router, or you have I2Pd running in another linux machine.

If you installed it in Windows, you have to adjust some steps.

## Pre-Requisites

1. I2Pd - The Invisible Internet Protocol Router written in C++.  We covered how to get this working in a [previous video](https://www.youtube.com/watch?v=ZOaz6-XwBiQ).

## Download Tixati

1. Visit the official [Tixati website](https://tixati.com/).  
2. Click on the operating system that you are using.
3. Select the version to download and save it to your computer.  For the sake of the tutorial, we are using the [Windows Portable](https://tixati.com/download/tixati-3.44-1.portable) version.

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

Using 7-zip, extract the zip file here.  It should result in a new folder named `tixati-3.44-1.portable` (or similar) with all the application files in it.  Rename it to `tixati`.

```
C:\I2P\tixati
```

Now you are ready to run the application.  Open the tixati folder and double click the file named `tixati_Windows64bit.exe` (unless you have a 32-bit processor).  It will open the application.

## Configuring Tixati

Make the configurations are you please, I will cover the basics to get this working with I2P.

### Initial Config Screen

It asks you for the User Name to run as.  This is important for the social aspects of the application.  I don't recommend using something that can identify you, just in case.

It lets you define where you want to save the torrent data.  Pick a folder in your computer to save the files.

You can leave the port and UPnP as they are.

### Enabling I2P

In Settings to go the `I2P` options and turn it `On`.

Put the IP of the raspberry pi or other machine running the I2P daemon router.  The port should remain 7654 if you used my configuration for the router.

Click on the `Router Advanced Settings` button.

Here, you can specify specific tunnel length that only applies to Tixati and the I2Pd router will honor.

This means that you could have configured your router to have 1 hop (fastest speeds / least anonimity) but in here you can tell the router that for all connections that are for I2PSnark, you want it to use a different setting like 4 (slower / more anonimity).

Click on the `I2P Tracker Injection` button.

Add the URLs from the repository to add more trackers to the torrents by default.

Paste the URLs in the box on the top.

### Disabling IPv6

In `Network` > `Connections` make the `Network mode` = `IPv4 only`.

### Download / Upload Slots

On `Transfers` > `General` you can specify how many connections you want to establish.  Usually this should be increased to dedicate more bandwidth.

### Default Network(s) to use

If you plan to cross-seed, you should be running this behind a VPN to not expose your IP in the public BitTorrent network.  There is no VPN needed for I2P.

Right Click the `+ Add` button and highlight the `Networks` option, you have several options:

1. All - To cross-seed (Use VPN)
2. Internet - Public Open Internet BitTorrent Network (Use VPN)
3. I2P - Invisible Internet
4. None - Disabled

## Start Torrenting

1. Visit an I2P tracker like Postman and look for a torrent that you are interested in downloading.
2. Grab the magnet link for it
3. Go back to Tixati and click on `+ Add`
4. Paste the magnet link to your torrent.
5. Leech & Seed!

# Enjoy!

That should be it.  Enjoy your anonymous torrenting, without a VPN!  Seed for others if you found something useful.