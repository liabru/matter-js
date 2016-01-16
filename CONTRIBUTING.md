### Building and Contributing

To build you must first install [node.js](http://nodejs.org/) and [gulp](http://gulpjs.com/), then run

	npm install

This will install the required build dependencies, then run

	gulp dev

which is a task that builds the `matter-dev.js` file, spawns a `connect` and `watch` server, then opens `demo/dev.html` in your browser. Any changes you make to the source will automatically rebuild `matter-dev.js` and reload your browser for quick and easy testing.

Contributions are welcome, please ensure they follow the same style and architecture as the rest of the code. You should run `gulp test` to ensure `eslint` gives no errors. Please do not include any changes to the files in the `build` directory. 

If you'd like to contribute but not sure what to work on, feel free to message me. Thanks!