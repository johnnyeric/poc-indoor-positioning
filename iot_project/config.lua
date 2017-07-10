local module = {}

module.SSID = {}
module.SSID["AP1"] = "********"
module.SSID["AP2"] = "********"
module.SSID["AP3"] = "********"

--module.HOST = "io.adafruit.com"
module.HOST = "m10.cloudmqtt.com"
--module.PORT = 1883
module.PORT = 15142
module.ID = node.chipid()
module.adafruit = {}
module.adafruit.USERNAME = "*********"
module.adafruit.KEY = "********************"

module.ENDPOINT = module.adafruit.USERNAME.."/"
return module
