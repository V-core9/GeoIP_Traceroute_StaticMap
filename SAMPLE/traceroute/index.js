const Traceroute = require('nodejs-traceroute');
const fs = require('fs');

var routeData = {
    target: 'v-core9.com',
    _ip: null,
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
    saveData () {
        console.log(`saving data to file`);
        var data = JSON.stringify(this, null, 2);
        fs.writeFileSync('sample_trace-results.'+this.target+'.json', data);
    },
    set end(code) {
        console.log(`end: ${code}`);
        this.endCode = code;
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