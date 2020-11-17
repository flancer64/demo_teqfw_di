# Demo project for "@teqfw/di" library

[@teqfw/di](https://github.com/teqfw/di) library is used in this demo.

```
$ git clone https://github.com/flancer64/demo_teqfw_di.git
$ cd demo_teqfw_di
$ npm install
$ npm start
```
Goto http://localhost:3000/

## Setup DI container

### Front

```html
<script type="module">
    const baseUrl = location.href;
    // load DI container as ES6 module (w/o namespaces)
    import(baseUrl + 'node_modules/@teqfw/di/src/Container.mjs').then(async (modContainer) => {
        // init container and setup namespaces mapping
        /** @type {TeqFw_Di_Container} */
        const container = new modContainer.default();
        const pathMain = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_main/src';
        const pathPlugin = baseUrl + 'node_modules/@flancer64/demo_teqfw_di_mod_plugin/src';
        container.addSourceMapping('Demo_Main', pathMain, true, 'mjs');
        container.addSourceMapping('Demo_Main_Plugin', pathPlugin, true, 'mjs');
        // ...
    });
</script>
```
### Server

```ecmascript 6
import Container from '@teqfw/di';
// ...
const container = new Container();
const pathMain = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_main/src');
const pathPlugin = $path.join(pathNode, '@flancer64/demo_teqfw_di_mod_plugin/src');
container.addSourceMapping('Demo_Main', pathMain, true, 'mjs');
container.addSourceMapping('Demo_Main_Plugin', pathPlugin, true, 'mjs');
```

## Get objects from container and use it

### Front

```ecmascript 6
/** @type {Demo_Main_Front} */
const frontMain = await container.get('Demo_Main_Front$');
frontMain.out('#main', '#plugin');
```

### Server

```ecmascript 6
const mainHandler = await container.get('Demo_Main_Server$$');
const pluginHandler = await container.get('Demo_Main_Plugin_Server$$');
server.all('/api/main', mainHandler);
server.all('/api/main/plugin', pluginHandler);
```

## Shared module

```ecmascript 6
// shared code cannot use traditional npm packages and cannot use browser API
export default function Demo_Main_Plugin_Shared(param) {
    return {pluginShared: param};
}
```

## Use shared module


### Front
```ecmascript 6
// frontend code cannot use traditional npm packages but can use browser API
export default class Demo_Main_Front {
    /** @type {Demo_Main_Shared} */
    singleMainShared
    /** @type {Demo_Main_Plugin_Front} */
    instPluginFront

    constructor(spec) {
        // get default export as singleton (class)
        this.singleMainShared = spec.Demo_Main_Shared$;
        // get default export as new instance (class)
        this.instPluginFront = spec.Demo_Main_Plugin_Front$$;
    }
    // ...
}
```

### Server

```ecmascript 6
// server side code can use traditional npm packages but cannot use browser API
import $path from 'path';
import $url from 'url';
// ...
export default function Demo_Main_Server(spec) {
    const fnPlugin = spec['Demo_Main_Plugin_Shared#'];
    // get default export as singleton (class)
    /** @type {Demo_Main_Shared} */
    const instMain = spec.Demo_Main_Shared$;

    return function (req, res) {
        // ...
    }
}
```
