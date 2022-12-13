import {BasicManager} from "../BasicManager";
import {Model} from "../model/ProductSearch";

export class ProductSearch extends BasicManager {
  wire_custom_listeners() {
    this.hub.on(`db.${this.event_name}.updateSearch`, this.updateSearch.bind(this));
  }

  async updateSearch(msg){
    if (msg.source_id === this.id) return;
    let data:any = await this.model
      .find(
        {
          _id: {
            $in: msg.data.success.ids
          }
        }
      )
      .exec();
    let promises = [];
    for(let d = 0; d < data.length; d++){
      data[d].searches = msg.data.success.searches[data[d].product.toString()];
      promises.push(data[d].save());
    }
    let rets = await Promise.all(promises);
    let ret = [];
    for(let i = 0; i < rets.length; i++){
      ret.push(rets[i].toJSON());
    }
    this.answer(msg.id, "updateSearch", ret, null);
  }

  get model() {
    return Model;
  }

  get event_name() {
    return 'productsearch';
  }
}