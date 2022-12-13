import {BasicHandler} from "../BasicHandler";
import {Types} from "mongoose";
import {QueryObject} from "../util/QueryObject";

export class OpenHandler extends BasicHandler {

  public async logar(dados_login: object) {
    let ret = await this.emit_to_server('db.user.login', dados_login);
    return await this.returnHandler({
      model: 'user',
      data: ret.data,
    });
  }

  public async xlsxGenerator(data){
    if(!Types.ObjectId.isValid(data.userId) || !Types.ObjectId.isValid(data.sourceId)) return false;
    let searchRet = await this.getSearch({
      user: new Types.ObjectId(data.userId),
      source: new Types.ObjectId(data.sourceId),
      status: {
        $ne: "Closed",
      }
    });
    if(searchRet.data.error || !searchRet.data.success.length) return false;
    return this.formatToXLS(searchRet.data.success[0]);
  }

  public async getReviewXLSX(data){
    let user = await this.emit_to_server('db.user.read', new QueryObject(data.userId, 'type'));
    if(user.data.error || !user.data.success.type || user.data.success.type !== 'admin'){
      return await this.returnHandler({
        model: 'review',
        data: {error: 'reviewXLSXUnauthorized'},
      })
    }
    let ret = await this.getSearchesInLIne({
      region: data.regionId,
      year: data.year,
      month: data.month,
    });
    return await this.returnHandler({
      model: 'review',
      data: {success: this.toJsonReview(ret.data)},
    });
  }

  public async getReportXLSX(data){
    let ret = await this.readReport({regionId: data.regionId, date: {year: data.year, month: data.month}});
    if(ret.success){
      return await this.returnHandler({
        model: 'report',
        data: {success: this.toJsonReport(ret.data)},
      });
    }
    return;
  }

  private toJsonReport(report){
    let ret = [];
    for(let i = 0; i < report.length; i++){
      let obj = {};
      obj['Codigo'] = report[i].code;
      obj['Ponderador anterior'] = report[i].previousWeight;
      obj['IPC'] = report[i].ipc;
      obj['Ponderador atual'] = report[i].weight;
      obj['Grupo 1'] = report[i].group1;
      obj['Grupo 2'] = report[i].group2;
      obj['Grupo 3'] = report[i].group3;
      obj['Grupo 4'] = report[i].group4;
      obj['Produto'] = report[i].productName;
      ret.push(obj)
    }
    return ret;
  }

  private getSearchesAmount(searches){
    let ret = 1;
    for(let i = 0; i < searches.length; i++){
      ret = ret > searches[i].searchNumber ? ret : searches[i].searchNumber;
    }
    return ret;
  }

  private toJsonReview(searches){
    let searchesAmount = this.getSearchesAmount(searches);
    let baseObject = {};
    baseObject["Codigo produto"] = '';
    baseObject["Produto ou servico"] = '';
    baseObject["Especificacao 1"] = '';
    baseObject["Especificacao 2"] = '';
    for(let i = 1; i <= searchesAmount; i++){
      baseObject[`Pesquisa ${i} valor`] = '';
      baseObject[`Pesquisa ${i} mudouEspec`] = '';
    }
    baseObject["Fonte"] = '';
    baseObject["Codigo pesquisa"] = '';
    let ret = [];
    for(let i = 0; i < searches.length; i++){
      for (let a = 0; a < searches[i].searches.length; a++){
        let obj = Object.assign({}, baseObject);
        obj["Codigo produto"] = searches[i].product.code;
        obj["Produto ou servico"] = searches[i].product.name;
        obj["Especificacao 1"] = searches[i].searches[a].especOne;
        obj["Especificacao 2"] = searches[i].searches[a].especTwo;
        obj["Fonte"] = searches[i].searches[a].source.name;
        obj["Codigo pesquisa"] = searches[i].searches[a].code;
        this.setValueChanged(searches[i].searchNumber, searches[i].searches[a], obj);
        ret.push(obj);
      }
    }
    return ret;
  }

  private setValueChanged(searchNumber, search, baseToSet){
    baseToSet[`Pesquisa ${searchNumber} valor`] = search.price;
    baseToSet[`Pesquisa ${searchNumber} mudouEspec`] = search.changed ? "S" : "N";
    if(search.previousSearch){
      this.setValueChanged(searchNumber-1, search.previousSearch, baseToSet);
    }
    return true;
  }

  private formatToXLS(data){
    let semiRet = data.search.map((item)=>{
      return {
        Codigo: item.code,
        Produto: item.name,
        Especificacao_1: item.especOne,
        Especificacao_2: item.especTwo,
        Preco: item.price,
      };
    });
    return {
      docName: `${data._id.code} ${data._id.name}.xlsx`,
      xls: semiRet,
    };
  }

}

export default new OpenHandler();