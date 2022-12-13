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
  name: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "nameRequired"]
  },
  node: {
    type: Schema.Types.ObjectId,
    ref: "grouper",
  },
  nodeSon: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "grouper"
      }
    ],
  },
  productBasket: {
    type: Schema.Types.ObjectId,
    ref: "productbasket",
    required: [true, "productBasketRequired"],
  },
  products: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "product",
      required: [true, "productRequide"],
    }],
    required: [true, "productsRequired"],
  }
}, BaseSchema), schema_options);

let UserModel = model("grouper", schema);
export {UserModel as Model};