'use strict';
var _ = require('lodash');

function MongooseSchemaUtils(schema) {
  this.schema = this.normalize(schema);
  this.flatSchema = this.flatten(this.schema);
}

MongooseSchemaUtils.prototype.normalize = function normalizeSchema(schema) {
  if (this.schema){
    return schema;
  }

  return normalizer(schema);
};

MongooseSchemaUtils.prototype.flatten = function flattenNormalizedSchema(){
  return flattenOut(this.schema);
};

function flattenOut(paths, result, parent, parentOptions){
  result = result || {};
  _.each(paths, function(schema, path){
    // function || object || array
    flattenPath(result, schema, path, parent, parentOptions);
  });
  return result;
}

function flattenPath(memo, schema, path, parent, parentOptions){
  /* jshint -W071 */
  parent = parent || [];
  if (!Array.isArray(parent)){
    parent = [parent];
  }
  parent = parent.concat(path);
  schema = _.extend({}, parentOptions, schema);

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

    schema.type = [flattenOut(schema.type[0], void 0, void 0, schema)];
    memo[flatPath] = schema;
    return;
  }

  // type: {}
  if (_.isObject(schema.type)){
    flattenOut(schema.type, memo, parent, schema);
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

    // field: [{type: String}]
    if (_.isFunction(schema[0].type)){
      return {type: schema};
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

    // field: {type:[{type: String, some2: true}], some: true}
    if (schema.type[0] && _.isFunction(schema.type[0].type)){
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

  // field: { type: { type: String}}
  if (schema.type && _.isFunction(schema.type.type)) {
    return { type: normalizer(schema) };
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
}

module.exports = MongooseSchemaUtils;