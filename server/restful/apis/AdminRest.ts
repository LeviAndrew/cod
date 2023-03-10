import {BasicMulterRest} from "../BasicMulterRest";
import {AdminHandler} from "../../handlers/user/AdminHandler";
import Handler from "../../handlers/user/AdminHandler";
import * as HTTPStatus from 'http-status-codes';
import * as multer from 'multer';
import * as path from 'path'
import { OpenRest } from "./OpenRest";
import {Types} from "mongoose";

export class AdminRest extends BasicMulterRest {
  protected _handler: AdminHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      get: {
        // '/research/searches/:userId': this.getSearches.bind(this),
        '/admin/addressByZipCode/:zipCode': this.addressByZipCode.bind(this),
        '/admin/:metodo': this.callAdminAction.bind(this),
        '/admin/searchesByProduct/:productId': this.callSearchesByProduct.bind(this),
      },
      post: {
        // '/research/uploadProfileImage/:userId': this.uploadProfileImage.bind(this),
        // '/admin/region_create': this.regionCreate.bind(this),
        // '/admin/region_update': this.regionUpdate.bind(this),
        // '/admin/import_basket': this.importBasket.bind(this),
        // '/admin/source_create': this.sourceCreate.bind(this),
        '/admin/:metodo': this.callAdminAction.bind(this),
        '/admin/import/importReview': this.getImportReview.bind(this),
        '/logout': this.logout.bind(this),
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

  private async callAdminAction(request, response) {
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

  private async getImportReview(request, response) {
    try{
      const dest = path.resolve(`resources/tmp/`), documentName = new Types.ObjectId().toString();
      this.configureSingleMulter({
        acceptedTypes: [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/octet-stream"
        ],
        fieldName: 'criticaDocument',
        dest,
        documentName,
      })(request, response, async error => {
        if(error) {
          let message = "criticaDocument";
          if(error.message) message = error.message;
          return response
            .status(HTTPStatus.OK)
            .send({success: false, data: message});
        }
        let ret = await this.handler.importReview({
          auth: request.headers['authentication-key'],
          aKey: request.headers['access-key'],
          data: {
            extname: path.extname(request.file.originalname),
            documentName,
            dest,
            regionId: request.query.regionId,
            year: request.query.year,
            month: request.query.month
          },
        });
        response
          .status(HTTPStatus.OK)
          .send(ret);
      });
    } catch (e) {
      response
        .status(HTTPStatus.UNAUTHORIZED)
        .send(e);
    }    
  }

  private async addressByZipCode(request, response) {
    try {
      let ret = await this.handler.addressByZipCode({
        zipCode: request.params.zipCode,
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

  private async callSearchesByProduct(request, response) {
    try {
      let ret = await this.handler.searchesByProduct({
        data: request.params,
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

  // private async getSearches(req, res) {  // remover
  //   let ret = await this.handler.getSearches(req.params.userId);
  //   return res
  //     .status(200)
  //     .send(ret);
  // }

  // private async regionCreate(req, res) {
  //   let ret = await this.handler.regionCreate({
  //     data: req.body,
  //     auth: req.headers["authentication-key"],
  //   });
  //   return res
  //     .status(200)
  //     .send(ret);
  // }

  // private async regionUpdate(req, res) {
  //   let ret = await this.handler.regionUpdate({
  //     data: req.body,
  //     auth: req.headers["authentication-key"],
  //   });
  //   return res
  //     .status(200)
  //     .send(ret);
  // }

  // private async importBasket(req, res) {
  //   let ret = await this.handler.importBasket({
  //     data: req.body,
  //     auth: req.headers["authentication-key"],
  //   });
  //   return res
  //     .status(200)
  //     .send(ret);
  // }

}