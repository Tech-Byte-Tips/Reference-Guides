# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Building the folder structure

This folder structure will reside in the host machine and we are going to pass folders to the container to use.

Follow the following folder structure:

```
/docker/                  <-- Share created by Container Manager
--/Containers             <-- Contains all the containers data
----/Decypharr            <-- Contains all the configuration data for the Decypharr application container
/Media/                   <-- Contains all of the media files
--/cache                  <-- Contains a cache from the Debrid provider (will be created by the app)
--/downloads              <-- Where you can download the files locally (will be created by the app)
--/remote                 <-- The virtual file system from the Debrid/Usenet provider will be mounted here (will be created by the app)
```

Make sure that you make your user the owner of the /Media and /docker directories (recursively):

sudo chown -R user:user /docker
sudo chown -R user:user /Media

Use the "ID" command to identify your user and group IDs.  You need to assign this to your container so that it can read/write to the folders.

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.

## Other considerations

Always make sure that your paths in the host are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always check.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.