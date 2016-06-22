#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

systemctl disable bluetooth
sleep 1
rfkill unblock bluetooth
sleep 1

cd $DIR
export BLENO_DEVICE_NAME=NascentWifi
echo $BLENO_DEVICE_NAME
LD_LIBRARY_PATH=$DIR/lib node index.js 

