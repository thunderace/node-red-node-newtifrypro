/**
 * Copyright 2014 thunderace
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var nma = require('node-newtifrypro');

    function NPNode(n) {
        RED.nodes.createNode(this,n);
        this.title = n.title;
        this.source = msg.source||"";
        this.msg = n.msg || "";
        this.priority = n.priority || 0;
        var credentials = this.credentials;
        if ((credentials) && (credentials.hasOwnProperty("apikey"))) { 
          this.apikey = credentials.apikey; 
        } else { 
          this.error("No API key set"); 
        }

        var node = this;
        this.on("input",function(msg) {
          var message = {  
            data: {
              type: 'ntp_message',
  		        message: new Buffer(this.msg).toString('base64'),
  		        priority:	this.priority,
  		        title: new Buffer(this.title).toString('base64'),
  		        source: new Buffer(this.source).toString('base64')
            }
          };
          newtifryPro.sendMessage(message, node.apikey, registrationIds, function (err, data) {
	          if (err) {
              node.warn("NP error: " + er);
	          }
          });            
            else {
                node.warn("NMA credentials not set.");
            }
        });
    }

    RED.nodes.registerType("np",NPNode, {
        credentials: {
            apikey: {type: "password"},
            registrationId: { type: "string"}
        }
    });
}
