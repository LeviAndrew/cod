import {model, Schema} from "mongoose";
import {BaseSchema} from "../BaseSchema";
import {Product} from "../subSchema/ProductBasket";

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
    ref: "region",
    required: [true, "regionRequired"],
  },
  basket: {
    type: [{
      type: Product,
      required: [true, "productRequired"]
    }],
    required: [true, "basketRequired"]
  }
}, BaseSchema), schema_options);

let UserModel = model("productbasket", schema);
export {UserModel as Model};