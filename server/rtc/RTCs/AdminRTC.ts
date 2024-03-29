import {BasicRTC} from '../BasicRTC';
import Handler from '../../handlers/user/AdminHandler';
import {AdminHandler} from '../../handlers/user/AdminHandler';
import {OpenRTC} from '../OpenRTC';

export class AdminRTC extends BasicRTC {
  private _loggedUser;

  /**
   * Recebe o socketId passado pelo client.
   *
   * @param conf
   */
  constructor(conf, msg, openRTC) {
    super('admin', Handler, conf);
    openRTC.destroy();
    this.interfaceListeners = {
      'logout': this.logout.bind(this), // USER // Common
      'user_change_infos': this.userChangeInfos.bind(this), // USER // Common
      'region_create': this.regionCreate.bind(this), // REGIAO
      'read_all_regions': this.readAllRegions.bind(this), // REGIAO
      'region_update': this.regionUpdate.bind(this), // REGIAO
      'region_remove': this.regionRemove.bind(this), // REGIAO
      'source_create': this.sourceCreate.bind(this), // FONTE
      'source_update': this.sourceUpdate.bind(this), // FONTE
      'source_read_region': this.sourceReadRegion.bind(this), // FONTE
      'source_read_id': this.sourceReadId.bind(this), // FONTE
      'source_remove': this.sourceRemove.bind(this), // FONTE
      'source_read_products': this.sourceReadProducts.bind(this), // FONTE
      'source_read_of_researcher': this.sourceReadOfResearcher.bind(this), // FONTE // Common
      'connect_products_source': this.connectProductsSource.bind(this), // FONTE
      'address_by_zipCode': this.addressByZipCode.bind(this), // USER
      'researcher_create': this.researcherCreate.bind(this), // PESQUISADOR
      'read_all_researchers': this.readAllResearchers.bind(this), // PESQUISADOR
      'researcher_update': this.researcherUpdate.bind(this), // PESQUISADOR
      'researcher_remove': this.researcherRemove.bind(this), // PESQUISADOR
      'connect_researcher_source': this.connectResearcherSource.bind(this), // PESQUISADOR
      'calculate_report': this.calculateReport.bind(this), // RELATORIO
      'read_report': this.readReport.bind(this), // RELATORIO
      'read_report_dates': this.readReportDates.bind(this), // RELATORIO
      'open_new_month_discard_previous': this.openNewMonthDiscardPrevious.bind(this), // PESQUISA
      'open_new_month': this.openNewMonth.bind(this), // RELATORIO
      'open_new_month_searches': this.openNewMonthSearches.bind(this), // PESQUISA
      'verify_opened_searches_user': this.verifyOpenedSearchesUser.bind(this), // PESQUISA
      'get_searches': this.getSearches.bind(this), // PESQUISA // Common
      'get_searches_by_source': this.getSearchesBySource.bind(this), // PESQUISA // Common
      'readSearchesByProductCode': this.readSearchesByProductCode.bind(this), // falta documentar // Common
      'user_searches_save': this.userSearchesSave.bind(this), // PESQUISA // Common
      'user_searches_send': this.userSearchesSend.bind(this), // PESQUISA // Common
      'read_product_basket': this.read_product_basket.bind(this), // CESTA DE PRODUTO
      'import_basket': this.importBasket.bind(this), // CESTA DE PRODUTO
      'read_all_searches_to_review': this.readAllSearchesToReview.bind(this), // PESQUISA
      'read_all_searches_to_review_filter': this.readAllSearchesToReviewFilter.bind(this), // PESQUISA
      'change_research_by_review': this.changeResearchByReview.bind(this), // PESQUISA
      'checkedReviewSearch': this.checkedReviewSearch.bind(this), // PESQUISA // não foi feito teste unitário
      'read_review_date': this.readReviewDate.bind(this), // REGIAO
      'import_review': this.importReview.bind(this), // REGIAO // SEGUE COMO RTC
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

  set handler(handler: AdminHandler) {
    this._handler = handler;
  }

  get handler(): AdminHandler {
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

  private async regionCreate(msg) {
    msg.datas = await this.handler.regionCreate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceCreate(msg) {
    msg.datas = await this.handler.sourceCreate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceUpdate(msg) {
    delete msg.datas.update.removed;
    delete msg.datas.update.products;
    delete msg.datas.update.researchers;
    delete msg.datas.update.code;
    msg.datas = await this.handler.sourceUpdate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceReadRegion(msg) {
    msg.datas = await this.handler.sourceReadRegion(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceReadId(msg) {
    msg.datas = await this.handler.sourceReadId(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceRemove(msg) {
    msg.datas = await this.handler.sourceRemove(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceReadProducts(msg){
    msg.datas = await this.handler.sourceReadProducts(msg.datas);
    this.emit_to_browser(msg);
  }

  private async sourceReadOfResearcher(msg){
    msg.datas = await this.handler.sourceReadOfResearcher(this.loggedUser.id);
    this.emit_to_browser(msg);
  }

  private async connectProductsSource(msg) {
    msg.datas = await this.handler.connectProductsSource(msg.datas);
    this.emit_to_browser(msg);
  }

  private async addressByZipCode(msg) {
    msg.datas = await this.handler.addressByZipCode(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readAllRegions(msg) {
    msg.datas = await this.handler.readAllRegions();
    this.emit_to_browser(msg);
  }

  private async regionUpdate(msg) {
    msg.datas = await this.handler.regionUpdate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async regionRemove(msg) {
    msg.datas = await this.handler.regionRemove(msg.datas);
    this.emit_to_browser(msg);
  }

  private async researcherCreate(msg) {
    msg.datas = await this.handler.researcherCreate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readAllResearchers(msg) {
    msg.datas = await this.handler.readAllResearchers();
    this.emit_to_browser(msg);
  }

  private async researcherUpdate(msg) {
    delete msg.datas.update.removed;
    msg.datas = await this.handler.researcherUpdate(msg.datas);
    this.emit_to_browser(msg);
  }

  private async researcherRemove(msg) {
    msg.datas = await this.handler.researcherRemove(msg.datas);
    this.emit_to_browser(msg);
  }

  private async connectResearcherSource(msg) {
    msg.datas = await this.handler.connectResearcherSource(msg.datas);
    this.emit_to_browser(msg);
  }

  private async calculateReport(msg) {
    msg.datas = await this.handler.calculateReport(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readReport(msg){
    msg.datas = await this.handler.readReport(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readReportDates(msg){
    msg.datas = await this.handler.readReportDates(msg.datas);
    this.emit_to_browser(msg);
  }

  private async openNewMonthDiscardPrevious(msg) {
    msg.datas = await this.handler.openNewMonthDiscardPrevious(msg.datas);
    this.emit_to_browser(msg);
  }

  private async openNewMonth(msg) {
    msg.datas = await this.handler.openNewMonth(msg.datas);
    this.emit_to_browser(msg);
  }

  private async openNewMonthSearches(msg) {
    msg.datas = await this.handler.openNewMonthSearches(msg.datas);
    this.emit_to_browser(msg);
  }

  private async verifyOpenedSearchesUser(msg) {
    msg.datas = await this.handler.verifyOpenedSearchesUser(msg.datas);
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

  private async readSearchesByProductCode(msg){
    msg.datas = await this.handler.readSearchesByProductCode(this.loggedUser.id, msg.datas);
    this.emit_to_browser(msg);
  }

  private async userSearchesSave(msg) {
    msg.datas = await this.handler.userSearchesSave(msg.datas);
    this.emit_to_browser(msg);
  }

  private async userSearchesSend(msg) {
    msg.datas = await this.handler.userSearchesSend(this.loggedUser.id);
    this.emit_to_browser(msg);
  }

  private async read_product_basket(msg) {
    msg.datas = await this.handler.readProductBasket(msg.datas); // alterado // read_product_basket
    this.emit_to_browser(msg)
  }

  private async importBasket(msg) {
    msg.datas = await this.handler.importBasket(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readAllSearchesToReview(msg){
    msg.datas = await this.handler.readAllSearchesToReview(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readAllSearchesToReviewFilter(msg){
    msg.datas = await this.handler.readAllSearchesToReviewFilter(msg.datas);
    this.emit_to_browser(msg);
  }

  private async changeResearchByReview(msg){
    msg.datas =await this.handler.changeResearchByReview(msg.datas);
    this.emit_to_browser(msg);
  }

  private async checkedReviewSearch(msg){
    msg.datas = await this.handler.checkedReviewSearch(msg.datas);
    this.emit_to_browser(msg);
  }

  private async importReview(msg){
    msg.datas = await this.handler.importReview(msg.datas);
    this.emit_to_browser(msg);
  }

  private async readReviewDate(msg){
    msg.datas = await this.handler.readReviewDate(msg.datas);
    this.emit_to_browser(msg);
  }

}
