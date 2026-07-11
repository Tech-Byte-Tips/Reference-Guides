# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# About PenPot's Architecture

Penpot is split into multiple microservices. Each container handles one subsystem: UI, API, exporting, collaboration, database, caching, and email.

1. Frontend — The Web UI
2. API (Backend) - Handles the logic
3. MCP server - Handles collaboration
4. Exporter - Converts designs into files
5. Database - Stores the application data
6. ValKey (Cache) - Handles notifications, events, and temporary data
7. Mail Catcher - A fake email server for development

# Building the folder structure

This application is super tricky and exhibits permissions issues when you try to store the data in volume mounts.  For this reason, we will be letting docker create volumes and manage them instead of creating a folder structure to save the data.

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.