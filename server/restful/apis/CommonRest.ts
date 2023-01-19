import {BasicRest} from "../BasicRest";
import {CommonHandler} from "../../handlers/user/CommonHandler";
import Handler from "../../handlers/user/CommonHandler";
import * as HTTPStatus from 'http-status-codes';
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
    try {
      let ret = await this.handler[request.params.metodo]({
        data: request.body,
        auth: request.headers["authentication-key"],
      });
      return response
        .status(HTTPStatus.OK)
        .send(ret);
    } catch (e) {
      response
        .status(HTTPStatus.UNAUTHORIZED)
        .send(e);
    }     
  }

  private async sourceReadOfResearcher(request, response) {
    try {
      let ret = await this.handler.sourceReadOfResearcher({
        auth: request.headers["authentication-key"],
      });
      return response
        .status(HTTPStatus.OK)
        .send(ret);
    } catch (e) {
      response
        .status(HTTPStatus.UNAUTHORIZED)
        .send(e);
    }   
  }

  private async getSearches(request, response) {
    try {
      let ret = await this.handler.getSearches({
        auth: request.headers["authentication-key"],
      });
      return response
        .status(HTTPStatus.OK)
        .send(ret);
    } catch (e) {
      response
        .status(HTTPStatus.UNAUTHORIZED)
        .send(e);
    }   
  }

  async logout(request, response) {
    try {
      let ret = await this.handler.logout();
      return response
        .status(HTTPStatus.OK)
        .send(ret);
    } catch (e) {
      response
        .status(HTTPStatus.UNAUTHORIZED)
        .send(e);
    }    
  }

}