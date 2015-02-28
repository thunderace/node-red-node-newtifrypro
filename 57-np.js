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
        this.title = n.title;
        this.source = n.source || "";
        this.msg = n.message || "";
        this.priority = n.priority || 0;
        var credentials = this.credentials;
        if ((credentials) && (credentials.hasOwnProperty("apikey")) && (credentials.hasOwnProperty("registrationId"))) { 
          this.apikey = credentials.apikey; 
          this.registrationId = credentials.registrationId; 
        } else { 
          this.error("No API key or registrationId set"); 
        }
		if (this.title == "") {
          this.error("No Title key set"); 
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
          sendMessage(message, node.apikey, node.registrationId, function (err, data) {
	          if (err) {
              node.warn("NP error: " + err);
	          }
          });            
        });
    }

    RED.nodes.registerType("npro",NPNode, {
        credentials: {
            apikey: {type: "password"},
            registrationId: { type: "string"}
        }
    });
}

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


function NewtifryProMessage() {
    if((this instanceof NewtifryProMessage) === false) {
        return new NewtifryProMessage();
    }
	this.images = [];    
	this.url = null;
	this.registrationIds = [];
	this.date = null;
	this.message = null;
	this.priority = 0;
	this.title = null;
	this.source = null;
	this.speak = -1;
	this.noCache = -1;
	this.notify = -1;
	this.senderId = null;
	this.state = 0;
}

NewtifryProMessage.prototype.send = function(callback) {
    var body = {};
    var requestBody;
    var post_options;
    var post_req;
    var timeout;
    var data = {};

	if (this.title === null) {
		return;
	}
	if ( this.date instanceof Date === false) {
		this.date = new Date();
	}

	data.type = 'ntp_message';
	data.timestamp = this.date.toISOString().split('.')[0];
	data.title = new Buffer(this.title).toString('base64');
	data.message = new Buffer(this.message).toString('base64');

	if (this.source) {
		data.source = new Buffer(this.source).toString('base64');
	}
	if (this.url) {
		data.url = new Buffer(this.url).toString('base64');
	}
	if (this.images.length !== 0) {
		if (this.images.length == 1 ) {
			data.image = new Buffer(this.image[0]).toString('base64');		
		} else {
			if (this.image[0] !== null) {
				data.image1 = new Buffer(this.image[0]).toString('base64');		
			}
			if (this.image[1] !== null) {
				data.image2 = new Buffer(this.image[1]).toString('base64');		
			}
			if (this.image[2] !== null) {
				data.image3 = new Buffer(this.image[2]).toString('base64');		
			}
			if (this.image[3] !== null) {
				data.image4 = new Buffer(this.image[3]).toString('base64');		
			}
			if (this.image[4] !== null) {
				data.image5 = new Buffer(this.image[4]).toString('base64');		
			}
		}
	}
	if (this.notify != -1) {
		data.notify = this.notify;
	}
	if (this.noCache != -1) {
		data.noCache = this.noCache;
	}
	if (this.speak != -1) {
		data.speak = this.speak;
	}

	if (this.state !== 0) {
		data.state = this.state;
	}

	body[Constants.PARAM_PAYLOAD_KEY] = data;


    body[Constants.JSON_REGISTRATION_IDS] = this.registrationIds;
    requestBody = JSON.stringify(body);

    post_options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-length': Buffer.byteLength(requestBody, 'utf8'),
            'Authorization': 'key=' + this.senderId
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

        if (!res)
            return callback('response is null', null);

        if (res.statusCode === 503) {
            console.log('GCM service is unavailable');
            return callback(res.statusCode, null);
        } else if(res.statusCode == 401){
            console.log('Unauthorized');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            console.log('Invalid request: ' + res.statusCode);
            return callback(res.statusCode, null);
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

};

NewtifryProMessage.prototype.setSenderId = function(senderId) {
	this.senderId = senderId;
};


NewtifryProMessage.prototype.addImage = function(imageUrl) {
	this.images.push(imageUrl);
};

NewtifryProMessage.prototype.setUrl = function(url) {
	this.url = url;
};

NewtifryProMessage.prototype.setMessage = function(message) {
	this.message = message;
};

NewtifryProMessage.prototype.setTitle = function(title) {
	this.title = title;
};

NewtifryProMessage.prototype.setSource = function(source) {
	this.source = source;
};

NewtifryProMessage.prototype.setDate = function(date) {
	this.date = date;
};

NewtifryProMessage.prototype.setSticky = function() {
	this.state = 1;
};

NewtifryProMessage.prototype.setLocked = function() {
	this.state = 2;
};


NewtifryProMessage.prototype.setNormalPriority = function() {
	this.priority = 0;
};

NewtifryProMessage.prototype.setInfoPriority = function() {
	this.priority = 1;
};

NewtifryProMessage.prototype.setWarningPriority = function() {
	this.priority = 2;
};

NewtifryProMessage.prototype.setAlertPriority = function() {
	this.priority = 3;
};

NewtifryProMessage.prototype.speak = function() {
	this.speak = 1;
};

NewtifryProMessage.prototype.noSpeak = function() {
	this.speak = 0;
};

NewtifryProMessage.prototype.cacheImages = function() {
	this.cache = 1;
};

NewtifryProMessage.prototype.noCacheImage = function() {
	this.cache = 0;
};

NewtifryProMessage.prototype.notify = function() {
	this.notify = 1;
};

NewtifryProMessage.prototype.noNotify = function() {
	this.notify = 0;
};

NewtifryProMessage.prototype.addRegistrationId = function(regId) {
	this.registrationIds.push(regId);
};

function sendMessage(message, senderKey, registrationIds, callback) {
    var body = {};
    var requestBody;
    var post_options;
    var post_req;
    var timeout;

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

        if (err)
            return callback(err, null);

        if (!res)
            return callback('response is null', null);

        if (res.statusCode === 503) {
            console.log('GCM service is unavailable');
            return callback(res.statusCode, null);
        } else if(res.statusCode == 401){
            console.log('Unauthorized');
            return callback(res.statusCode, null);
        } else if (res.statusCode !== 200) {
            console.log('Invalid request: ' + res.statusCode);
            return callback(res.statusCode, null);
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

