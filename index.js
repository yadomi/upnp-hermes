const MQTT = require("mqtt");
const handler = require("serve-handler");
const http = require("http");
const axios = require("axios");
const Lame = require("node-lame").Lame;

const { hideBin } = require("yargs/helpers");
const yargs = require("yargs/yargs");

const argv = yargs(hideBin(process.argv))
  .command("<config>", "Configuration file path")
  .demandCommand(1)
  .parseSync();

const config = require(argv._[0]);

const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./public",
  });
});

server.listen(config.http.port, "0.0.0.0", () => {
  console.log(`[WEB]: Running at http://0.0.0.0:${config.http.port}`);
});

const mqtt = MQTT.connect(config.mqtt);

mqtt.on("close", (...args) => console.log("close", ...args));
mqtt.on("disconnect", (...args) =>
  console.log("[MQTT]: Disconnected", ...args)
);
mqtt.on("error", (...args) => console.log("error", ...args));
mqtt.on("connect", async function () {
  console.log("[MQTT]: Connected to broker");

  mqtt.subscribe("hermes/+/+/playBytes/+");

  mqtt.on("message", async (topic, payload) => {
    const filename = topic.split("/").slice(-1);
    const encoder = new Lame({
      output: `./public/${filename}.mp3`,
      bitrate: 192,
    }).setBuffer(payload);

    encoder
      .encode()
      .then(() => {
        const options = {
          method: "POST",
          url: `http://${config.upnp.host}:${config.upnp.port}/AVTransport/Control`,
          headers: {
            Accept: "*/*",
            "User-Agent": "libsoundtouch",
            "Content-Type": 'text/xml; charset="utf-8"',
            SOAPACTION:
              "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI",
          },
          data: `<?xml version="1.0" encoding="utf-8"?>
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <s:Body>
                <u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
                    <InstanceID>0</InstanceID>
                    <CurrentURIMetaData></CurrentURIMetaData>
                    <CurrentURI>http://${config.http.host}:${config.http.port}/${filename}.mp3</CurrentURI>
                </u:SetAVTransportURI>
            </s:Body>
        </s:Envelope>`,
        };

        axios
          .request(options)
          .then(() => {
            console.log("[WEB]: OK: ", filename);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  });
});

process.on("SIGINT", function () {
  process.exit();
});
