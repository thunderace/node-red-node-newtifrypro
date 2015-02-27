# node-red-node-newtifrypro

A <a href="http://nodered.org" target="_new">Node-RED</a> node to send messages via <a href="https://play.google.com/store/apps/details?id=com.newtifry.pro">NewtifryPro</a>.

Install
-------

Run the following command in the root directory of your Node-RED install (Not yet : work in progress)

    npm install node-red-node-newtifrypro


Usage
-----

Uses NewtifryPro (NP) to push the **msg.message** and **msg.title** to an Android device that has NewtifryPro Android app installed.

Optionally uses **msg.source** to set the source, if not already set in the properties.

The API-key is stored in a separate credentials file.
