const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

var ip = require("ip");
const ipSubscriptions = ip.address();

const ipAPI = 'http://localhost:8080'

app.listen(4000, () => {
  console.log('Servidor rodando na porta 4000...')
});

app.use(bodyParser.json());

app.post('/flash', (req, res) => {
  var cmd = req.body.flash;
  console.log("====> " + cmd);

  var bodyRequest = '{"actionType": "update","entities": [{"type": "Plant","id": "urn:ngsi-ld:Plant:001",'+JSON.stringify(cmd)+': {"type": "command","value": ""}}]}';

  try {
    axios.post('http://localhost:1026/v2/op/update', JSON.parse(bodyRequest), {
        headers: {
          'fiware-service': 'openiot',
          'fiware-servicepath': '/',
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(error)
  }
});

app.post('/hourly', (req, res) => {

  var hourlys = req.body.data;
  var valueCmd = "";
  for (var i = 0; i < hourlys.length; i++) {
    valueCmd += JSON.stringify(hourlys[i].start) + "-" + hourlys[i].end + " ";
  }
  console.log("====> " + valueCmd);
  try {
    axios.post('http://localhost:1026/v2/op/update', {
      "actionType": "update",
      "entities": [
        {
          "type": "Plant",
          "id": "urn:ngsi-ld:Plant:001",
          "hourly": {
            "type": "command",
            "value": valueCmd
          }
        }
      ]
    }, {
        headers: {
          'fiware-service': 'openiot',
          'fiware-servicepath': '/',
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error(error)
  }

});

app.post('/temperature', (req, res) => {
  var temperature = req.body.data[0].temperature.value;
	console.log("temperatura: " + temperature);
	if(temperature != " " && temperature != "nan"){
		console.log("enviando->temperatura: " + temperature);
		var tempo = new Date();
		var idSeg = (tempo.getHours() * 3600) + (tempo.getMinutes() * 60) + (tempo.getSeconds()) + 1;
		var dados = {
		  id: idSeg,
		  value: parseFloat(temperature),
		  timestamp: tempo.getTime()
		}

		try {
		  axios.put(ipAPI+'/sysmartplant/v1/temperature/'+idSeg, dados)
		} catch (error) {
		  console.error(error)
		}
	}
		res.send("OK");
});

app.post('/humidity', (req, res) => {
  var humidity = req.body.data[0].humidity.value;
	console.log("umidade: " + humidity);
	if(humidity != " " && humidity != "nan"){
		console.log("enviando->umidade: " + humidity);
		var tempo = new Date();
		var idSeg = (tempo.getHours() * 3600) + (tempo.getMinutes() * 60) + (tempo.getSeconds()) + 1;
		var dados = {
		  id: idSeg,
		  value: parseFloat(humidity),
		  timestamp: tempo.getTime()
		}

		try {
		  axios.put(ipAPI+'/sysmartplant/v1/humidity/'+idSeg, dados)
		} catch (error) {
		  console.error(error)
		}
	}
  res.send("OK");
})


try {
  axios.post('http://localhost:4041/iot/services', {
    "services": [
      {
        "apikey": "4jggokgpepnvsb2uv4s40d59ov",
        "cbroker": "http://orion:1026",
        "entity_type": "Thing",
        "resource": ""
      }
    ]
  }, {
      headers: {
        'fiware-service': 'openiot',
        'fiware-servicepath': '/',
        'Content-Type': 'application/json'
      }
    }
  )
} catch (error) {
  console.error(error)
}


try {
  axios.post('http://localhost:4041/iot/devices', {
    "devices": [
      {
        "device_id": "plant001",
        "entity_name": "urn:ngsi-ld:Plant:001",
        "entity_type": "Plant",
        "protocol": "PDI-IoTA-UltraLight",
        "transport": "MQTT",
        "timezone": "America/Fortaleza",
        "attributes": [
          { "object_id": "t", "name": "temperature", "type": "Float" },
          { "object_id": "h", "name": "humidity", "type": "Float" }
        ],
        "commands": [
          { "name": "hourly", "type": "command" },
          { "name": "flashOn", "type": "command" },
          { "name": "flashOff", "type": "command" }
        ]
      }
    ]
  }, {
      headers: {
        'fiware-service': 'openiot',
        'fiware-servicepath': '/',
        'Content-Type': 'application/json'
      }
    }
  )
} catch (error) {
  console.error(error)
}


try {
  axios.post('http://localhost:1026/v2/subscriptions', {
    "description": "Temperature Subscription",
    "subject": {
      "entities": [{ "id": "urn:ngsi-ld:Plant:001", "type": "Plant" }],
      "condition": {
        "attrs": ["temperature"]
      }
    },
    "notification": {
      "http": {
        "url": "http://" + ipSubscriptions + ":4000/temperature"
      },
      "attrs": ["temperature"]
    },
    "throttling": 0
  }, {
      headers: {
        'fiware-service': 'openiot',
        'fiware-servicepath': '/',
        'Content-Type': 'application/json'
      }
    }
  )
} catch (error) {
  console.error(error)
}


try {
  axios.post('http://localhost:1026/v2/subscriptions', {
    "description": "Humidity Subscription",
    "subject": {
      "entities": [{ "id": "urn:ngsi-ld:Plant:001", "type": "Plant" }],
      "condition": {
        "attrs": ["humidity"]
      }
    },
    "notification": {
      "http": {
        "url": "http://" + ipSubscriptions + ":4000/humidity"
      },
      "attrs": ["humidity"]
    },
    "throttling": 0
  }, {
      headers: {
        'fiware-service': 'openiot',
        'fiware-servicepath': '/',
        'Content-Type': 'application/json'
      }
    }
  )
} catch (error) {
  console.error(error)
}








