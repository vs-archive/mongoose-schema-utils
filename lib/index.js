'use strict';

var utils = require('./utils');
var util = require('util');
module.exports = function (schema) {
  var normalized = utils.normalize(schema);
  //console.warn(util.inspect(normalized, {depth: null}));

  var flatten = utils.flatten(normalized);
  console.log(util.inspect(flatten, {depth: null}));
};