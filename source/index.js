const Traceroute = require('nodejs-traceroute');
const fs = require('fs');
var geoip = require('geoip-lite');
const publicIp = require('public-ip');

//! STATIC MAPS PART -----------------
const StaticMaps = require("staticmaps");


//! STATIC MAPS PART ----------------


vTraceRoute = (route) => {

    const options = {
        width: 3840,
        height: 2160
    };
    const map = new StaticMaps(options);
    
    const polyline = {
        coords: [],
        color: '#0000FFBB',
        width: 3
    };
    
    var routeData = {
        publicIp: '',
        target: route,
        _ip: null,
        ipList: [],
        pid: null,
        hops: [],
        set hop(hop) {
            console.log(`hop: ${JSON.stringify(hop)}`);
            this.hops.push(hop);
        },
        set ip(ip) {
            console.log(`destination: ${ip}`);
            this._ip = ip;
        },
        startTime: null,
        endTime: null,
        endCode: null,

        createMap : async () => {
            polyline.coords = [];
            routeData.publicIP = await publicIp.v4();
            routeData.geoIP();
            map.addLine(polyline);
            await map.render();
            await map.image.save('./results/'+routeData.target+'-staticmap.png', { compressionLevel: 0 });
        },

        geoIP(){
            if (this.publicIP !== null){
                let geo = geoip.lookup(this.publicIP);
                if (geo !== null){
                    polyline.coords.push([geo.ll[1], geo.ll[0]]);
                }
            }

            for(let i = 0; i < this.hops.length; i++){
                let ip = this.hops[i].ip;
                let geo = geoip.lookup(ip);
                this.hops[i].geo = geo;
                console.log(this.hops[i]);
                if (geo !== null) {
                    if (polyline.coords.indexOf([geo.ll[1], geo.ll[0]]) === -1) polyline.coords.push([geo.ll[1], geo.ll[0]]);
                }
            }
            if (this._ip !== null) {
                let geo = geoip.lookup(this._ip);
                if (geo !== null) {
                    if (polyline.coords.indexOf([geo.ll[1], geo.ll[0]]) === -1) polyline.coords.push([geo.ll[1], geo.ll[0]]);
                }
            }
        },

        saveData() {
            console.log(`saving data to file`);
            var data = JSON.stringify(this, null, 2);
            fs.writeFileSync( './results/'+ this.target + '.json', data);
        },

        set end(code) {
            console.log(`end: ${code}`);
            this.endCode = code;
            this.createMap();
            this.saveData();
        },

        set start(pid) {
            console.log(`pid: ${pid}`);
            this.pid = pid;
        },

    };


    try {
        const tracer = new Traceroute();
        tracer
            .on('pid', (pid) => {
                routeData.start = pid;
            })
            .on('destination', (destination) => {
                routeData.ip = destination;
            })
            .on('hop', (hop) => {
                routeData.hop = hop;
            })
            .on('close', (code) => {
                routeData.end = code;
            });

        tracer.trace(routeData.target);
    } catch (ex) {
        console.log(ex);
    }
};

module.exports = vTraceRoute;