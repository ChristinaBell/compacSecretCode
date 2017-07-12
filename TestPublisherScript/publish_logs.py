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

current_batch_start_time = ''
current_batch_end_time = ''


class TestClient:

    def __init__(self, client_id, clean_session):
        self.on_connect = None

    def connect(self, a, b, c):
        pass

    def publish(self, topic='',
                qos=1,
                payload=b''):
        print('########## topic: '+topic)
        pprint.pprint(json.loads(payload.decode('utf-8')))

    def loop(self):
        pass



def on_connect(client, userdata, flags, rc):
    print("test_cloud connected with result code " + str(rc))


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


def on_disconnect(client, userdata, rc):
    print("Disconnected with code " + str(rc))


def msg_published(client, userdate, mid):
    pass
    # print("Published message with id " + str(mid))


def now_iso():
    return datetime.datetime.now().isoformat()


def generate(batches=10, bins = 5, fruit=10):
    for i in range(batches):
        client.publish(topic="test", qos=1, payload="dfaf")
        print('batch ' + str(i + 1))
        for bin in range(bins):
            for f in range(fruit):
                time.sleep(5)
                print(f, )
                # publish_fruit()
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
                            "Packhouse": "Zirkle Selah",
                            "Customer": "Zirkle Fruit Co"
                        }
                        publish_log(sizer_log_msg)
        print()
        time.sleep(10)
    print('Done')
    print()


def publish_log(sizer_log_msg):
    json_s = json.dumps(sizer_log_msg)
    client.publish(topic='sizer/log',
                   qos=qos_setting,
                   payload=json_s.encode('utf-8'))
    print("pub..")


CLIENT_CLASS = mqtt.Client #TestClient  # or mqtt.Client


def generate_log():
    client.publish(topic="test", qos=1, payload="dfaf")
    publish_fruit()
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

            # publish_log(sizer_log_msg)


if __name__ == '__main__':
    connect(CLIENT_CLASS)
    generate()
