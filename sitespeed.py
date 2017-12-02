from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from subprocess import call
from browsermobproxy import Server
import json
import os
import base64
import subprocess

profile = webdriver.FirefoxProfile()
server = Server("/opt/browsermob-proxy/bin/browsermob-proxy")
server.start()
proxy = server.create_proxy()
profile.set_proxy(proxy.selenium_proxy())
driver = webdriver.Firefox(firefox_profile=profile)

proxy.new_har("http://www.python.org", options={'captureHeaders': True})
driver.get("http://www.python.org")

result = json.dumps(proxy.har, ensure_ascii=False)
file = open("/tmp/test.har","w")
file.write(result)
encoded_har = base64.b64encode(result)
file.close()
output = subprocess.Popen(["/usr/bin/wine", "/var/www/har_to_pagespeed.exe", "/tmp/test.har"], stdout=subprocess.PIPE ).communicate()[0]
output.split("\n")
os.remove("/tmp/test.har")
driver.get_screenshot_as_file('/tmp/test.png')
call(["/usr/bin/convert", "-thumbnail", "280x230^", "-gravity", "North", "-extent", "280x230", "/tmp/test.png", "/tmp/test2.png"])
os.remove("/tmp/test.png")
call(["/usr/bin/pngquant", "/tmp/test2.png"])
os.remove("/tmp/test2.png")
with open("/tmp/test2-fs8.png", "rb") as image_file:
    encoded_image = base64.b64encode(image_file.read())
os.remove("/tmp/test2-fs8.png")
server.stop()


navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
domComplete = driver.execute_script("return window.performance.timing.domComplete")

timetoload = domComplete - navigationStart

returnvar = { "har" : encoded_har, "pagespeed" : output, "thumbnail" : encoded_image, "timetoload" : timetoload }

print json.dumps(returnvar)

driver.close()