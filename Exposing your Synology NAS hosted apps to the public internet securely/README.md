## Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Synology%2dNAS%2dSeries&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo

# Exposing your Synology NAS hosted apps to the public internet securely

So, you have a Synology NAS and you have applications running inside it but you want to access them from outside of wherever you have your NAS.

This is the guide for you!

We'll cover:

  1. How to get a free sub-domain for your applications using [ChangeIP](https://www.changeip.com/).
  2. How to configure your Router to pass the public traffic to your Synology NAS.
  3. How to secure your traffic with valid SSL certificates from Let's Encrypt.

## Why do this?

You might be working on some awesome app that you want to share with friends or the world.  You might just want to access your applications when outside your home.

## Pre-requisites

These are the minimum requirements to get working with this guide:

  1. Synology NAS with DSM 7.2
  2. Application(s) running in Container Manager

---

# Let's get to work!

## Step #1 - Getting a free sub-domain for our applications from [ChangeIP](https://www.changeip.com/)

  1. Navigate to [ChangeIP's free subdomain search](https://www.changeip.com/accounts/cart.php?a=confproduct&i=0).
     ![Free Dynamic DNS Search](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/001.png)
  2. Click the Continue button to verify its availability.  If it is available, it will show up as the only option in the dropdown.  Click the Continue button again.
     ![Free DNS Available](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/002.png)
  3. Click the Checkout button to reserve the subdomain.
     ![Free DNS Check Out](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/003.png)
  4. Provide your information and billing details to reserve the domain.  You will not be charged anything for a free sub-domain but it is required to create your account.
     If you already have a ChangeIP account, you can just sign in by clicking the Already Registered? button.
     ![Provide Details](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/004.png)
  5. Follow any additional instructions until you create your account and reserve it.

  NOTE: If you are willing to pay, you can buy your own domain with them too.  Something like: <site>.com

## Step #2 - Pointing our free sub-domain to our home/host public IP.

  1. Log into your ChangeIP's account.  Click on Services > DNS Manager.
     ![DNS Manager](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/005.png)
  2. Click on the name of the sub-domain that you created.
     ![Select DNS](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/006.png)
  3. Make changes to the DNS to match the following:

  | Hostname | Type | Value | TTL | Set 1 | Set 2 |
  |-|-|-|-|-|-|
  |*|A|Public IP|30|No|No|
  |@|A|Public IP|30|No|No|

  This configuration allows us to generate many sub-domains inside our sub-domain without having to come back to ChangeIP to add them.  It points everything under your sub-domain to your Public IP.

  ![DNS Configuration](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/007.png)

  4. Save the changes.

## Step #3 - Allowing public traffic into the NAS in our router.

These instructions vary a lot depending on the brand and model of the router that you use.  Hence, the instructions will be generic.  You need to refer to the guide of your router model.

  1. Log into your router's administration page.  The username and password is usually in a sticker in your router.
     NOTE: Usually something like: 10.0.0.1 or 192.168.1.1
  2. Look for an option named Firewall and click it.
  3. Look for an option named Port Forwarding and click it.
  4. You should have an option to either enter the IP where you want to direct the traffic or pick it from a list.  Select the IP of your Synology NAS.
  5. You should have an option to enter the application ports to forward.  Select Custom Ports.
  6. Select the Protocol to be TCP and UDP.  Enter the port that you are going to forward.
     NOTE: If you are not hosting anything else, it is safe to assume that you are not forwarding port 443 (HTTPS).  Use that.
     If you are using port 443 for anything else, just pick another port.  Example: 8443

     ![Added Port Forward Rule](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/008.png)
  7. Add the entry and apply the changes.

Your router should now be forwarding any request that it received on that port to your Synology NAS.
You should be able to access things from the public internet using: https://sub-domain.domain.tld:port.  Examples: 

Using port 443 - https://mylab.changeip.co
Using another non-standard port - https://mylab.changeip.co:8443

We can create internal sub-domains also, like https://nextcloud.mylab.changeip.co

## Step #4 - Configuring the Synology NAS reverse proxy to our application

Now, our Synology NAS is able to receive the traffic but it has no clue what to do with that traffic.  Our applications are running in Docker containers in Container Manager.
We need to let the NAS know what to do with that traffic.  That's the purpose of a reverse proxy.

1. In your Synology NAS, open Control Panel > Login Portal > Advanced.
2. Click on the Reverse Proxy button.  It will open a pop up window.
   ![Reverse Proxy Entries](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/009.png)
3. Click the Create button.  It will open another pop up window.
4. Give this reverse proxy rule a name.  I usually put the application's name.  In this example: VaultWarden
5. In the Source section, we are defining where the traffic is coming from.  Configure it like this:
  a. Protocol: HTTPS (secure connection)
  b. Hostname: vaultwarden.mylab.changeip.co (The URL to use)
  c. Port: 443 (or the custom port that you chose)
6. In the Destination section, we are defining where the traffic is going to inside the NAS.  Configure it like this:
  a. Protocol: HTTP (unsecure connection, means that we terminate the SSL connection at the NAS)
  b. Hostname: localhost (the local machine)
  c. Port: 8070 (The port where the container is exposed)
7. Click the Save button.

   ![Reverse Proxy Entry](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/010.png)

Now, let's quickly review what the did...

We are telling the NAS to listen for secure traffic destined to a specific URL, coming from port 443 (or the custom port), using a secure protocol.
We are telling the NAS to forward that traffic to the Docker Container that is running in the local machine, on the port that the container is exposed, using unsecured traffic.
This means that the SSL terminated once the traffic reaches the NAS, and from the NAS to the docker container (which resides in the same machine) the traffic is unencrypted.

Your reverse proxy entry is now configured and ready.  Your traffic is being redirected to the container appropriately.
![Saved Reverse Proxy Entry](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/011.png)

Now, we can navigate to the URL in our browser: https://vaultwarden.mylab.changeip.co and we will get a response.  However, the certificate that it is using, is invalid.  It is the default Synology self-signed certificate.  It doesn't give us credibility and our browser will complain about it with a warning.
![SSL Certificate Warning](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/012.png)
![Self-Signed SSL Certificate](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/013.png)

## Step #5 - Getting a valid SSL certificate from Let's Encrypt

Thankfully, Synology has an interface that allows us to request free SSL certificates from Let's Encrypt.  Let's use it to request a valid, genuine SSL certificate that can be trusted.

1. In your Synology NAS, open Control Panel > Security > Certificate.
   ![Synology Certificates](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/014.png)
2. In there, you'll see the default certificate that is being used to serve your HTTPS traffic.  It is self-signed.
3. Click the Add button then click the Next button.
4. Add a description to recognize what this certificate is for like: SSL certificate for VaultWarden
5. Select the option that says: Get a certificate from Let's Encrypt and click the Next button.
6. You need to provide the following information:
  a. Domain name: vaultwarden.mylab.changeip.co (This is the URL that is being covered by this certificate)
  b. E-mail: personal@gmail.com (This is your personal e-mail, you'll get notifications about the life of the certificate like expiration, renewal, etc.)
  c. Subject Alternate Name: vaultwarden.mylab.changeip.co (This is the URL that is being covered by this certificate)
  ![Certificate Request Details](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/015.png)
7. Click the Done button.

NOTE: At this point, the Synology NAS will do the ACME validation against Let's Encrypt to request, validate, and receive the certificate.  If you get a message saying to validate your information, submit it again.  Once successful, you'll see a new certificate in the list.

## Step #6 - Assigning the valid SSL Certificate

At this point, we have obtained a valid SSL certificate from Let's Encrypt but we are not using it yet.  we need to assign it to the reverse proxy entry.
![Valid Certificate Received](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/016.png)

1. Click the new certificate to select it, then click the Settings button.
2. Look for the reverse proxy entry.  On its right, you'll see the certificate that is being used in a dropdown.
  ![Assigning SSL Certificate](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/017.png)
3. Click the dropdown and choose the new certificate that we received, then click the OK button.
4. Click YES in the pop up window.

Great!  We have successfully assigned the SSL certificate to our reverse proxy entry.  Now, we should be able to navigate to the URL https://vaultwarden.mylab.changeip.co/ and not get a warning.

![Success - No Warning](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/018.png)
![Success - Valid Certificate](https://raw.githubusercontent.com/Tech-Byte-Tips/Reference-Guides/main/Exposing%20your%20Synology%20NAS%20hosted%20apps%20to%20the%20public%20internet%20securely/images/019.png)