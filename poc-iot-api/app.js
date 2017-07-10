const config = {}
//config.HOST = "io.adafruit.com"
config.HOST = "m10.cloudmqtt.com"
//config.PORT = 1883
config.PORT = 15142
config.adafruit = {}
config.adafruit.USERNAME = "******"
config.adafruit.KEY = "*******"
config.ENDPOINT = config.adafruit.USERNAME + "/"

const express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cors = require('cors'),
	path = require('path'),
    bodyParser = require('body-parser'),
    r = require('rethinkdbdash')(),
    mqtt = require('mqtt'),
    _ = require('lodash'),
	math = require('mathjs'),
	knn = require('./knn');


let PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

const MODE_MAP = "0";
const MODE_DISCOVERY = "1";
let place = 'place1';
let mode = MODE_MAP;

//knn
let distances = [];

//neeed to setup initial after dump - set places, mode

app.use('/', express.static(path.join(__dirname, 'build')));

app.post('/reset', (req,res) => {
    r.db('IoT').table('radiomap').delete().run().then(() => {
        res.send("Reset done");
    })
})

app.get('/list', (req,res) => {
    r.db('IoT').table('radiomap').run().then(result => {
        res.status(200).json(result).end();
    });
})


io.on('connection', socket => {
    const client = mqtt.connect({host: config.HOST, 
                            port: config.PORT, 
                            username: config.adafruit.USERNAME, 
                            password: config.adafruit.KEY })
                            
    client.publish(config.ENDPOINT + 'feeds/poc-button-place', 'place1', {qos: 1, retain: true}) 
    client.publish(config.ENDPOINT + 'feeds/poc-button-mode', mode, {qos: 1, retain: true})  

    r.db('IoT').table('radiomap').run().then(result => {
        socket.emit('fillList', result)
    });     

    let i = 0;
    client.on('message', (topic, message) => {
        console.log(topic)
        switch(topic) {
            case config.ENDPOINT + 'feeds/poc-button-state':
                console.log('received state: ',message.toString())
                socket.emit('button', message.toString());
                break;
            case config.ENDPOINT + 'feeds/poc-button-aps':
                if (MODE_MAP == mode) {
                    console.log(i++, socket.id)
                    if (message) {
                        console.log('received aps: ',message.toString())
                        r.db('IoT').table('radiomap').insert({place: place || 'place1', rss_values: JSON.parse(message.toString()) }).run();
                        socket.emit('aps', message.toString());
                    }
                    
                } else if (MODE_DISCOVERY == mode) {
                    let label = 'test';
                    let rssValues = JSON.parse(message.toString());
                    let features = _.keys(rssValues);

                    let X = [];
					let Y = [];
					let x = [];	
					//transform test sample to multidimensional array to use with libs
					x[0] = []	
					features.map( (feature, i) => {
						x[0][i] = rssValues[feature];
					});	
                    r.db('IoT').table('radiomap').run().then(result => {
                        result.map((row, i) => {
							X[i] = [];
							features.map((feature,j) => {
								X[i][j] = row.rss_values[feature] || -100;
							})
							Y[i] = row.place;
						})

						console.log(X)
						console.log(Y)
						console.log(x)

						let knnResult = knn(X,x);

						console.log(X);
						console.log(knnResult.indexes);

						_.each(knnResult.indexes,function(idxVal,i){
							console.log(Y[idxVal] + ' dist: '+knnResult.distances[idxVal]);
						})
						

						//apply knn
						console.log('discovery');
						socket.emit('discovery', {label: Y[knnResult.indexes[0]], rss_values: JSON.parse(message.toString()) })
                    }); 

                    
                }
                break;
            case config.ENDPOINT + 'feeds/poc-button-place':
                place = message.toString();
                socket.emit('place', place)
                break;
            case config.ENDPOINT + 'feeds/poc-button-mode':
                mode = message.toString();
                console.log('mode:',mode)
                //check how to read integer from buffer
                socket.emit('mode', MODE_DISCOVERY == mode? 'discovery' : 'mapping' )
                break;
            default: 
                break;
        }
    })

    client.subscribe(config.ENDPOINT + 'feeds/poc-button-state')
    client.subscribe(config.ENDPOINT + 'feeds/poc-button-aps')
    client.subscribe(config.ENDPOINT + 'feeds/poc-button-place')
    client.subscribe(config.ENDPOINT + 'feeds/poc-button-mode')

    socket.on('change_place', place => {
        console.log('change_place: ', place)
        client.publish(config.ENDPOINT + 'feeds/poc-button-place', place, {qos: 1, retain: true})
    })
    
    socket.on('toggle_mode', (mode) => {
        client.publish(config.ENDPOINT + 'feeds/poc-button-mode', mode, {qos: 1, retain: false})
    })

    socket.on('disconnect', () => {
        client.end();
    })
    
})


server.listen(PORT);
