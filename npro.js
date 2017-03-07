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
var newtifrypro = require('newtifrypro');

module.exports = function(RED) {
  "use strict";
  function NPNode(n) {
    RED.nodes.createNode(this,n);
    this.title = n.title || "";
    this.source = n.source || "";
    this.message = n.message || "";
    this.priority =  Number( n.priority || 0);
    this.apikey = n.apikey || undefined;
    this.registrationId = n.registrationId || undefined;
    this.topic = n.topic || undefined;
    this.image1 = n.image1 || undefined;
    this.image2 = n.image2 || undefined;
    this.image3 = n.image3 || undefined;
    this.image4 = n.image4 || undefined;
    this.image5 = n.image5 || undefined;
    this.url = n.url || undefined;
    this.speak = n.speak || -1;
    this.nocache = n.nocache || -1;
    this.notify = n.notify || -1;
    var node = this;
    this.on("input",function(msg) {
      var message = msg.message || node.message || "";
      var title = msg.title || node.title || "";
      var priority = msg.priority || node.priority || 0;
      var source = msg.source || node.source || 0;
      var apikey = msg.apikey || node.apikey || undefined;
      var registrationId = msg.registrationId || node.registrationId || undefined;
      var topic = msg.topic || node.topic || undefined;
      var url = msg.url || node.url || null;
      var image1 = msg.image1 || node.image1 || null;
      var image2 = msg.image2 || node.image2 || null;
      var image3 = msg.image3 || node.image3 || null;
      var image4 = msg.image4 || node.image4 || null;
      var image5 = msg.image5 || node.image5 || null;
      var speak = msg.speak || node.speak || -1;
      var nocache = msg.nocache || node.nocache || -1;
      var notify = msg.notify || node.notify || -1;
      
      if (apikey == undefined || (registrationId == undefined && topic == undefined) || title == undefined) {
        node.error("No APIkey, registrationId or topic or title set"); 
      } else {
        var message2Send = {
          data: {
            type: 'ntp_message',
            title: new Buffer(title).toString('base64'),
            priority:  priority,
            speak: speak,
            nocache: nocache,
            notify: notify
          }
        };  
        if (message != null) {
          message2Send.data.message = new Buffer(message).toString('base64');
        }
        if (source != null) {
          message2Send.data.source = new Buffer(source).toString('base64');
        }
        if (url != null) {
          message2Send.data.url = new Buffer(url).toString('base64');
        }
        if (image1 != null) {
          message2Send.data.image1 = new Buffer(image1).toString('base64');
        }
        if (image2 != null) {
          message2Send.data.image2 = new Buffer(image2).toString('base64');
        }
        if (image3 != null) {
          message2Send.data.image3 = new Buffer(image3).toString('base64');
        }
        if (image4 != null) {
          message2Send.data.image4 = new Buffer(image4).toString('base64');
        }
        if (image5 != null) {
          message2Send.data.image5 = new Buffer(image5).toString('base64');
        }
        if (registrationId == undefined) {
          newtifrypro.sendMessageToTopic(message2Send, apikey, topic, function (err, data) {
            if (err) {
              node.warn("NPTopic error: " + err);
            } 
          });
        } else {
          var registrationIdsArray = [registrationId];
          registrationIdsArray.push();
          newtifrypro.sendMessage(message2Send, apikey, registrationIdsArray, function (err, data) {
            if (err) {
              node.warn("NP error: " + err);
            } 
          });
        }
      }
    });
  }
  RED.nodes.registerType("npro",NPNode);
};

