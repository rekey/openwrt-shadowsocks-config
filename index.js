const fs = require('fs');
const dns = require('dns');
const ejs = require('ejs');
const pinguNoot = require('pingu-noot');

const ips = require('./config/ip.js');

const promise = ips.map((ip) => {
    return new Promise((resolve) => {
        const host = `${ip.name}.wonder.cx`;
        pinguNoot({c: 10, timeout: 1000}, host, function (stat) {
            ip.stat = stat;
            resolve(ip);
        });
    });
});

const promise2 = ips.map((ip) => {
    return new Promise((resolve) => {
        const host = `${ip.name}.wonder.cx`;
        dns.lookup(host, function (err,resp) {
            ip.ip = resp;
            resolve();
        });
    });
});

Promise.all([
    Promise.all(promise),
    Promise.all(promise2)
]).then(() => {
    const ipList = ips.sort((a,b) => {
        a.stat.avg = a.stat.avg || Math.round(Math.random() * 1000);
        b.stat.avg = b.stat.avg || Math.round(Math.random() * 1000);
        return a.stat.avg - b.stat.avg;
    });
    ejs.renderFile('./view/config.template', {
        ipList:ipList.slice(0,4)
    }, function(err, str){
        fs.writeFile('./shadowsocks', str);
    });
}).catch((err) => {
    console.error(err);
});