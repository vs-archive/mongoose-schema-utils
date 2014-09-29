var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schemaNormalizer = require('./lib');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

var sub = {
  // simple types
  str: String, strType: {type: String, enum: ['on', 'off']},
  num: Number, numType: {type: Number, some: true, some1: {prop: 'test'}, private: false},
  bool: Boolean, boolType: {type: Boolean, some: true},
  arr: [], arrType: {type:[]},
  //buf: Buffer, bufType: {type: Buffer},
  date: Date, dateType: {type: Date, some: true},
  objId: ObjectId, objIdType: { type: ObjectId},
  mix: Mixed, mixType: { type: Mixed },
  obj: {}, objType: { type: {}}
};

var subSchema = new Schema({
  // simple types
  str: String, strType: {type: String, enum: ['on', 'off']},
  num: Number, numType: {type: Number, some: true, some1: {prop: 'test'}, private: false},
  bool: Boolean, boolType: {type: Boolean, some: true},
  arr: [], arrType: {type:[]},
  //buf: Buffer, bufType: {type: Buffer},
  date: Date, dateType: {type: Date, some: true},
  objId: ObjectId, objIdType: { type: ObjectId},
  mix: Mixed, mixType: { type: Mixed },
  obj: {}, objType: { type: {}},
  type: {type: String}
});

var schema = new Schema({
  //exceptional
  type: {type: String, enum: ['on', 'off']},
  // nested type with mixed types
  nested: { file: {name:String, image: {type:String}}},
  // simple types
  str: String, strType: {type: String, enum: ['on', 'off']},
  num: Number, numType: {type: String, some: true},
  bool: Boolean, boolType: {type: Boolean, some: true},
  arr: [], arrType: {type:[]},
  simpleArr: [String], simpleArrType: {type:[String]},
  buf: Buffer, bufType: {type: Buffer},
  date: Date, dateType: {type: Date, some: true},
  objId: ObjectId, objIdType: { type: ObjectId, ref: 'Users'},
  // mixed types
  mix: Mixed, mixType: { type: Mixed },
  obj: {}, objType: { type: {}},
  sub: sub, subType: {type: sub, private: true, some1: {prop: true}},
  //mixed type
  subArr: [sub], subArrType: { type: [sub] },
  // sub schema type
  subSch: [subSchema], subSchType: {type: [subSchema]}
  //schema can not be a type
  //subSchema: subSchema, subSchemaType: {type: subSchema}
});

schema.plugin(schemaNormalizer);
mongoose.model('schema', schema, 'schema');