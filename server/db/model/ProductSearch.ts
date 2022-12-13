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
  searches: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "search",
      required: [true, "searchRequired"]
    }],
    default: [],
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: [true, "productRequired"]
  },
  searchNumber: {
    type: Schema.Types.Number,
    required: [true, "searchNumberRequired"]
  },
  status: {
    type: Schema.Types.String,
    default: "Init",
    enum: ["Init", "Closed"],
  }
}, BaseSchema), schema_options);

let SearchModel = model("productSearch", schema);
export {SearchModel as Model};