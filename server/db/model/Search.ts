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
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: [true, "userRequired"]
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: [true, "productRequired"]
  },
  source: {
    type: Schema.Types.ObjectId,
    required: [true, "sourceRequired"],
    ref: "source"
  },
  code: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "codeRequired"]
  },
  especOne: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "especOneRequired"]
  },
  especTwo: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "especTwoRequired"]
  },
  price: {
    type: Schema.Types.Number,
    required: [true, "priceRequired"]
  },
  status: {
    type: Schema.Types.String,
    default: "Create",
    enum: ["Create", "Init", "Closed"],
  },
  previousSearch: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: "search"
  },
  changed: {
    type: Schema.Types.Boolean,
    required: [true, "changedRequired"],
    default: false
  },
  searchChecked: {
    type: Schema.Types.Boolean,
    default: false
  },
  reviewChecked: {
    type: Schema.Types.Boolean,
    default: false
  },
  promotion: {
    type: Schema.Types.Boolean,
    default: false,
  },
  barCode: {
    type: Schema.Types.String,
    trim: true,
  },
  position: {
    type: Schema.Types.String,
    trim: true,
    default: null
  },
  itemIndex: {
    type: Schema.Types.String,
    trim: true,
  }
}, BaseSchema), schema_options);

let SearchModel = model("search", schema);
export {SearchModel as Model};