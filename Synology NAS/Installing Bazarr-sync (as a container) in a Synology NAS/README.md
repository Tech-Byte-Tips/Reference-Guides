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
----/Bazarr-sync            <-- Contains all the data for the Bazarr-sync application container
------/config.yaml          <-- Contains the Bazarr instance connection data
--/Projects                 <-- Contains the Container Manager projects
----/Bazarr-sync            <-- Contains the project for the Bazarr-sync application
------/compose.yaml         <-- The Bazarr-sync docker compose file
```

# The Docker Compose file

I have put comments in the docker compose file to make it easy to change.  You will see 2 docker compose files:

  1. compose.yaml - If you want the container to automatically trigger a sync for all your movies and tv shows immediately after you start the container
  2. compose-tui.yaml - If you want to manually to and use the Terminal User Interface from the command line

## Other options

Always make sure that your paths in the NAS are correct.  Those are the ones on the left side of the colon (:) in the volumes section.  Your volume name might be different, so, always copy the values from the Synology Files interface.

# Using the TUI

1. If you are running this method, you will first have to start the container using the TUI version of the compose.

   The container will start waiting infinitely.

   This allows you to open a terminal session and use the Bazarr-sync application.

2. Opening the terminal:

   Navigate to the container and click Action > Open terminal.

   The new window will open and you'll likely see an error: "Failed to attach.  No teletype terminal found."

   This error is because it cannot automatically attach to a terminal.  It tries /bin/bash by default but it doesn't exist in the container.  We have to open a terminal session using /bin/sh

   Click "OK" to acknowledge the error.

   Click the arrow next to the "Create" button and select "Launch with command"

   Put the following command "/bin/sh" and click "OK".

   This will now open a new tab on the left for your shell connection.  Select it.  You should now see the command prompt in the directory: /usr/src/app (where the application is hosted)

3. Run the Bazarr-sync application by typing the following command:

   ```
   bazarr-sync
   ```

   The Bazarr-sync Terminal User Interface will load for you.

   NOTE: The TUI in a Synology session is "funky."  It takes a bit to understand how to use it because it does not behave properly.  Watch my video if you don't understand it.

4. Provide the connection details to your Bazarr instance.

   NOTE: If you provided a config.yaml file with the appropriate information, it should have it already and you can just press Enter to confirm that it can connect to Bazarr.

   If you haven't, you will need to provide the details as follows:

   Press the down arrow 2 times (to select Settings) and press Enter.

   Bazarr URL will be highlighted by default.  You can start typing to edit the information.  You will see the URL updating, funkily.  When done, press Enter to save.

   To edit the API Key, press the down arrow once.  It will select it for editing.  Start typing and press Enter when done.

   Once both fields have been populated, press Enter.  It will validate whether it can connect to Bazarr.

   Once you get the green success message, press q or Esc to go back to the main menu.

5. Select what you want to sync.

   This is basically you highlighting if you want to sync movies or tv shows.  After that, it will give you a list of the content to pick which one to sync.  After that, it will give you a list of subtitle files to pick the one(s) to sync.

# Enjoy!

That should be it.  You should be able to just run the project and access the application.