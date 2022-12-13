import {BasicManager} from "../BasicManager";
import {Model} from "../model/Product";

export class Product extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'product';
  }
}