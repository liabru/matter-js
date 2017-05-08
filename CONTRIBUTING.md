# Contributing

## License Agreement

When providing any contributions, you must agree and be legally entitled to provide them for use and distribution in the project under the same terms as the [license](https://github.com/liabru/matter-js/blob/master/LICENSE), otherwise they can not be accepted.

## Building

To build you must first install [node.js](http://nodejs.org/) and [gulp](http://gulpjs.com/), then run

	npm install

This will install the required build dependencies, then run

	gulp dev

which is a task that builds the `matter-dev.js` file, spawns a development server and opens `http://localhost:8000/demo/index.html` in your browser. Any changes you make to the source will automatically rebuild `matter-dev.js` and reload your browser.

## Contributions

Contributions by pull request are welcome! Please ensure they follow the same style and architecture as the rest of the code. You should run `gulp test` and ensure there are no reported errors. Please do not include any changes to the files in the `build` directory. All contributors must agree to the license agreement described at the beginning of this document.

If you'd like to contribute but not sure what to work on, feel free to get in touch.