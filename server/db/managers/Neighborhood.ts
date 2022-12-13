import {BasicManager} from "../BasicManager";
import {Model} from "../model/Neighborhood";

export class Neighborhood extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'neighborhood';
  }
}