/*
 * Copyright (c) 2015-2016, Nascent Objects Inc
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright 
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright 
 *    notice, this list of conditions and the following disclaimer in 
 *    the documentation and/or other materials provided with the 
 *    distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its 
 *    contributors may be used to endorse or promote products derived 
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN 
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
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
