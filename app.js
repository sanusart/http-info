#!/bin/env node

'use strict';

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
var cors = require('kcors');
var monk = require('monk');
var markdown = require('koa-markdown');
var collect = require('co-monk');
var db = monk(
    config.mongoUser + ':' +
    config.mongoPass + '@' +
    config.mongoHost + ':' +
    config.mongoPort +
    '/httpinfo'
);


// Allow x-origin access
app.use(cors());

app.use(markdown({
    baseUrl: '/',
    root: __dirname + '/',
    layout: __dirname + '/static/layout.html',
    cache: false,
    indexName: 'README'
}));

// DB collections
var collection = {
    methods: collect(db.get('methods')),
    statusCodes: collect(db.get('status-codes')),
    headers: collect(db.get('headers'))
};

// Routes
app.use(route.get('/method/:method', getMethod));
app.use(route.get('/status-code/:code', getStatusCode));
app.use(route.get('/header/:header', getHeader));

/////////////////

// http://<domain>/method/:methodType
function * getMethod(method) {
    // res.header("Access-Control-Allow-Origin", "*");
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