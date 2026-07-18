# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# About Authentik's Architecture

Authentik is split into multiple containers.

1. Database - Stores the application data
2. Cache - In memory database for faster responses
3. Server - The actual application
4. Worker - A container that handles background tasks

# Building the folder structure

This folder structure will reside in the 'docker' folder created by the NAS when you install Container Manager.

Inside it, have a folder for the container's data ("Containers") and another for the project docker compose files ("Projects").

Follow the following folder structure:

```
/docker                   <-- Share created by Container Manager
--/Containers             <-- Contains all the containers data
----/Authentik            <-- Contains all the data for the Authentik application containers
------/Certs              <-- Contains the certificate files
------/Data               <-- Contains the application data files
------/DB                 <-- Contains the database files
------/Redis              <-- Contains the cache files
------/Templates          <-- Contains the application template files
--/Projects               <-- Contains the Container Manager projects
----/Authentik            <-- Contains the project for the Authentik application
------/compose.yaml       <-- The Authentik docker compose file
```

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# First Setup

When the containers are spun up, reach the application at http://<NAS IP>:9000.

As of the time of writing, you will need to log in using the following user with the bootstrap password that you put in the Docker Compose

```
akadmin
```

# Enjoy!

That should be it.  You should be able to just run the project and access the application.