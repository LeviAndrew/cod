import {BasicRest} from "../BasicRest";
import {CommonHandler} from "../../handlers/user/CommonHandler";
import Handler from "../../handlers/user/CommonHandler";
import * as multer from 'multer';
import * as path from 'path'

export class CommonRest extends BasicRest {
  protected _handler: CommonHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      get: {
        '/common/sourceReadOfResearcher': this.sourceReadOfResearcher.bind(this),
        '/common/getSearches': this.getSearches.bind(this),
      },
      post: {
        '/common/:metodo': this.callCommonAction.bind(this),
        '/logout': this.logout.bind(this),
      }
    };

    this.wiring();
  }

  set handler(value: CommonHandler) {
    this._handler = value;
  }

  get handler(): CommonHandler {
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }

  private async callCommonAction(request, response) {
    let ret = await this.handler[request.params.metodo]({
      data: request.body,
      auth: request.headers["authentication-key"],
    });;
    return response
      .status(200)
      .send(ret);
  }

  private async sourceReadOfResearcher(req, res) {
    let ret = await this.handler.sourceReadOfResearcher({
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

  private async getSearches(req, res) {
    let ret = await this.handler.getSearches({
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

  async logout(req, res) {
    let ret = await this.handler.logout();
    return res
    .status(200)
    .send(ret);
  }

}