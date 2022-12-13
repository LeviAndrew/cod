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
      ref: "productSearch",
      required: [true, "searcheRequired"],
    }],
    required: [true, "searchesRequired"]
  },
  year: {
    type: Schema.Types.Number,
    required: [true, "yearRequired"]
  },
  month: {
    type: Schema.Types.Number,
    required: [true, "monthRequired"]
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: "region",
    required: [true, "regionRequired"]
  }
}, BaseSchema), schema_options);

let UserModel = model("review", schema);
export {UserModel as Model};