import {BasicManager} from "../BasicManager";
import {Model} from "../model/City";

export class City extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'city';
  }
}