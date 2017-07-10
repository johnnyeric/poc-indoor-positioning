LED_PIN = 4

gpio.mode(LED_PIN, gpio.INPUT)
--value = true

tmr.alarm(0, 500, 1, function ()
    --gpio.write(LED_PIN, value and gpio.HIGH or gpio.LOW)
    --value = not value

    v = gpio.read(LED_PIN)
    print(v)
end)