import {BasicRTC} from '../BasicRTC';
import {CommonHandler} from '../../handlers/user/CommonHandler';
import Handler from "../../handlers/user/CommonHandler"
import {OpenRTC} from "../OpenRTC";

export class CommonRTC extends BasicRTC {
  private _loggedUser;

  /**
   * Recebe o socketId passado pelo client.
   *
   * @param conf
   */
  constructor(conf, msg, openRTC) {
    super('common', Handler, conf);

    openRTC.destroy();
    this.interfaceListeners = {
      'logout': this.logout.bind(this),
      'user_change_infos': this.userChangeInfos.bind(this),
      'source_read_of_researcher': this.sourceReadOfResearcher.bind(this),
      'get_searches': this.getSearches.bind(this),
      'get_searches_by_source': this.getSearchesBySource.bind(this),
      'user_searches_save': this.userSearchesSave.bind(this),
      'user_searches_send': this.userSearchesSend.bind(this),
      'readSearchesByProductCode': this.readSearchesByProductCode.bind(this),
    };
    this.loggedUser = msg.datas.data;
    this.emit_to_browser(msg);
    this.wiring();
  }

  set loggedUser(loggedUser) {
    this._loggedUser = loggedUser;
  }

  get loggedUser() {
    return this._loggedUser;
  }

  set handler(handler: CommonHandler) {
    this._handler = handler;
  }

  get handler(): CommonHandler {
    return this._handler;
  }

  set interfaceListeners(interfaceListeners: object) {
    this._interfaceListeners = interfaceListeners;
  }

  get interfaceListeners(): object {
    return this._interfaceListeners;
  }

  async logout(msg) {
    msg.datas = await this.handler.logout();
    new OpenRTC(this.config);
    this.emit_to_browser(msg);
    this.destroy();
  }

  private async userChangeInfos(msg){
    msg.datas = await this.handler.userChangeInfos(this.loggedUser.id, msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceReadOfResearcher(msg){
    msg.datas = await this.handler.sourceReadOfResearcher(this.loggedUser.id);
    this.emit_to_browser(msg);
  }

  private async getSearches(msg) {
    msg.datas = await this.handler.getSearches(this.loggedUser.id);
    this.emit_to_browser(msg);
  }

  private async getSearchesBySource(msg) {
    msg.datas = await this.handler.getSearchesBySource(this.loggedUser.id, msg.datas);
    this.emit_to_browser(msg);
  }

  private async userSearchesSave(msg) {
    msg.datas = await this.handler.userSearchesSave(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readSearchesByProductCode(msg){
    msg.datas = await this.handler.readSearchesByProductCode(this.loggedUser.id, msg.datas);
    this.emit_to_browser(msg);
  }

  private async userSearchesSend(msg) {
    msg.datas = await this.handler.userSearchesSend(this.loggedUser.id);
    this.emit_to_browser(msg);
  }

}