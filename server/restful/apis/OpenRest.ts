import {BasicRest} from "../BasicRest";
import {OpenHandler} from "../../handlers/user/OpenHandler";
import Handler from "../../handlers/user/OpenHandler";
import * as path from "path";

export class OpenRest extends BasicRest {
  protected _handler: OpenHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      get: {
        '/open/baseBasketUpdate': this.getBaseBasketUpdate.bind(this),
        '/open/searchXLS': this.getSearchXLS.bind(this),
        '/open/defaultReviewXLS': this.getDefaultReviewXLS.bind(this),
        '/open/reviewXLSX': this.getReviewXLSX.bind(this),
        '/open/reportXLSX': this.getReportXLSX.bind(this),
      },
      post: {
        "/login": this.login.bind(this),
      }
    };

    this.wiring();
  }

  set handler(value: OpenHandler) {
    this._handler = value;
  }

  get handler(): OpenHandler {
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }

  private getBaseBasketUpdate(req, res) {
    return res.download(path.resolve('resources/baseBasketUpdate.xlsx'));
  }

  private async getSearchXLS(request, response) {
    let ret = await this.handler.xlsxGenerator(request.query);
    if (ret) {
      return response.xls(ret.docName, ret.xls);
    }
    return response.xls('Pesquisa.xlsx', [{"Erro aqui": 'Pegadinha do malandro, não encontramos os dados.'}])
  }

  private getDefaultReviewXLS(request, response) {
    return response.download(path.resolve('resources/baseCriticaImport.xlsx'));
  }

  private async getReviewXLSX(request, response) {
    let ret = await this.handler.getReviewXLSX(request.query);
    let docName = `Review_${request.query.year}_${request.query.month}.xlsx`;
    if (!ret.success) {
      return response.xls(docName, [{"Mensagem de erro": ret.data}])
    }
    return response.xls(docName, ret.data);
  }

  private async getReportXLSX(request, response) {
    let ret = await this.handler.getReportXLSX(request.query);
    let docName = `Report_${request.query.year}_${request.query.month}.xlsx`;
    if (!ret.success) {
      return response.xls(docName, [{"Mensagem de erro": ret.data}])
    }
    return response.xls(docName, ret.data);
  }

  private async login(request, response) {
    let ret = await this.handler.logar({
      email: request.body.login,
      password: request.body.password,
    });
    response
      .status(200)
      .send(ret);
  }

}