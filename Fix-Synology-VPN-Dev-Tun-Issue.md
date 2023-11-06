# YouTube Video

How to Fix the Synology NAS VPN issue with /dev/tun (https://www.youtube.com/watch?v=)

-----------------------------------------------------------------------------------------------------------------

# Issue

When you are tring to run a container that runs any kind of VPN, the container fails to start because it can't find the /dev/tun or /tun/tap device.

We we getting through this issue by creating a VPN profile and connecting and disconnecting once after a NAS reboot.  It would create all the necessary things in Linux for the VPN to work later.

# Solution #1: Using the GUI

1. Open Control Panel

2. Click on 'Task Scheduler'

3. Click on Create > Triggered Task > User-Defined Script

4. Enter a name for the script: VPNTUN

5. Select 'root' as the user

6. Select 'Boot-up' as the Event

7. Check the 'Enabled' box.

8. Click on the 'Task Settings' tab

9. Under 'User-defined script' put the following code:

```
#!/bin/sh -e

insmod /lib/modules/tun.ko
```

10. Click the OK button now

11. Agree with the warning message

Now, every time you restart your NAS, the script will be automatically run and it will create the necessary tunnel interface.

You can now either run the script by pressing the 'Run' button to continue using your NAS or just reboot it.

-----------------------------------------------------------------------------------------------------------------

# Solution #2: Using the Command Line

1. Enable SSH by clicking Control Panel > Terminal & SNMP > Enable SSH service and clicking the Apply button.

2. SSH into the NAS and become root

```
    ssh <SYNOLOGY_USERNAME>@<NAS_IP>
    sudo su -
```

3. Check if tun module exists:

```
    lsmod | grep tun
```

If it returns nothing, it's not installed.  If you get output, it is installed.

4. Install the module if it is not installed:

```
    insmod /lib/modules/tun.ko
```

5. Test if the module works:

```
    mkdir /dev/net
    mknod /dev/net/tun c 10 200
    chmod 600 /dev/net/tun
    cat /dev/net/tun
```

If the result of the cat command was "File descriptor in bad state", it means that the module has been correctly installed.

6. Make the module persistent upon reboots by creating the following file:

Command:

```
vi /usr/local/etc/rc.d/tun.sh
```

Press 'i', then paste the contents below:

```
#!/bin/sh -e

insmod /lib/modules/tun.ko
```

Press 'Esc', then ':', then 'wq', then 'Enter' to save.

7. Make the script executable:

```
    chmod 0755 /usr/local/etc/rc.d/tun.sh
```

8. Exit out of the NAS by typing 'exit' twice

7. Disable SSH now

8. Reboot the NAS.  This time, the VPN should work without having to do anything manually.