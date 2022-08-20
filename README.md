# upnp-hermes

A docker container that subscribe to an [Hermes](https://docs.snips.ai/reference/hermes#playing-a-wav-sound) compatible MQTT broker and play audio trough specified upnp device.

## Usage

### `config.json` example:

```
{
  "upnp": {
    "host": "unpn-device.local",
    "port": 8091
  },
  "mqtt": {
    "host": "192.168.0.40",
    "username": "brucebanner",
    "password": "batmobil"
  },
  "http": {
    "host": "192.168.0.40",
    "port": 9070
  }
}

```

Usage with docker directly:

```
docker pull yadomi/upnp-hermes
docker run -it -p 9070:9070 -v $PWD/config.json:/etc/config.json yadomi/upnp-hermes /etc/config.json
```

Or with compose:

```
version: "3.0"

services:
  upnpn-hermes:
    image: yadomi/upnpn-hermes:latest
    volumes:
      - ./volume/public:/app/public
      - ./volume/config.json:/etc/config.json
    ports:
        - "9070:9070"
    command: ./config.json
```

## Use case

This container was intended to be used with [Rhasspy](https://rhasspy.readthedocs.io/en/latest/services/) and any UPNP devices that accept the [AVTransport service](http://www.upnp.org/specs/av/UPnP-av-AVTransport-v3-Service-20101231.pdf). As per the generic nature of Rhasspy and UPNP, this container can be used for any other purpose.


