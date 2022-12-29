import {BasicRest} from "../BasicRest";
import {AdminHandler} from "../../handlers/user/AdminHandler";
import Handler from "../../handlers/user/AdminHandler";
import * as multer from 'multer';
import * as path from 'path'

export class AdminRest extends BasicRest {
  protected _handler: AdminHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      get: {
        // '/research/searches/:userId': this.getSearches.bind(this),
        '/admin/addressByZipCode/:zipCode': this.addressByZipCode.bind(this),
      },
      post: {
        '/admin/region_create': this.regionCreate.bind(this),
        '/admin/region_update': this.regionUpdate.bind(this),
        '/admin/import_basket': this.importBasket.bind(this),
        // '/research/uploadProfileImage/:userId': this.uploadProfileImage.bind(this),
      }
    };

    this.wiring();
  }

  set handler(value: AdminHandler) {
    this._handler = value;
  }

  get handler(): AdminHandler {
    return this._handler;
  }

  set routes(rotas) {
    this._routes = rotas;
  }

  get routes() {
    return this._routes;
  }

  private async getSearches(req, res) {  // remover
    let ret = await this.handler.getSearches(req.params.userId);
    return res
      .status(200)
      .send(ret);
  }

  private async addressByZipCode(req, res) {
    let ret = await this.handler.addressByZipCode({
      zipCode: req.params.zipCode,
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

  private async regionCreate(req, res) {
    let ret = await this.handler.regionCreate({
      data: req.body,
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

  private async regionUpdate(req, res) {
    let ret = await this.handler.regionUpdate({
      data: req.body,
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

  private async importBasket(req, res) {
    let ret = await this.handler.importBasket({
      data: req.body,
      auth: req.headers["authentication-key"],
    });
    return res
      .status(200)
      .send(ret);
  }

}