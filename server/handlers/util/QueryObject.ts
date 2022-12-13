export class QueryObject {
  private _query: Object;
  private _limit: number;
  private _select: string;
  private _populate: Object | Object[];
  private _page: number;
  private _id: string;
  private _sort: object;

  constructor(query?: Object, select?: string, populate?: Object | Object[], limit?: number, page?: number, sort?: object) {
    this.query = query;
    this.select = select;
    this.populate = populate || "";
    this.limit = limit;
    this.page = page;
    this.sort = sort;
  };

  set sort(sort) {
    this._sort = sort;
  }

  get sort() {
    return this._sort;
  }

  set id(id) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  set query(query) {
    this._query = query;
    if (typeof query !== "object") {
      this.id = query;
      this._query = null;
    }
  }

  get query() {
    return this._query;
  }

  set limit(limit) {
    if (limit) {
      limit = typeof limit === 'number' ? limit : parseInt(limit);
    }

    this._limit = limit;
  }

  get limit() {
    return this._limit;
  }

  set select(seletc) {
    this._select = seletc;
  }

  get select() {
    return this._select;
  }

  set populate(populate) {
    this._populate = this.handler_populate(populate);
  }

  get populate() {
    return this._populate;
  }

  set page(page) {
    this._page = page;
  }

  get page() {
    return this._page;
  }

  handler_populate(populate) {
    if(Array.isArray(populate)){
      for(let i = 0; i < populate.length; i++){
        if (populate[i].hasOwnProperty('select')) populate[i].select = 'id ' + populate[i].select;
        if (populate[i].hasOwnProperty('populate')) populate[i].populate = this.handler_populate(populate[i].populate);
      }
    } else {
      if (populate.hasOwnProperty('select')) populate.select = 'id ' + populate.select;
      if (populate.hasOwnProperty('populate')) populate.populate = this.handler_populate(populate.populate);
    }
    return populate;
  }
}