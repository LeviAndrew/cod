import {BasicManager} from "../BasicManager";
import {Model} from "../model/Region";

export class Region extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'region';
  }
}