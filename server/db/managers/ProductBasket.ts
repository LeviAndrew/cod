import {BasicManager} from "../BasicManager";
import {Model} from "../model/ProductBasket";

export class ProductBasket extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'productbasket';
  }
}