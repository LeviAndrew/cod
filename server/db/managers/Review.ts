import {BasicManager} from "../BasicManager";
import {Model} from "../model/Review";

export class Review extends BasicManager {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'review';
  }
}