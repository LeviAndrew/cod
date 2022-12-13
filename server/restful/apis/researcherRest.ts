import {BasicRest} from "../BasicRest";
import {CommonHandler} from "../../handlers/user/CommonHandler";
import Handler from "../../handlers/user/CommonHandler";
import * as multer from 'multer';
import * as path from 'path'

export class ResearcherRest extends BasicRest {
  protected _handler: CommonHandler;

  constructor(router) {
    super(router, Handler);

    this.routes = {
      get: {
        '/research/searches/:userId': this.getSearches.bind(this),
        '/research/sources/:userId': this.getSources.bind(this),
        '/research/sourceResearches/:userId/:sourceId': this.getResearchesBySource.bind(this),
      },
      post: {
        '/research/uploadProfileImage/:userId': this.uploadProfileImage.bind(this),
        '/research/updateBasicInfo/:userId': this.updateBasicInfo.bind(this),
        '/research/sendResearches/:userId': this.sendResearch.bind(this),
        '/research/searchSave': this.searchSave.bind(this),
        '/research/saveNewOrder': this.saveNewOrder.bind(this),
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

  private async getSearches(req, res) {
    let ret = await this.handler.getSearches(req.params.userId);
    return res
      .status(200)
      .send(ret);
  }

  private async getSources(req, res) {
    let ret = await this.handler.sourceReadOfResearcher(req.params.userId);
    return res
      .status(200)
      .send(ret);
  }

  private async getResearchesBySource(req, res) {
    let ret = await this.handler.getSearchesBySource(req.params.userId, {sourceId: req.params.sourceId});
    return res
      .status(200)
      .send(ret);
  }

  private async uploadProfileImage(req, res) {
    let source = await this.handler.getUserPath(req.params.userId);
    if (!source.success) return res.status(200).send(source);
    multer({
      storage: multer.diskStorage({
        destination: (req, file, callback) => {
          callback(null, source.data);
        },
        filename(req: any, file, callback) {
          callback(null, `${req.params.userId}${path.extname(file.originalname)}`);
        }
      })
    })
      .single('profileImage')
      (req, res, async error => {
        let ret = await this.handler.saveImagePath(
          path.extname(req.file.originalname), req.params.userId,);
        return res
          .status(200)
          .send(ret);
      });
  }

  private async updateBasicInfo(req, res) {
    let ret = await this.handler.userChangeInfos(req.params.userId, req.body);
    return res
      .status(200)
      .send(ret);
  }

  private async sendResearch(req, res) {
    let ret = await this.handler.userSearchesSend(req.params.userId);
    return res
      .status(200)
      .send(ret);
  }

  private async searchSave(req, res) {
    let ret = await this.handler.userSearchesSave(req.body);
    return res
      .status(200)
      .send(ret);
  }

  private async saveNewOrder(req, res) {
    let ret = await this.handler.saveNewOrder(req.body);
    return res
      .status(200)
      .send(ret);
  }

}