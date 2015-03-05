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
  function NPNode(n) {
    RED.nodes.createNode(this,n);
    this.title = n.title || "";
    this.source = n.source || "";
    this.message = n.message || "";
    this.priority =  Number( n.priority || 0);
    this.apikey = n.apikey || undefined;
    this.registrationId = n.registrationId || undefined;
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
      var url = msg.url || node.url || null;
      var image1 = msg.image1 || node.image1 || null;
      var image2 = msg.image2 || node.image2 || null;
      var image3 = msg.image3 || node.image3 || null;
      var image4 = msg.image4 || node.image4 || null;
      var image5 = msg.image5 || node.image5 || null;
      var speak = msg.speak || node.speak || -1;
      var nocache = msg.nocache || node.nocache || -1;
      var notify = msg.notify || node.notify || -1;
      
      if (apikey == undefined || registrationId == undefined || title == undefined) {
        node.error("No APIkey, registrationId or title set"); 
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
        sendMessage(message2Send, apikey, registrationId, function (err, data) {
          if (err) {
            node.warn("NP error: " + err);
          }
        });
      }
    });
  }
  RED.nodes.registerType("npro",NPNode);
};

var Constants = {
  'GCM_SEND_ENDPOINT' : 'android.googleapis.com',
  'GCM_SEND_ENDPATH' : '/gcm/send',
  'GCM_SEND_URI' : 'https://android.googleapis.com/gcm/send',
  'PARAM_REGISTRATION_ID' : 'registration_id',
  'PARAM_COLLAPSE_KEY' : 'collapse_key',
  'PARAM_DELAY_WHILE_IDLE' : 'delay_while_idle',
  'PARAM_PAYLOAD_KEY' : 'data',
  'PARAM_TIME_TO_LIVE' : 'time_to_live',
  'ERROR_QUOTA_EXCEEDED' : 'QuotaExceeded',
  'ERROR_DEVICE_QUOTA_EXCEEDED' : 'DeviceQuotaExceeded',
  'ERROR_MISSING_REGISTRATION' : 'MissingRegistration',
  'ERROR_INVALID_REGISTRATION' : 'InvalidRegistration',
  'ERROR_MISMATCH_SENDER_ID' : 'MismatchSenderId',
  'ERROR_NOT_REGISTERED' : 'NotRegistered',
  'ERROR_MESSAGE_TOO_BIG' : 'MessageTooBig',
  'ERROR_MISSING_COLLAPSE_KEY' : 'MissingCollapseKey',
  'ERROR_UNAVAILABLE' : 'Unavailable',
  'TOKEN_MESSAGE_ID' : 'id',
  'TOKEN_CANONICAL_REG_ID' : 'registration_id',
  'TOKEN_ERROR' : 'Error',
  'JSON_REGISTRATION_IDS' : 'registration_ids',
  'JSON_PAYLOAD' : 'data',
  'JSON_SUCCESS' : 'success',
  'JSON_FAILURE' : 'failure',
  'JSON_CANONICAL_IDS' : 'canonical_ids',
  'JSON_MULTICAST_ID' : 'multicast_id',
  'JSON_RESULTS' : 'results',
  'JSON_ERROR' : 'error',
  'JSON_MESSAGE_ID' : 'message_id',
  'UTF8' : 'UTF-8',
  'BACKOFF_INITIAL_DELAY' : 1000,
  'MAX_BACKOFF_DELAY' : 1024000  ,
  'SOCKET_TIMEOUT' : 180000 //three minutes
};

var req = require('request');
function sendMessage(message, senderKey, registrationId, callback) {
  var body = {};
  var requestBody;
  var post_options;
  var post_req;
  var timeout;
  var registrationIds = [];
  registrationIds.push(registrationId);
  if (message.data === undefined) {
    return callback(-1, 'message.data must be defined');
  }

  if (message.data.timestamp === undefined) {
    var now = new Date();
    var timestampSplit = now.toISOString().split('.'); 
    message.data.timestamp = timestampSplit[0];
  }
  body[Constants.PARAM_PAYLOAD_KEY] = message.data;
  body[Constants.JSON_REGISTRATION_IDS] = registrationIds;
  requestBody = JSON.stringify(body);

  post_options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-length': Buffer.byteLength(requestBody, 'utf8'),
      'Authorization': 'key=' + senderKey
    },
    uri: Constants.GCM_SEND_URI,
    body: requestBody
  };

  timeout = Constants.SOCKET_TIMEOUT;

  post_options.timeout = timeout;

  post_req = req(post_options, function (err, res, resBody) {
    if (err) {
      return callback(err, null);
    }
    if (!res) {
      return callback('response is null', null);
    }
    if (res.statusCode === 503) {
      console.log('GCM service is unavailable');
      return callback(res.statusCode, null);
    } else {
      if(res.statusCode == 401) {
        console.log('Unauthorized');
        return callback(res.statusCode, null);
      } else {
        if (res.statusCode !== 200) {
          console.log('Invalid request: ' + res.statusCode);
          return callback(res.statusCode, null);
        }
      }
    }

    // Make sure that we don't crash in case something goes wrong while
    // handling the response.
    try {
      var data = JSON.parse(resBody);
      callback(null, data);
    } catch (e) {
      console.log("Error handling GCM response " + e);
      return callback("error", null);
    }
  });
}
