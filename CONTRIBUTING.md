# Contributing

## License Agreement

By providing any kind of contribution to this project, **you must agree and be legally entitled** to provide them for use and distribution as a part of this project **wholly under the same terms as in the original included [license](https://github.com/liabru/matter-js/blob/master/LICENSE)**.

## Contributions

Contributions by pull request or issues are welcome. Please ensure they follow the same style and architecture as the rest of the code. Use `npm run lint` and see [Testing](#Testing) below before submitting. Please **do not include** any changes to the files in the `build` directory. 

Before contributing please read the license agreement described at the beginning of this document.

## Building

To build you must first install [node.js](http://nodejs.org), then run

	npm install

which will install the required build dependencies, then run

	npm run dev

which will run the development server and opens `http://localhost:8000/` in your browser. Any changes you make to the source will automatically rebuild and reload the page.

## Testing

All contributions should pass when running the commands

- `npm run lint`
- `npm run test`
- `npm run test-browser`

The output of `npm run test` also includes a [comparison report](https://github.com/liabru/matter-js/pull/794), which highlights changes in results, performance and accuracy against the last release build.

## Commands

The following development commands can be run at the terminal

- **npm run dev**  
runs development server
- **npm run build**  
creates a release build
- **npm run lint**  
runs the linter
- **npm run test**  
runs the tests and compares results
- **npm run test-browser**  
runs the browser tests
- **npm run doc**  
builds the documentation
