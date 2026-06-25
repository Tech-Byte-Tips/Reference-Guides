# Please Support This Project!

I would appreciate a donation if you found it useful.

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53CD2WNX3698E&lc=US&item_name=TechByteTips&item_number=Video%2dRequests&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)

You can also support me by sending a BitCoin donation to the following address:

```
19JXFGfRUV4NedS5tBGfJhkfRrN2EQtxVo
```

# Torrenting inside the Invisible Internet

Sharing files is one of the main advantages of the Invisible Internet Procol.  It was designed to allow for easy and secure transfer of files between peers.  I2P torrenting is most useful when privacy is a higher priority than speed.  Users who want to minimize exposure of their network identity may find it preferable to public BitTorrent.

Benefits:

- Will **not** expose your public IP address if you configure your client properly.
  - Some clients can't even use the public internet to prevent IP leakage.
- Can allow you to cross share torrents.
  - This means making torrents from the public internet available inside I2P.
- Traffic is routed through multiple peers, making it difficult for outside observers to determine who is downloading or sharing a particular file.
- No reliance on centralized VPN providers.
  - Users do not need to trust a third party to protect their privacy.
- Resistant to many forms of network monitoring.
  - Internet service providers can generally see that I2P is being used, but not the specific files being transferred.
- Access to I2P-exclusive content.
  - Some torrents and file-sharing communities exist only within the I2P network.
- Distributed design.
  - There is no central server whose shutdown would disrupt the entire network.

Drawbacks:

- Significantly slower than public BitTorrent.
  - The additional routing required for anonymity increases latency and reduces throughput.
- Smaller peer population.
  - Many torrents have fewer seeders and leechers than their public internet counterparts.
- Longer download times
  - Popular torrents may still perform well, but rare content can be difficult to obtain.
- Higher resource usage.
  - Running an I2P router consumes CPU, memory, and bandwidth.
- More complex setup.
  - New users must understand I2P routing, tunnel configuration, and client settings.
- Limited client support
  - Not all BitTorrent clients support I2P natively.
- Performance can vary.
  - Speeds depend heavily on the health of the network and the number of participating peers.

# Available Torrent Clients

We will be covering how to use different torrent clients.  Instructions for the setup for each client will be in their own folder.

| Client | I2P Protocol | I2P DHT Support | I2P PeX Support | I2P HTTP Trackers Support | Notes |
| - | - | - | - | - | - |
| LibTorrent | - | No | No | Yes | - |
| qBittorrent | SAM | No | No | Yes | - |
| Vuze | I2CP | Yes | Yes | Yes | - |
| BiglyBT | I2CP | Yes | Yes | Yes | - |
| XD | SAM | - | - | - | - |
| I2PSnark | I2CP | Yes | Yes | Yes | - |
| I2PSnark Standalone | I2CP | Yes | Yes | Yes | - |
| Robert | BOB | - | - | - | - |

# List of Torrent Trackers

You can add additional torrent trackers to your torrents to enhance the finding of peers.

A list is maintained [here](http://vej4thpwphy6vit6v6abirqyvhporm7whrbyk74vvjhppfmd3plq.b32.i2p/) and usually contains something like this:

```
http://vej4thpwphy6vit6v6abirqyvhporm7whrbyk74vvjhppfmd3plq.b32.i2p/announce

http://7o3d4x4jpk3pvmmposhfqhc44zsy2dbtayfapuic3nuhh3r4grqq.b32.i2p/a

http://w7tpbzncbcocrqtwwm3nezhnnsw4ozadvi2hmvzdhrqzfxfum7wa.b32.i2p/a

http://qimlze77z7w32lx2ntnwkuqslrzlsqy7774v3urueuarafyqik5a.b32.i2p/a

http://ev5dpxvcmshi6mil7gaon3b2wbplwylzraxs4wtz7dd5lzdsc2dq.b32.i2p/a

http://trackfmu3by6nhkibnw5exyhibjrvxl6k3e4y54wmjy4bvqgs3ha.b32.i2p/a

http://osx3x3b4fzvxb5obsasp444ap7hxloyrfpsn76g3ohzdfdist4sq.b32.i2p/announce

http://a2n2ydkcefh3ab4hbhdftmzt5xf2sg62vjainr5ua3sqqf67yarq.b32.i2p/a

http://svece3bxv4vqlt2zuut5ww4ztkwunfcnab55pmnjjb6zfei3noha.b32.i2p/a

http://punzipidirfqspstvzpj6gb4tkuykqp6quurj6e23bgxcxhdoe7q.b32.i2p/announce

http://btrackrqkjp6kgelov5a3uxisis77ofxqt5nvy5hvvtoybjpmq4q.b32.i2p/announce
```

https://docs.i2pd.website/en/latest/tutorials/Filesharing/Software/

# Enjoy!

That should be it.