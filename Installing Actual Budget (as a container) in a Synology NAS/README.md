# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Building the folder structure

This folder structure will reside in the 'docker' folder created by the NAS when you install Container Manager.

Inside it, have a folder for the container's data ("Containers") and another for the project docker compose files ("Projects").

Follow the following folder structure:

```
/docker                   <-- Share created by Container Manager
--/Containers             <-- Contains all the containers data
----/ActualBudget         <-- Contains all the data for the Actual Budget application containers
--/Projects               <-- Contains the Container Manager projects
----/ActualBudget         <-- Contains the project for the Actual Budget application
------/compose.yaml       <-- The Actual Budget docker compose file
```

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# The SSL Requirement

The application refuses to work without an SSL certificate.  I couldn't manage to get it to work using basic HTTP and terminate the SSL connection at the NAS level.  You have to provide some SSL certificate.  You can export the default Synology NAS SSL certificate and upload it to the docker/Containers/ActualBudget folder along with its key.

Make sure to rename the cert.pem and key.pem into ab.crt and ab.key.

Then you should be able to access it in your local network even though you get an SSL warning.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.