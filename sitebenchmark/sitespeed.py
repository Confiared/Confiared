#!/usr/bin/env python

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from subprocess import call
from browsermobproxy import Server
#from selenium.webdriver.firefox.firefox_binary import FirefoxBinary
import json
import os
import base64
import subprocess
import string
import random
import sys

if len(sys.argv) != 2:
    sys.stderr.write('Usage: sys.argv[0] http://www.site.com or https://www.site.com')
    sys.exit(1)

site = sys.argv[1]

if not site.startswith( 'http://' ) and not site.startswith( 'https://' ):
    sys.stdout.write('Usage: http://sitespeed.confiared.com/cgi-bin/sitespeed.py?url=http://www.site.com : '+site)
    sys.exit(1)

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

token = id_generator()

profile = webdriver.FirefoxProfile()
server = Server("/opt/browsermob-proxy/bin/browsermob-proxy")
server.start()
proxy = server.create_proxy()
profile.set_proxy(proxy.selenium_proxy())

profile.set_preference("browser.safebrowsing.blockedURIs.enabled", False)
profile.set_preference("browser.safebrowsing.downloads.enabled", False)
profile.set_preference("browser.safebrowsing.enabled", False)
profile.set_preference("browser.safebrowsing.forbiddenURIs.enabled", False)
profile.set_preference("browser.safebrowsing.malware.enabled", False)
profile.set_preference("browser.safebrowsing.phishing.enabled", False)
profile.set_preference('geo.enabled', False)
profile.set_preference("privacy.trackingprotection.enabled", False)
profile.set_preference("privacy.trackingprotection.ui.enabled", False)

profile.set_preference('browser.sessionhistory.max_total_viewers', 0)
profile.set_preference('browser.safebrowsing.enabled', False)
profile.set_preference('browser.shell.checkDefaultBrowser', False)
profile.set_preference('browser.startup.page', 0)
profile.set_preference('dom.ipc.plugins.enabled.timeoutSecs', 5)

profile.set_preference('network.http.pipelining', True)
profile.set_preference('network.http.pipelining.aggressive', True)
profile.set_preference('network.http.pipelining.ssl', True)
profile.set_preference('network.http.proxy.pipelining', True)

#binary = FirefoxBinary('/usr/bin/firefox')
#driver = webdriver.Firefox(firefox_profile=profile, firefox_binary=binary)
driver = webdriver.Firefox(firefox_profile=profile)

proxy.new_har("test", options={'captureHeaders': True})
driver.get(site)

result = json.dumps(proxy.har)
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

preturn = subprocess.Popen(["/usr/bin/curl", "-6", "-I", "-s", site], stdout=subprocess.PIPE, stderr=devnull )
tempout = preturn.communicate()
haveipv6 = ( preturn.returncode == 0 )

navigationStart = driver.execute_script("return window.performance.timing.navigationStart")
pageloaded = driver.execute_script("return window.performance.timing.domInteractive")

timetoload = pageloaded - navigationStart

returnvar = { "har" : encoded_har, "pagespeed" : output, "thumbnail" : encoded_image, "timetoload" : timetoload, "haveipv6" : haveipv6 }

print json.dumps(returnvar)

driver.quit()
