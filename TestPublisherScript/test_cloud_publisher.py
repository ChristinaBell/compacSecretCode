#!/usr/bin/env python3
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
    print("Published message with id " + str(mid))


batch_name = 'PKR#4575437'
batch_msg = {
    "Method": "PUT",
    "Data": {
        "Comments": ["Comment1",
                     "Comment2",
                     "Comment3"],
        "EndTime": "0001-01-01T00:00:00",
        "GrowerCode": "10262",
        "Id": 349,
        "IsFinalized": False,
        "LaneGroups": [{
            "Lanes": [1,
                      2,
                      3,
                      4,
                      5,
                      6],
            "Name": "Infeed"
        }],
        "LayoutId": "00000000-0000-0000-0000-000000000000",
        "LayoutName": None,
        "Name": "349",
        "SampleName": None,
        "SizingProfileName": None,
        "StartTime": "2017-02-21T14:01:56.339551+13:00",
        "TotallingVariety": "Day Shift",
        "TotallingVarietyCode": None,
        "VarietyId": "c894359c-4fd3-4b3a-b77a-35d873af967f",
        "VarietyName": "GA",
        "VisionMap": 3
    },
    "Status": 200,
    "StatusMessage": ""
}


def now_iso():
    return datetime.datetime.now().isoformat()


def end_batch():
    end_time = now_iso()
    batch_msg['Data']['EndTime'] = end_time
    batch_msg['Data']['IsFinalized'] = True

    bintip_msg['Data']['EndTime'] = end_time


def start_batch():
    global current_batch_start_time
    current_batch_start_time = now_iso()
    batch_msg['Data']['StartTime'] = current_batch_start_time
    batch_msg['Data']['EndTime'] = "0001-01-01T00:00:00"
    new_batch = batch_msg['Data']['Id'] + 1
    batch_msg['Data']['Id'] = new_batch
    batch_msg['Data']['Name'] = 'batch ' + str(new_batch)
    batch_msg['Data']['IsFinalized'] = False

    bintip_msg['Data']['StartTime'] = current_batch_start_time
    bintip_msg['Data']['EndTime'] = "0001-01-01T00:00:00"
    bintip_msg['Data']['Bin'] = 0
    bintip_msg['Data']['BatchId'] = new_batch

    fruit_msg['Data']['DatasetId'] = str(int(fruit_msg['Data']['DatasetId']) + 1)


def publish_fruit():
    # publish the fruit
    json_s = json.dumps(fruit_msg)
    client.publish(topic='machinename/presize/fruit/pfs/stored',
                   qos=qos_setting,
                   payload=json_s.encode('utf-8'))

    #client.loop()


fruit_id_seed = 123459876

fruit_msg = {
    "ID": str(fruit_id_seed),
    "Method": "PUT",

    "Data": {
        "Identifier": {
            "FruitId": str(fruit_id_seed),
            "Pulse": "123",
            "Lane": "1",
            "MajorDiameter": "45.35",
            "MinorDiameter": "57.43",
        },
        "WeightGrams": "363.35",
        "Size": "36",
        'DatasetId': "0",
        "VisionGrade": "Class 2",
        "SampledGrade": "Class 2",
        "CaptureFilename": 'TODO: capx_file_name goes here',
        "Capture": "TODO: Put .capx file contents here",
        "PackRun": {
            "FruitVariety": "Kiwi Green",
            "Name": batch_name,
            "Grower": "GSKL3737",
            "StartTime": "2017-02-21T14:01:56.339551+13:00",
            "EndTime": "2017-02-21T16:12:35.235354+13:00"
        }
    },
    "Status": "200",
    "StatusMessage": "OK"
}

def get_fruit_defects():
    defects = ('Dirt', 'SkinRub', 'Sunburn', 'Fungal', 'SootyMould', 'Overripe', 'Cut')
    severities = ('minor', 'moderate', 'severe')
    has_defect = random.randint(1,3) == 1
    if not has_defect:
        return {}
    num_defects = random.randint(1, len(defects))
    defects = random.sample(defects, num_defects)
    rval = {}
    for defect in defects:
        rval[defect] = random.choice(severities)
    return rval


def new_fruit():

    fruit_msg['ID'] = str(int(fruit_msg['ID']) + 1)
    fruit_msg['Data']['DatasetId'] = str(int(fruit_msg['Data']['DatasetId']) + 1)

    old_pulse = int(fruit_msg['Data']['Identifier']['Pulse'])
    new_pulse = (old_pulse + 100) % 256
    fruit_msg['Data']['Identifier']['Pulse'] = str(new_pulse)
    d1 = round(50 + random.random() * 10, 2)
    d2 = round(50 + random.random() * 10, 2)
    w = round(80 + random.random() * 80, 2)
    sz = str(int((1 / w) * 4000 / 4) * 4)  # 80 grams is '48', 160 grams is '24'

    fruit_msg['Data']['Identifier']['MajorDiameter'] = str(d1)
    fruit_msg['Data']['Identifier']['MinorDiameter'] = str(d2)
    fruit_msg['Data']['WeightGrams'] = str(w)
    fruit_msg['Data']['Size'] = str(sz)
    fruit_msg['Data']['Defects'] = get_fruit_defects()

    fruit_msg['Data']['PackRun']['StartTime'] = str(current_batch_start_time)
    fruit_msg['Data']['PackRun']['EndTime'] = '0001-01-01T00:00:00'
    fruit_msg['Data']['PackRun']['Name'] = batch_name + '_' + str(batch_msg['Data']['Id'])

    fruit_msg['Data']['CaptureFilename'] = '{0:04}_{1:04}_Fruit.capx'.format(batch_msg['Data']['Id'],
                                                   int(fruit_msg['Data']['Identifier']['FruitId']) - fruit_id_seed)
    print(fruit_msg)


bintip_msg = {
    'Method' : 'PUT',
    'Data' : {
        'BatchId' : 123,
        'StartTime' : '0001-01-01T00:00:00',
        'EndTime' : '0001-01-01T00:00:00',
    },
    'Status' : 200,
    'StatusMessage' : ''
}


bin_msg = {
    'Method' : 'PUT',
    'Data' : {
        'BatchId' : 123,
        'Bin' : 0
    },
    'Status' : 200,
    'StatusMessage' : 'OK'
}


def new_bin():
    bin_msg['Data']['Bin'] += 1
    bin_msg['Data']['BatchId'] = bintip_msg['Data']['BatchId']


def generate(batches=10, bins = 5, fruit=10):
    for i in range(batches):
        start_batch()
        client.publish(topic="test", qos=1, payload="dfaf")
        print('batch ' + str(i + 1))
        for bin in range(bins):
            for f in range(fruit):
                time.sleep(5)
                new_fruit()
                print(f, )
                publish_fruit()
        print()
        time.sleep(10)
        end_batch()
    print('Done')
    print()

CLIENT_CLASS = mqtt.Client #TestClient  # or mqtt.Client


if __name__ == '__main__':
    random.seed(fruit_msg['Data']['Identifier']['FruitId'])
    connect(CLIENT_CLASS)
    generate()


