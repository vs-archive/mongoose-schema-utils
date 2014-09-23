'use strict';

var utils = require('./utils');
var util = require('util');
module.exports = function (schema) {
  var normalized = utils.normalize(schema);
  console.log(util.inspect(normalized, {depth: null}));
};