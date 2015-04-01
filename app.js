#!/bin/env node

var config = {
    nodePort: process.env.OPENSHIFT_NODEJS_PORT || process.env.OPENSHIFT_INTERNAL_PORT || 8080,
    nodeHost: process.env.OPENSHIFT_NODEJS_IP || 'localhost',
    mongoUser: process.env.OPENSHIFT_MONGODB_DB_USERNAME || '',
    mongoPass: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || '',
    mongoHost: process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost',
    mongoPort: process.env.OPENSHIFT_MONGODB_DB_PORT || 27017
};

var excludeFields = "-_id";

var koa = require('koa');
var route = require('koa-route');
var app = module.exports = koa();
var monk = require('monk');
var wrap = require('co-monk');
var db = monk( config.mongoUser + ':' + config.mongoPass + '@' + config.mongoHost + ':' + config.mongoPort + '/httpinfo' );

// DB collections
var collection = {
    methods: wrap(db.get('methods')),
    statusCodes: wrap(db.get('status-codes')),
    headers: wrap(db.get('headers'))
};

// Routes

app.use(route.get('/', showInfo));
app.use(route.get('/method/:method', getMethod));
app.use(route.get('/status-code/:code', getStatusCode));
app.use(route.get('/header/:header', getHeader));

/////////////////

// http://<domain>/
function * showInfo() {
    this.body = "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>http-info</title></head><body>" +
    "<h1>Welcome to \"http-info\"</h1>" +
        "<h2>Usage:</h2>" +
        "<p>Request methods info:<br><source>/method/:method</source> <br > e. g. <a href=\"/method/get\">/method/get</a></p>" +
        "<p>Status codes info:<br><source>/status-code/:code</source> <br > e. g. <a href=\"/status-code/404\">/status-code/404</a></p>" +
        "<p>Headers info:<br><source>/header/:header</source> <br> e.g. <a href=\"/header/content-type\">/header/content-type</a></p>" +
    "</body></html>";
}

// http://<domain>/method/:methodType
function * getMethod(method) {
    this.body = yield collection.methods.find({
        method: method.toUpperCase()
    }, excludeFields);
}

// http://<domain>/status-code/:code
function * getStatusCode(code) {
    this.body = yield collection.statusCodes.find({
        code: code
    }, excludeFields);
}

// http://<domain>/header/:header
function * getHeader(header) {
    this.body = yield collection.headers.find({
        header: new RegExp('^' + header + '$', "i")
    }, excludeFields);
}

if (!module.parent) app.listen(config.nodePort, config.nodeHost, function() {
    console.log('Started http-info: ' + 'http://' + config.nodeHost + ':' + config.nodePort);
});