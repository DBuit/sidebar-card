const { codeFrameColumns } = require("@babel/code-frame");
const Worker = require("jest-worker").default;
const serialize = require("serialize-javascript");

function uglify(userOptions = {}) {
  if (userOptions.sourceMap != null) {
    throw Error("sourceMap option is removed, use sourcemap instead");
  }

  const normalizedOptions = Object.assign({}, userOptions, {
    sourceMap: userOptions.sourcemap !== false
  });

  ["sourcemap"].forEach(key => {
    if (normalizedOptions.hasOwnProperty(key)) {
      delete normalizedOptions[key];
    }
  });

  const minifierOptions = serialize(normalizedOptions);

  return {
    name: "uglify",

    renderStart() {
      this.worker = new Worker(require.resolve("./transform.js"), {
        numWorkers: userOptions.numWorkers
      });
    },

    renderChunk(code) {
      return this.worker.transform(code, minifierOptions).catch(error => {
        const { message, line, col: column } = error;
        console.error(
          codeFrameColumns(code, { start: { line, column } }, { message })
        );
        throw error;
      });
    },

    generateBundle() {
      this.worker.end();
    },

    renderError() {
      this.worker.end();
    }
  };
}

exports.uglify = uglify;
