import {model, Schema} from "mongoose";
import {BaseSchema} from "../BaseSchema";

let schema_options = {
  timestamps: true,
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
  // http://mongoosejs.com/docs/guide.html#options
};

let schema = new Schema(Object.assign({
  region: {
    type: Schema.Types.ObjectId,
    ref: 'region',
    required: [true, "regionRequired"],
  },
  year: {
    type: Schema.Types.Number,
    required: [true, "yearRequired"]
  },
  month: {
    type: Schema.Types.Number,
    required: [true, "monthRequired"],
  },
  groups: {
    type: [{
      type: Schema.Types.ObjectId,
      required: [true, "groupRequired"],
      ref: "grouper"
    }],
    required: [true, "groupsRequired"],
  },
  calculatedProducts: {
    type: [{
      type: Schema.Types.ObjectId,
      required: [true, "calculatedProductRequired"],
      ref: "calculatedproducts",
    }],
    required: [true, "calculatedProductsRequired"],
  },
}, BaseSchema), schema_options);

let UserModel = model("report", schema);
export {UserModel as Model};