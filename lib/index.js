'use strict';

var Utils = require('./utils');
var util = require('util');
module.exports = function (schema) {
  var utils = new Utils(schema);
  var normalized = utils.schema;
  //console.warn(util.inspect(normalized, {depth: null}));

  var flatten = utils.flatten();
  console.log(util.inspect(flatten, {depth: null}));
};