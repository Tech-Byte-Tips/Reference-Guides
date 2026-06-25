# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# Building the folder structure

This folder structure will reside in the 'docker' folder created by the NAS when you install Container Manager.

Inside it, have a folder for the container's data ("Containers") and another for the project docker compose files ("Projects").

Follow the following folder structure:

```
/docker                     <-- Share created by Container Manager
--/Containers               <-- Contains all the containers data
----/SubGen                 <-- Contains all the data for the SubGen application container
------/models               <-- Contains the model files
--/Projects                 <-- Contains the Container Manager projects
----/SubGen                 <-- Contains the project for the SubGen application
------/compose.yaml         <-- The SubGen docker compose file
```

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.

There are 2 versions:

1. If you plan to use a GPU (example is for an nVidia card with 8+ GB of VRAM)
2. If you plan to use the CPU (no graphics card) - Slower but guaranteed to work

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.