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
  sources: {
    type: [{
      type: Schema.Types.ObjectId,
      required: [true, "sourceRequired"],
      ref: "source"
    }],
    default: [],
  },
  publicSearches: {
    type: Schema.Types.Boolean,
    default: true,
  },
  canUsePublicSearches: {
    type: Schema.Types.Boolean,
    default: true,
  }
}, BaseSchema), schema_options);

let UserModel = model("region", schema);
export {UserModel as Model};