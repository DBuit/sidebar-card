const { minify } = require("uglify-js");

const transform = (code, optionsString) => {
  const options = eval(`(${optionsString})`)
  const result = minify(code, options);
  if (result.error) {
    throw result.error;
  } else {
    return result;
  }
};

exports.transform = transform;
