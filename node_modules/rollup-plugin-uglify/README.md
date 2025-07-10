# rollup-plugin-uglify [![Travis Build Status][travis-img]][travis]

[travis-img]: https://travis-ci.org/TrySound/rollup-plugin-uglify.svg
[travis]: https://travis-ci.org/TrySound/rollup-plugin-uglify

[Rollup](https://github.com/rollup/rollup) plugin to minify generated bundle. Uses [UglifyJS](https://github.com/mishoo/UglifyJS2) under the hood. There are a few improvements over native uglify:

* uglify is run in worker for every chunk
* errors are displayed with [babel code frame](https://babeljs.io/docs/en/next/babel-code-frame.html)

_Note: uglify-js is able to transpile only es5 syntax. If you want to transpile es6+ syntax use [terser](https://github.com/TrySound/rollup-plugin-terser) instead_

## Install

```sh
yarn add rollup-plugin-uglify --dev
```

*Note: this package requires rollup@0.66 and higher*

## Usage

```js
import { rollup } from "rollup";
import { uglify } from "rollup-plugin-uglify";

rollup({
  input: "main.js",
  plugins: [uglify()]
});
```

## Options

```js
uglify(options);
```

`options` - [uglifyJS API options](https://github.com/mishoo/UglifyJS2/blob/master/README.md#minify-options)

`options.sourcemap: boolean`

Generates source maps and passes them to rollup. Defaults to `true`.

`options.numWorkers: number`

Amount of workers to spawn. Defaults to the number of CPUs minus 1.


## Examples

### Comments

If you'd like to preserve comments (for licensing for example), then you can specify a function to do this like so:

```js
uglify({
  output: {
    comments: function(node, comment) {
      if (comment.type === "comment2") {
        // multiline comment
        return /@preserve|@license|@cc_on/i.test(comment.value);
      }
      return false;
    }
  }
});
```

Alternatively, you can also choose to keep all comments (e.g. if a licensing header has already been prepended by a previous rollup plugin):

```js
uglify({
  output: {
    comments: "all"
  }
});
```

See [UglifyJS documentation](https://github.com/mishoo/UglifyJS2/blob/master/README.md) for further reference.

# License

MIT © [Bogdan Chadkin](mailto:trysound@yandex.ru)
