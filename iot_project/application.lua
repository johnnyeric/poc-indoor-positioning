local module = {}
m = nil
done = false
buttonPin = 4 -- this is ESP-01 pin GPIO02
gpio.mode(buttonPin,gpio.INT,gpio.PULLUP)
local aps = {}

function debounce (func)
    local last = 0
    local delay = 100000

    return function (...)
        local now = tmr.now()
        if now - last < delay then return end

        last = now
        return func(...)
    end
end

function listap(t)
    aps = {}
    for k,v in pairs(t) do
        local ssid, rssi, authmode, channel = string.match(v, "([^,]+),([^,]+),([^,]+),([^,]*)")
        --print(k.." : "..rssi)
        aps[k] = rssi
    end
    --print(aps)
    if m ~= nil then 
        local pretty_json_text = json.stringify(aps)
        print(pretty_json_text)
        m:publish(config.ENDPOINT .. "feeds/poc-button-aps", pretty_json_text, 2, 0)
    end
end

function onChange()
    if gpio.read(buttonPin) == 0 and done == false then
        print("Button was pushed! ") 
        wifi.sta.getap(listap)
        done = true
    else
        done = false
    end
end

gpio.trig(buttonPin,"down", debounce(onChange))

local function mqtt_start()
  m = mqtt.Client(config.ID, 120, config.adafruit.USERNAME, config.adafruit.KEY)
  m:lwt(config.ENDPOINT .. "feeds/poc-button-state", "offline", 1, 1)
  
  m:on('offline', function(client, topic, message) 
    --m:publish(config.ENDPOINT .. "feeds/poc-button-state", 'offline', 1, 1)
  end)
  
  m:connect(config.HOST, config.PORT, 0, 1, 1, function(conn)

    print("connected",config.HOST)
    m:publish(config.ENDPOINT .. "feeds/poc-button-state", 'online', 1, 0)

  end,
  function (client, reason) 
    print(reason)
    print(client)
  end)
end

function module.start()
  mqtt_start()
end

return module
