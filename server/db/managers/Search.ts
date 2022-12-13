import {BasicManager} from "../BasicManager";
import {Model} from "../model/Search";

export class Search extends BasicManager {
  wire_custom_listeners() {
    this.hub.on("db." + this.event_name + ".close", this.close.bind(this));
    this.hub.on("db." + this.event_name + ".createFromTable", this.handleCreateFromTable.bind(this));
  }

  private handleCreateFromTable(msg) {
    if (msg.source_id === this.id) return;
    this.createFromTable(msg.data.success).then((ret) => {
      this.answer(msg.id, "createFromTable", ret, null);
    }).catch((error) => {
      this.answer(msg.id, "createFromTable", null, error);
    });
  }

  private async createFromTable(data) {
    let ret: any = await this.model.create(data);
    return await this.afterCreate(ret);
  }

  private previousToMap(preivous) {
    let mapPrevious = new Map();
    for (let i = 0; i < preivous.length; i++) {
      if (!mapPrevious.has(preivous[i].code)) mapPrevious.set(preivous[i].code, preivous[i]);
    }
    return mapPrevious;
  }

  private async getPreviousSearch(msg, currentSearches, index) {
    const limit = currentSearches.length * 2;
    this.model.find({
      user: msg.data.success.user,
      status: "Closed",
    }).select('especOne especTwo code')
      .sort({$natural: -1}).limit(limit).lean()
      .then((ret) => {
        let mapPrevious = this.previousToMap(ret);
        for (let i = index; i < currentSearches.length; i++) {
          if (!currentSearches[i].previousSearch) {
            this.saveSearch(currentSearches[i], mapPrevious.get(currentSearches[i].code));
          } else {
            this.saveSearch(currentSearches[i], currentSearches[i].previousSearch);
          }
        }
        this.answer(msg.id, "close", true, null);
      })
      .catch((error) => {
        this.answer(msg.id, "close", null, error);
      })
  }

  private saveSearch(search, previous) {
    search.status = "Closed";
    if (previous.especOne.toUpperCase() !== search.especOne.toUpperCase() ||
      previous.especTwo.toUpperCase() !== search.especTwo.toUpperCase()) {
      search.changed = true;
    }
    search.save();
  }

  private close(msg) {
    if (msg.source_id === this.id) return;
    this.model.find(msg.data.success)
      .select('especOne especTwo status previousSearch changed code')
      .populate({
        path: 'previousSearch',
        select: 'especOne especTwo'
      })
      .then((ret: any) => {
        for (let i = 0; i < ret.length; i++) {
          if (!ret[i].previousSearch) {
            return this.getPreviousSearch(msg, ret, i);
          }
          this.saveSearch(ret[i], ret[i].previousSearch);
        }
        this.answer(msg.id, "close", true, null);
      })
      .catch((error) => {
        this.answer(msg.id, "close", null, error);
      })
  }

  get model() {
    return Model;
  }

  get event_name() {
    return 'search';
  }
}