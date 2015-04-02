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
//app.use(route.get('/', showInfo));
app.use(route.get('/method/:method', getMethod));
app.use(route.get('/status-code/:code', getStatusCode));
app.use(route.get('/header/:header', getHeader));

/////////////////

// http://<domain>/
function * showInfo() {
    this.body = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>http-info</title></head><body><h1>Welcome to "http-info"</h1><h2>Usage:</h2><p>Request methods info:<br><source>/method/:method</source> <br > e. g. <a href="/method/get">/method/get</a></p><p>Status codes info:<br><source>/status-code/:code</source> <br > e. g. <a href="/status-code/404">/status-code/404</a></p><p>Headers info:<br><source>/header/:header</source> <br> e.g. <a href="/header/content-type">/header/content-type</a></p><a href="https://github.com/sanusart/http-info"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"></a></body></html>';
}

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