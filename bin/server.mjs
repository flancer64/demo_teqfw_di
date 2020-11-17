import $express from 'express';
import $mimeTypes from 'mime-types';
import $path from 'path';
import $serveStatic from 'serve-static';
import $url from 'url';
import Container from '@teqfw/di';

// get this script folder and define working environment
const {path: currentScript} = $url.parse(import.meta.url);
const pathScript = $path.dirname(currentScript);
const pathRoot = $path.join(pathScript, '..');
const pathNode = $path.join(pathRoot, 'node_modules');
const pathWeb = $path.join(pathRoot, 'web');

// initialize DI container
const container = new Container();
const pathMain = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_main/src');
const pathPlugin = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_plugin/src');
container.addSourceMapping('Demo_Main', pathMain, true, 'mjs');
container.addSourceMapping('Demo_Main_Plugin', pathPlugin, true, 'mjs');

// print configured namespaces
const ns = container.getNsResolver().list();
console.log("Namespaces: " + JSON.stringify(ns, null, '  '));

// setup 'express' server
const server = $express();
server.use($express.json({limit: '1mb'}));

// HTTP requests logger
server.use(function (req, res, next) {
    console.debug(`${req.method} ${req.url}`);
    next();
});

// setup server to use './web/' folder as source for static files
server.use($serveStatic(pathWeb));

// setup demo application routes
const mainHandler = await container.get('Demo_Main_Server$$');
const pluginHandler = await container.get('Demo_Main_Plugin_Server$$');
server.all('/api/main', mainHandler);
server.all('/api/main/plugin', pluginHandler);

// map all './node_modules/' requests to './node_modules/' folder as static resources requests
server.all('*/node_modules/*', function (req, res, next) {
    const urlParts = /^(\/node_modules\/)(.*)/.exec(req.url);
    // convert '/node/path' to './node_modules/path' to import DI container sources as is (w/o namespaces)
    const path = $path.join(pathNode, urlParts[2]);
    const mimeType = $mimeTypes.lookup(path);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', mimeType);
    res.sendFile(path);
    console.debug(`${req.method} ${req.url}`);
});

// start 'express' server
const port = 3000;
server.listen(
    port,
    () => console.info(`Web server is listening on port ${port}.`)
);
