/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */
var iwconfig = require('wireless-tools/iwconfig');
var wpa_supplicant = require('./wpa-supplicant');
var child_process = require('child_process');
var DataSync = require('nascent-datasync');

var dataSync = new DataSync({
    id: 'com.nascentobjects.NascentWifi',
    verbose: false
});

// handle wireless settings
dataSync.on('connect_wifi', function(connectInfo) {
    wpa_supplicant.enable({
        ssid: connectInfo.ssid,
        password: connectInfo.password,
        driver: 'nl80211'
    }, function(err, stdout, stderr) {
    });
});

var lastSSID = '';
var lastQuality = -1;

function characterizeQuality(quality) {
    quality = parseInt(quality) || 0;
    if (quality <= 0) {
        return 'disconnected';
    }
    if (quality < 50) {
        return 'bad';
    }
    return 'good';
}

function getIp(cb) {
    try {
        child_process.exec('ifconfig | grep wlan0 -A 1 | tail -n 1 | cut -d: -f2 | cut -d\' \' -f 1', function(err, stdout, stderr) {
            cb(stdout.trim());
        });
    } catch (e) {
        cb('');
    }
}

function sendWifi(force) {
    if (force) {
        lastSSID = '';
    }

    iwconfig.status('wlan0', function(err, status) {
        if (err) {
            return;
        }

        var ssid = status['ssid'];
        var quality = '' + parseInt((status['quality'] * 100 / 70).toFixed(0)) || 0;
        getIp(function(ip) {
            if (ssid !== lastSSID || characterizeQuality(lastQuality) !== characterizeQuality(quality)) {
                console.log('Sending Wifi Signal: ', ssid, quality, ip);
                dataSync.sendEvent('wificonn', {
                    ssid: ssid,
                    quality: quality,
                    ip: ip
                });
                lastSSID = ssid;
                lastQuality = quality;
            }
        });
    });
}

setInterval(function() {
    sendWifi();
}, 500);

dataSync.on('needwifi', function() {
    sendWifi(true);
});
