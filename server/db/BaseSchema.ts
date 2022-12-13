import {Schema} from "mongoose";

let schema = {
  id: {
    type: Schema.Types.String,
    required: true,
    trim: true
  },
  removed: {
    type: Schema.Types.Boolean,
    default: false
  },
};

export {schema as BaseSchema}