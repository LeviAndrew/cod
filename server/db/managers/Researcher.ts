import {User} from "./User";
import {Model} from "../model/Researcher";

export class Researcher extends User {
  wire_custom_listeners() {}

  get model() {
    return Model;
  }

  get event_name() {
    return 'researcher';
  }
}