from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from subprocess import call
from browsermobproxy import Server
import json
import os
import base64
import subprocess
import string
import random

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

token = id_generator()

profile = webdriver.FirefoxProfile()
server = Server("/opt/browsermob-proxy/bin/browsermob-proxy")
server.start()
proxy = server.create_proxy()
profile.set_proxy(proxy.selenium_proxy())
driver = webdriver.Firefox(firefox_profile=profile)

proxy.new_har("test", options={'captureHeaders': True})
driver.get("http://www.python.org")

result = json.dumps(proxy.har, ensure_ascii=False)
file = open("/tmp/test" + token + ".har","w")
file.write(result)
encoded_har = base64.b64encode(result)
file.close()
devnull = open(os.devnull, 'wb')
output = subprocess.Popen(["/usr/bin/wine", "/var/www/har_to_pagespeed.exe", "/tmp/test" + token + ".har"], stdout=subprocess.PIPE, stderr=devnull ).communicate()[0]
output.split("\n")
os.remove("/tmp/test" + token + ".har")
driver.get_screenshot_as_file("/tmp/test" + token + ".png")
call(["/usr/bin/convert", "-thumbnail", "280x230^", "-gravity", "North", "-extent", "280x230", "/tmp/test" + token + ".png", "/tmp/test2" + token + ".png"])
os.remove("/tmp/test" + token + ".png")
call(["/usr/bin/pngquant", "/tmp/test2" + token + ".png"])
os.remove("/tmp/test2" + token + ".png")
with open("/tmp/test2" + token + "-fs8.png", "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read())
os.remove("/tmp/test2" + token + "-fs8.png")
server.stop()

navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
domComplete = driver.execute_script("return window.performance.timing.domComplete")

timetoload = domComplete - navigationStart

returnvar = { "har" : encoded_har, "pagespeed" : output, "thumbnail" : encoded_image, "timetoload" : timetoload }

print json.dumps(returnvar)

driver.quit()
