#!/usr/bin/env python3
import re
import ssl
import sys
import time
import json
import random
import pprint
import logging
import datetime

import paho.mqtt.client as mqtt

logging.basicConfig(stream=sys.stdout, format='%(asctime)s:%(name)s:%(levelname)s:%(message)s', level=logging.DEBUG)

IP = 'a1j2hukfi2kg0c.iot.ap-southeast-2.amazonaws.com'
qos_setting = 1

client = None


def connect(client_class):
    global client
    client = client_class(client_id="test_cloud", clean_session=True)

    certfile = "82beff9e2d-certificate.pem.crt"
    ca_certs = "AWS-rootCA.pem"
    keyfile = "82beff9e2d-private.pem.key"

    client.tls_set(ca_certs=ca_certs, certfile=certfile, keyfile=keyfile,
                   cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_SSLv23)
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish = msg_published
    client.connect(IP, 8883, 60)
    client.loop_start()


def on_connect(client, userdata, flags, rc):
    print("test_cloud connected with result code " + str(rc))


def on_disconnect(client, userdata, rc):
    print("Disconnected with code " + str(rc))


def msg_published(client, userdate, mid):
    print("Published message with id " + str(mid))


def publish_log(sizer_log_msg):
    # publish a log file
    print(sizer_log_msg)
    sizer_log = json.dumps(sizer_log_msg)
    client.publish(topic='sizer/log',
                   qos=qos_setting,
                   payload=sizer_log.encode('utf-8'))
    #client.loop()


def generate(batches=10, bins = 5, fruit=10):
    with open("sizerlog.txt") as f:
        content = f.readlines()

    error = re.compile("^\s*\d+\)\s+\((\w+)\)((\s|\d|-|:|\.)+)\t*(.+)")

    for line in content:

        if error.match(line):
            match = error.match(line)
            logType = (match.group(1))
            date = match.group(2)
            msg = match.group(4)

            sizer_log_msg = {
                "LogType": logType,
                "LogMessage": msg,
                "Date": date,
                "Machine": "Sizer",
                "Packhouse": "Quarry Road",
                "Customer": "EastPack"
            }

            publish_log(sizer_log_msg)


if __name__ == '__main__':
    connect(mqtt.Client)
    generate()
