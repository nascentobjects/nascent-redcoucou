## Installation
Copy the contents of this repo to **/usr/lib/node_modules/nascent-wifisetup** on your main module.

To install dependencies:
```
cd /usr/lib/node_modules/nascent-wifisetup
npm install
```

SSH into main module and do the following:
```
cp nascent-wifisetup.service /lib/systemd/system
systemctl enable nascent-wifisetup
systemctl start nascent-wifisetup
```

Your system should now be running the nascent-wifisetup service and it should run on boot.

If you want to manually run the service instead of relying on systemd:
```
systemctl stop nascent-wifisetup
cd /usr/lib/node_modules/nascentw-wifisetup
./run.sh
```


