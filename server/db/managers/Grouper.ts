import {BasicManager} from "../BasicManager";
import {Model} from "../model/Grouper";

export class Grouper extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'grouper';
  }
}