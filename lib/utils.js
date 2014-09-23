'use strict';
var _ = require('lodash');

function MongooseUtils() {
}

MongooseUtils.prototype.normalize = function normalizeSchema(schema) {
  return normalizer(schema);
};

function normalizer (paths){
  paths = paths.constructor.name === 'Schema' ? paths.tree : paths;
  return _.reduce(paths, function (result, schema, path) {
    if (schema.constructor.name === 'VirtualType') {
      return result;
    }

    // normalize
    result[path] = normalizePath(schema);
    return result;
  }, {});
}

function normalizePath(schema) {
  /* jshint -W071 */
  // field: []
  if (Array.isArray(schema)){
    if (schema.length === 0){
      return {type: []};
    }

    return {type: [normalizer(schema[0])]};
  }

  // field: {type:[], some: true}
  if (Array.isArray(schema.type)){
    if (schema.type.length === 0){
      return schema;
    }

    schema.type = [normalizer(schema.type[0])];
    return schema;
  }

  // field: String, Boolean
  if (_.isFunction(schema) ){
    return { type: schema };
  }

  // field: { type: String }
  if (_.isFunction(schema.type)) {
    return schema;
  }

  // field: {}
  if (_.isObject(schema) && !schema.type){
    return { type: normalizer(schema) };
  }

  // field: { type: {}}
  if (_.isObject(schema)){
    schema.type = normalizer(schema.type);
    return schema;
  }

  return schema;
}


module.exports = new MongooseUtils();