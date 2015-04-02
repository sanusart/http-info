# HTTP info

Simple informative API for HTTP: methods, headers and response codes.

Based on json files of Andrei's Neculau [know-your-http-well](https://github.com/for-GET/know-your-http-well)

# Usage:

---

### Request **Methods** info:

#### `GET /method/:method` [&raquo;](http://httpinfo-sanusart.rhcloud.com/method/get)

> e. g. http://httpinfo-sanusart.rhcloud.com/method/get

_Returns json object_ of type _`application/json`_

---

### Request **Status codes** info:

#### `GET /status-code/:code` [&raquo;](http://httpinfo-sanusart.rhcloud.com/status-code/404)

> e. g. http://httpinfo-sanusart.rhcloud.com/status-code/404

_Returns json object_ of type _`application/json`_

---

### Request **Headers** info:

#### `GET /header/:header` [&raquo;](http://httpinfo-sanusart.rhcloud.com/header/content-type)

> e.g. http://httpinfo-sanusart.rhcloud.com/header/content-type

_Returns json object_ of type _`application/json`_

---

## Local Installation

- Clone the repo
- Run `npm install`
- Run the sever with `node --harmony app.js`

For MongoDB population/updates see [post_deploy](https://github.com/sanusart/http-info/blob/master/.openshift/action_hooks/post_deploy) hook

---

Made using [Koa.js](http://koajs.com/) and [MongoDB](http://www.mongodb.org/)

Hosted on [OpenShift Online](https://www.openshift.com/products/online)

License: [MIT](https://github.com/sanusart/http-info/blob/master/LICENSE)

