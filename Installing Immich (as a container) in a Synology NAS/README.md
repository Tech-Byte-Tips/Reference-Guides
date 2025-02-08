# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Building the folder structure

This folder structure will reside in the 'docker' folder created by the NAS when you install Container Manager.

Inside it, have a folder for the container's data ("Containers") and another for the project docker compose files ("Projects").

Follow the following folder structure:

```
/docker                   <-- Share created by Container Manager
--/Containers             <-- Contains all the containers data
----/Immich               <-- Contains all the data for the Immich application containers
------/config             <-- Contains contains the Immich Server container configuration
--------/immich.json      <-- The Immich Server container configuration file
------/DB                 <-- Contains the Postgres database files
------/Uploads            <-- Contains the folders where Immich will process files
--/Projects               <-- Contains the Container Manager projects
----/Immich               <-- Contains the project for the Immich application
------/compose.yaml       <-- The Immich docker compose file
```

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.  I made it bare bones.  You can certainly make it more complicated if you want, but it WILL work this way.

## Configuration

You have two options here:

### 1.  Use the Web User Interface to configure the application (I did that in my video)

If you want to do it this way, leave the config folder and file commented out.

### 2. Create an immich.json file, you can use their reference.

If you want to do it this way, uncomment the config folder volume and the file.  It will then mount the config folder from the NAS to the container and also specify to the server where to read that file.

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.