# PoC for Indoor Positioning using Machine Learning, Node.js Backend and React Frontend

## Purpose

This project was made as part of a discipline taken on a Computer Science Master's Degree program. The objective of this Proof of Concept was to 
demonstrate the usage of WIFI signals to create fingerprints and then estimate the location of the device by using machine learning algorithms.

## Project iot_project

IoT Button code written in Lua for the nodemcu firmware installed on a ESP8266 chip (ESP-01 model).

## poc-iot-api

Node.js API responsible for the location feature via the KNN algorithm and the communication between the MQTT broker and the React frontend via Websockets.

It serves the ``build`` folder which was generated from the poc-iot-web project.

## Project  poc-iot-web

React project created with create-react-app to manage the creation of the radiomap of WIFI signals fingerprints and view the discovery of location by pressing the button on the device.

## Requirements

Node.js
RethinkDB instance.

### Project written in cloud9:
If running on c9.io it is required to start the database with the attribute bind all:
rethinkdb --bind all --http-port $PORT