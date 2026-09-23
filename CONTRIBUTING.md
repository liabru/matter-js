# Contributing

## License Agreement

By providing any kind of contribution to this project, **you must agree and be legally entitled** to provide them for use and distribution as a part of this project **wholly under the same terms as in the original included [license](https://github.com/liabru/matter-js/blob/master/LICENSE)**.

## Contributions

Contributions by pull request or issues are welcome. Please ensure they follow the same style and architecture as the rest of the code. Use `pnpm run lint` and see [Testing](#Testing) below before submitting. Please **do not include** any changes to the files in the `build` directory. 

Before contributing please read the license agreement described at the beginning of this document.

## Building

To build you must first install [node.js](http://nodejs.org) and [pnpm](https://pnpm.io/), then run

	pnpm install

which will install the required build dependencies, then run

	pnpm start

which will run the development server and opens `http://localhost:8000/` in your browser. Any changes you make to the source will automatically rebuild and reload the page.

## Testing

All contributions should pass when running the commands

- `pnpm run lint`
- `pnpm run test`

The output of `pnpm run test` also includes a [comparison report](https://github.com/liabru/matter-js/pull/794), which highlights changes in results, performance and accuracy against the last release build.

## Commands

The following development commands can be run at the terminal

- **pnpm start**  
runs development server and opens demo page
- **pnpm run build**  
creates a release build
- **pnpm run build-demo**  
builds the demo
- **pnpm run lint**  
runs the linter
- **pnpm run test**
runs the tests and compares results
