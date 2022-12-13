import {BasicManager} from "../BasicManager";
import {Model} from "../model/Source";

export class Source extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'source';
  }
}