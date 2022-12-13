import {BasicManager} from "../BasicManager";
import {Model} from "../model/CalculatedProduct";

export class CalculatedProduct extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'calculatedProduct';
  }
}