'use strict';
var _ = require('lodash');

function MongooseUtils() {
}

MongooseUtils.prototype.normalize = function normalizeSchema(schema) {
  return normalizer(schema);
};

MongooseUtils.prototype.flatten = function flattenNormalizedSchema(normalizedSchema){
  return flattenOut(normalizedSchema);
};

function flattenOut(paths, result, parent){
  result = result || {};
  _.each(paths, function(schema, path){
    // function || object || array
    flattenPath(result, schema, path, parent);
  });
  return result;
}

function flattenPath(memo, schema, path, parent){
  /* jshint -W071 */
  parent = parent || [];
  if (!Array.isArray(parent)){
    parent = [parent];
  }
  parent = parent.concat(path);

  var flatPath = parent.join('.');
  // type: String
  if (_.isFunction(schema.type)){
    memo[flatPath] = schema;
    return;
  }

  // type: []
  if (Array.isArray(schema.type)){
    // type: []
    if (schema.type.length === 0){
      memo[flatPath] = schema;
      return;
    }

    // type: [{type: String}]
    if (_.isFunction(schema.type[0].type)){
      memo[flatPath] = schema;
      return;
    }

    memo[flatPath] = [flattenOut(schema.type[0])];
    return;
  }

  // type: {}
  if (_.isObject(schema.type)){
    flattenOut(schema.type, memo, parent);
    return;
  }

  throw schema;
}

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

    // field: [String]
    if (_.isFunction(schema[0])){
      return {type: [{type: schema[0]}]};
    }

    return {type: [normalizer(schema[0])]};
  }

  // field: {type:[], some: true}
  if (Array.isArray(schema.type)){
    if (schema.type.length === 0){
      return schema;
    }

    // field: {type:[String], some: true}
    if (_.isFunction(schema.type[0])){
      schema.type = [{type: schema.type[0]}];
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

  throw schema;
  //return schema;
}

module.exports = new MongooseUtils();