/*
 * @author Andrew Robberts <andrew@nascentobjects.com>
 * @copyright 2015-2016 Nascent Objects Inc. All rights reserved.
 */
'use strict';

var fs = require('fs-extra');
var child_process = require('child_process');

var wpa_supplicant = module.exports = {
  enable: enable,
  exec: child_process.exec
};

function enable(options, callback) {
  var baseFile = './wpa_supplicant.conf.nascent';
  var file = '/etc/wpa_supplicant/wpa_supplicant.conf';

  fs.copySync(baseFile, file);

  var command = 'echo -e "network={\nssid=\\\"' + options.ssid + '\\\"\npsk=\\\"' + options.password + '\\\"\npriority=50\n}" >> ' 
        + file + ' && systemctl restart wpa_supplicant; sync';

  if (!options.password || options.password === '') {
      command = 'echo -e "network={\nssid=\\\"' + options.ssid + '\\\"\nproto=RSN\nkey_mgmt=NONE\npriority=50\n}" >> ' 
        + file + ' && systemctl restart wpa_supplicant; sync';
  }

  return this.exec(command, callback);  
}
