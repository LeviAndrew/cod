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
  previousWeight: {
    type: Schema.Types.Number,
    required: [true, "previusWeightRequired"],
  },
  weight: {
    type: Schema.Types.Number,
    required: [true, "weithtRequired"],
  },
  ipc: {
    type: Schema.Types.Number,
    default: 1,
  },
  product: {
    type: Schema.Types.ObjectId,
    required: [true, "productRequired"],
    ref: "product",
  },
}, BaseSchema), schema_options);

let UserModel = model("calculatedproducts", schema);
export {UserModel as Model};