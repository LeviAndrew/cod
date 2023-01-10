import * as BBPromise from "bluebird";
import {Source} from "../events/Source";
import {Util} from "../util/Util";
import {QueryObject} from "./util/QueryObject";
import {Types} from "mongoose";

export class BasicHandler extends Source {

  constructor() {
    super();
  }

  /**
   * Funcao responsavel por fazer o envio de msg pra o hub, para quem estiver
   * escutando determinado evento.
   *
   * @param event
   * @param dado
   * @returns {<any>}
   */
  protected emit_to_server(event, dado): BBPromise<any> {
    return this.hub.send(this, event, {success: dado, error: null,}).promise;
  }

  /**
   * Verifica os erros de validacao e retorna o correspondente.
   *
   * @param model
   * @param errors
   * @returns {Promise<[any , any , any , any , any , any , any , any , any , any]>}
   */
  private async getErrorsValidation(model, errors) {
    let errorsArray = [];
    for (let attr in errors) {
      if (errors.hasOwnProperty(attr) && !errors[attr].errors) {
        errorsArray.push(Util.getErrorByLocale('pt-Br', model, errors[attr].message));
      }
    }
    return await Promise.all(errorsArray);
  }

  private async getErrorsDuplicationKey(model, msgError) {
    let key = `duplicated.${msgError.slice(msgError.indexOf('index:') + 7, msgError.indexOf('_1 dup'))}`;
    return await Util.getErrorByLocale('pt-Br', model, key);
  }

  private async getErrorsByLocale(model, msgError) {
    return await Util.getErrorByLocale("pt-Br", model, msgError);
  }

  /**
   * Verifica o tipo de erro e pega o padrao de erro correspondente.
   *
   * @param {string} model
   * @param error
   * @returns {Promise<any>}
   */
  private async getError(model: string, error: any) {
    if (typeof error === 'string') {
      return await this.getErrorsByLocale(model, error);
    } else if (typeof error === 'object') {
      if (error.hasOwnProperty('name')) {
        if (error.name === "ValidationError") {
          return await this.getErrorsValidation(model, error.errors);
        } else if (error.name === 'MongoError') {
          if (error.code && error.code === 11000) {
            return await this.getErrorsDuplicationKey(model, error.errmsg);
          }
        } else if (error.name === 'CastError') {
          return await this.getErrorsByLocale(model, `${error.reason.name}.${error.reason.path}.${error.reason.kind}`);
        }
      } else if (error.hasOwnProperty('index') && error.hasOwnProperty('msg')) {
        let errorReturn = await this.getErrorsByLocale(model, error.msg);
        errorReturn.description = errorReturn.description + error.index;
        return errorReturn;
      }
    }
  }

  /**
   * Funcao responsave por fazer tratamento de retornos, antes de serem
   * enviados para o cliente.
   * Se conter erro, busca o erro correspondente.
   *
   * @returns {Promise<{success, data}>}
   * @param ret
   */
  async returnHandler(ret: { model: string, data: any }) {
    if (ret.data.error) {
      return {
        success: false,
        data: await this.getError(ret.model, ret.data.error),
      };
    }
    return {
      success: true,
      data: ret.data.success
    };
  }

  async updateValidator(data) {
    if (!data.id) return await this.returnHandler({
      model: 'global',
      data: {
        error: 'update.idRequired'
      }
    });
    if (!data.update || !Object.keys(data.update).length) return await this.returnHandler({
      model: 'global',
      data: {
        error: 'update.updateRequire'
      }
    });
    return {
      success: true,
    };
  }

  /**
   * Aggregate padrão para a busca da das pesquisas.
   *
   * @param query
   * @returns {Promise<any>}
   */
  protected async getSearch(query) {
    return this.emit_to_server('db.search.aggregate', [
      {
        $match: query,
      },
      {
        $lookup:
          {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product"
          }
      },
      {
        $unwind: "$product"
      },
      {
        $addFields: {
          name: "$product.name",
          code: "$product.code"
        }
      },
      {
        $lookup:
          {
            from: "sources",
            localField: "source",
            foreignField: "_id",
            as: "source"
          }
      },
      {
        $unwind: "$source"
      },
      {
        $project: {
          "source.code": 1,
          "source.id": 1,
          "source.name": 1,
          "name": 1,
          "code": 1,
          "especOne": 1,
          "especTwo": 1,
          "price": 1,
          "id": 1,
          "previousSearch": 1,
          "status": 1,
          "searchChecked": 1,
          "promotion": 1,
          "barCode": 1,
          "itemIndex": 1,
        }
      },
      {
        $sort:
          {
            "code": 1,
          }
      },
      {
        $group: {
          _id: "$source",
          search: {
            $push: "$$ROOT"

          }
        }
      }
    ]);
  }

  protected async getSearchesByProductCode(userId, data) {
    return await this.emit_to_server('db.search.aggregate', [
      {
        $match: {
          user: new Types.ObjectId(userId),
          status: {
            $ne: "Closed",
          }
        }
      },
      {
        $lookup:
          {
            from: "products",
            localField: "product",
            foreignField: "_id",
            as: "product"
          }
      },
      {
        $unwind: "$product"
      },
      {
        $addFields: {
          name: "$product.name",
          code: "$product.code"
        }
      },
      {
        $lookup:
          {
            from: "sources",
            localField: "source",
            foreignField: "_id",
            as: "source"
          }
      },
      {
        $unwind: "$source"
      },
      {
        $project: {
          "source.code": 1,
          "source.id": 1,
          "source.name": 1,
          "name": 1,
          "code": 1,
          "especOne": 1,
          "especTwo": 1,
          "price": 1,
          "id": 1,
          "previousSearch": 1,
          "status": 1,
          "searchChecked": 1,
        }
      },
      {
        $match: {
          code: data.productCode,
        }
      },
      {
        $sort:
          {
            "code": 1,
          }
      },
      {
        $group: {
          _id: "$source",
          search: {
            $push: "$$ROOT"

          }
        }
      }
    ]);
  }

  /**
   * Recebe as pesquisas de um review e todos os productsSearch referente a ela e os anteriores a ela.
   *
   * @returns {Promise<any>}
   * @param data
   */
  protected async getSearchesInLIne(data: { region: string, year: number, month: number }) {
    let ret = await Promise.all([
      this.emit_to_server('db.review.read', new QueryObject(
        {
          region: data.region,
          year: data.year,
          month: data.month,
        },
        "searches",
        {
          path: "searches",
          select: "id product searchNumber searches",
        }
      )),
      this.getPreviousSearches({
        regionId: data.region,
        year: data.year,
        month: data.month
      }),
    ]);
    let searchInLine = null;
    if (!ret[1].data.success[0]) {
      searchInLine = await this.getPreviousSearchInLine(ret[0].data.success[0].searches, data.region);
    } else {
      let searches = await Promise.all([
        this.getPreviousSearchInLine(ret[0].data.success[0].searches, data.region),
        this.mappingSearchesByCode(ret[1].data.success[0].searches)
      ]);
      this.setPreviousValue(searches[0].data.success, searches[1]);
      searchInLine = searches[0];
    }
    return await this.returnHandler({
      model: 'review',
      data: searchInLine.data,
    });
  }

  protected async getSearchesInLIneFilter(searchesFilter, data: { regionId: string, year: number, month: number }) {
    let previous = await this.getPreviousSearches({
      regionId: data.regionId,
      year: data.year,
      month: data.month
    });
    let searches;
    if (previous.data.success.length !== 0) {
      searches = await Promise.all([
        this.getPreviousSearchInLine(searchesFilter, data.regionId),
        this.mappingSearchesByCode(previous.data.success[0].searches)
      ]);
      this.setPreviousValue(searches[0].data.success, searches[1]);
    } else {
      searches = await Promise.all([
        this.getPreviousSearchInLine(searchesFilter, data.regionId)
      ]);
    }
    // searches = await Promise.all([
    //   this.getPreviousSearchInLine(searchesFilter, data.regionId),
    //   this.mappingSearchesByCode(previous.data.success[0].searches)
    // ]);
    // this.setPreviousValue(searches[0].data.success, searches[1]);
    return searches[0];
  }

  private setPreviousValue(currentSearches, previousSearches) {
    if (!previousSearches.size) return;
    for (let p = 0; p < currentSearches.length; p++) {
      for (let s = 0; s < currentSearches[p].searches.length; s++) {
        let previousSearch = previousSearches.get(currentSearches[p].searches[s].code);
        this.setPreviousValueFirst(currentSearches[p].searches[s], previousSearch);
      }
    }
  }

  private setPreviousValueFirst(search, previousValues, variance = 0) {
    if (!previousValues) {
      previousValues = {};
    }
    if (search.previousSearch) {
      if (search.previousSearch.price) variance += Math.abs((search.price / search.previousSearch.price) - 1);
      this.setPreviousValueFirst(search.previousSearch, previousValues, variance);
    } else {
      if (previousValues.price) variance += Math.abs((search.price / previousValues.price) - 1);
      search[`variance`] = variance.toFixed(3);
      search[`previousValue`] = previousValues.price;
      search[`previousChanged`] = previousValues.changed ? "S" : "N";
    }
  }

  private mappingSearchesByCode(searches) {
    let ret = new Map();
    for (let p = 0; p < searches.length; p++) {
      for (let s = 0; s < searches[p].searches.length; s++) {
        ret.set(searches[p].searches[s].code, searches[p].searches[s]);
      }
    }
    return ret;
  }

  protected async getPreviousSearches(data): Promise<any> {
    let previousDate = this.getPreviousDate(data);
    const obj = new QueryObject(
      {
        region: data.regionId,
        year: previousDate.year,
        month: previousDate.month,
      },
      'searches',
      {
        path: 'searches',
        select: 'searches',
        populate: {
          path: 'searches',
          select: 'code especOne especTwo price changed'
        }
      }
    );
    const ret = await this.emit_to_server('db.review.read', obj);
    return ret
  }

  protected getPreviousDate(date) {
    if (date.month == 1) return {
      month: 12,
      year: date.year - 1,
    };
    return {
      month: date.month - 1,
      year: date.year,
    };
  }

  /**
   * Monta query de pesquisa pela funcao getDatasInline.
   * Adiciona o populate do produto.
   * Executa o read no banco de productsearch.
   *
   * @param searches
   * @param regionId
   * @returns {Promise<any>}
   */
  protected async getPreviousSearchInLine(searches, regionId) {
    let toGetInline = this.getDatasInLine(searches);
    toGetInline.populate.path = toGetInline.populate.path + ' product';
    toGetInline.populate.select = `source ${toGetInline.populate.select}`;
    let rets = await Promise.all([
      this.emit_to_server('db.productsearch.read', new QueryObject(
        toGetInline.query,
        toGetInline.select,
        toGetInline.populate
      )),
      this.emit_to_server('db.region.read', new QueryObject(
        regionId,
        'sources',
        {
          path: 'sources',
          select: 'code id name',
        }
      ))
    ]);
    this.insertSourceOnSearches(rets);
    return rets[0];
  }

  /**
   * Cria a query o select e o pupulate necessario para fazer a busca das pesquisas.
   *
   * @param data
   * @returns {any}
   */
  protected getDatasInLine(data) {
    let query = {
      _id: {
        $in: [],
      }
    };
    let mostSearched = -2;
    for (let i = 0; i < data.length; i++) {
      mostSearched = mostSearched < data[i].searchNumber ? data[i].searchNumber : mostSearched;
      query._id.$in.push(data[i].id);
    }
    let populate: any = {
      path: 'searches',
      select: 'especOne especTwo price previousSearch name code changed reviewChecked status promotion barCode position'
    };
    let select = 'searches product searchNumber status changed';
    if (mostSearched > 1) this.insertPopulate(populate, mostSearched - 2);
    let ret: any = {
      query,
      select,
      populate,
    };
    return ret;
  }

  /**
   * Recebe as pesquisas, e coloca neas as fontes onde foram feitas.
   *
   * @param data
   */
  protected insertSourceOnSearches(data) {
    let fonts = this.mapSources(data[1].data.success.sources);
    for (let i = 0; i < data[0].data.success.length; i++) {
      if (data[0].data.success[i].searches) {
        for (let s = 0; s < data[0].data.success[i].searches.length; s++) {
          data[0].data.success[i].searches[s].source = fonts[data[0].data.success[i].searches[s].source.toString()];
        }
      }
    }
  }

  /**
   * Monta o populate com base nas quantidades passadas por paremetro.
   * Serve para buscar as pesquisas anteriores.
   *
   * @param populate
   * @param repeat
   * @returns {any}
   */
  protected insertPopulate(populate, repeat) {
    populate['populate'] = Object.assign({}, populate);
    populate.populate.model = "search";
    populate.populate.path = "previousSearch";
    if (repeat) return this.insertPopulate(populate.populate, repeat - 1);
    return populate;
  }

  /**
   * Mapeia as fontes passadas em um array para um objeto onde a chave é o id e o value é a própria fonte.
   * @param sources
   * @returns {{}}
   */
  protected mapSources(sources) {
    let ret = {};
    for (let i = 0; i < sources.length; i++) {
      ret[sources[i].id] = sources[i];
    }
    return ret;
  }

  public async readReport(data) { // metodo enviado para o AdminHandler
    let date: any = data.date;
    if (!data.date) {
      date = await this.readReviewDate(data);
      if (!date.success) return this.returnHandler({
        model: 'report',
        data: {error: "dateNotFound"},
      });
      date = date.data[0];
    }
    let report = await this.emit_to_server('db.report.read', new QueryObject(
      {
        region: data.regionId,
        year: date.year,
        month: date.month,
        removed: false,
      },
      'calculatedProducts groups month year',
      {
        path: 'calculatedProducts groups',
        select: 'id ipc previousWeight product weight name node nodeSon products',
        populate: {
          path: 'product',
          model: 'product',
          select: 'id code name'
        }
      }
    ));
    let ret = this.tableHandler(report.data.success[0]);
    return await this.returnHandler({
      model: 'report',
      data: {
        success: ret,
      }
    });
  }

  public async readReviewDate(data) { // metodo enviado para o AdminHandler
    let ret = await this.emit_to_server('db.review.read', new QueryObject(
      {
        region: data.regionId
      },
      "year month",
      null, 2, null,
      {
        year: -1,
        month: -1,
      }
    ));
    return await this.returnHandler({
      model: 'review',
      data: ret.data,
    });
  }

  private tableHandler(report) { // metodo enviado para o AdminHandler (tableHandlerAdmin)
    let mapCalculatedProducts = this.mapCalculatedProducts(report.calculatedProducts);
    return this.mountTree(report.groups, mapCalculatedProducts);
  }

  protected mapCalculatedProducts(calculatedProducts) {
    let mapCalculatedProducts = {};
    for (let i = 0; i < calculatedProducts.length; i++) {
      mapCalculatedProducts[calculatedProducts[i].product.id] = calculatedProducts[i];
    }
    return mapCalculatedProducts;
  }

  protected mountTree(groups, mapCalculatedProducts) {
    let groupsMap = {};
    let groupsRoot = {};
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].node) {
        groupsMap[groups[i].id] = groups[i];
      } else {
        for (let p = 0; p < groups[i].products.length; p++) {
          groups[i].products[p] = mapCalculatedProducts[groups[i].products[p].toString()];
        }
        groupsRoot[groups[i].id] = groups[i];
      }
    }
    return this.getReportLines(groupsRoot, groupsMap, mapCalculatedProducts);
  }

  protected getReportLines(groupsRoot, groupsMap, mapCalculatedProducts) {
    let ret = [];
    for (let group in groupsRoot) {
      if (groupsRoot.hasOwnProperty(group)) {
        let column = {group1: groupsRoot[group].name};
        ret = ret.concat(this.getGroupLine(column, groupsRoot[group].nodeSon, groupsMap, mapCalculatedProducts));
      }
    }
    return ret;
  }

  protected getGroupLine(column, groupsId, groupsMap, mapCalculatedProducts, index: number = 2) {
    let ret = [];
    for (let i = 0; i < groupsId.length; i++) {
      let group = groupsMap[groupsId[i].toString()];
      let columnClone = {};
      columnClone[`group${index}`] = group.name;
      columnClone = Object.assign(columnClone, column);
      if (group.nodeSon.length) {
        ret = ret.concat(this.getGroupLine(columnClone, group.nodeSon, groupsMap, mapCalculatedProducts, index + 1));
      } else {
        ret = ret.concat(this.getLine(columnClone, group.products, mapCalculatedProducts));
      }
    }
    return ret;
  }

  protected getLine(column, groupProducts, mapCalculatedProducts) {
    let ret = [];
    for (let i = 0; i < groupProducts.length; i++) {
      let calculatedProduct = mapCalculatedProducts[groupProducts[i].toString()];
      let line = {
        code: calculatedProduct.product.code,
        productName: calculatedProduct.product.name,
        previousWeight: calculatedProduct.previousWeight,
        weight: calculatedProduct.weight,
        ipc: calculatedProduct.ipc,
      };
      ret.push(Object.assign(line, column));
    }
    return ret;
  }

}