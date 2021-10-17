const
    corrosion = require('./Corrosion-Heroku'),
    path = require('path'),
    config = require('./config.json'),
    fs = require('fs'),
    https = require('https'),
    http = require('http'),
    express = require('express'),
    app = express(),
    port = process.env.PORT || config.port,
    /*ssl = {
        key: fs.readFileSync(path.join(__dirname, '/ssl/default.key')),
        cert: fs.readFileSync(path.join(__dirname, '/ssl/default.crt')),
    },*/
    error = '404 not found',
    proxy = new corrosion({
        prefix: config.prefix,
        title: config.title,
        cookie: config.datastealer,
        codec: config.codec,
        standardMiddleware: true,
        requestMiddleware: [
            corrosion.middleware.blacklist((config.blacklist || []), 'This page has been blocked!'),
        ],
    }),
    server = http/*s*/.createServer(/*ssl, */app);

app.get('/community', function(req, res){
    res.sendFile('/community.html', { root: __dirname + '/public'});
});
app.get('/information', function(req, res){
    res.sendFile('/information.html', { root: __dirname + '/public'});
});
app.get('/', function(req, res){
    res.sendFile('/index.html', { root: __dirname + '/public' });
});
app.use(express.static(path.normalize(__dirname + '/public/')));
app.use((req, res) => {
    if (req.url.startsWith(proxy.prefix)) return proxy.request(req,res);
    res.status(404, res.send(error))
});

server.on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(port);
console.log('Resilience is available on port ' + port)
