import {model, Schema} from "mongoose";
import {BaseSchema} from "../BaseSchema";
import {Address} from "../subSchema/Source";

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
  products: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "product"
    }],
    default: [],
  },
  code: {
    type: Schema.Types.String,
    trim: true,
    required: [true, "codeRequired"],
    unique: true,
  },
  urlImage: {
    type: Schema.Types.String,
    trim: true,
    required: [true, 'urlImage'],
    default: "/images/default.jpg"
  },
  researchers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: "user",
    }],
    // required: [true, "researchersRequired"], // deve ser obrigatório - foi tirado p/ validação de teste
  },
  position: {
    type: Schema.Types.String,
    trim: true,
  },
  address: {
    type: Address,
  }
}, BaseSchema), schema_options);

let UserModel = model("source", schema);
export {UserModel as Model};