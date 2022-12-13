import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import SnackbarSendResearch from "../snackbars/snackbarResearchTable/SnackbarSendResearch.vue";
import ResearchTable from '../../views/researchTable/ResearchTable';

class DialogSendSearch extends Basic {
  constructor() {
    super('DialogSendSearch');
    this.components = {
      SnackbarSendResearch: SnackbarSendResearch
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'sendSearch': this.sendSearch.bind(this),
      'saveSearch': this.saveSearch.bind(this),
    };
    this.listeners = {
      'returnSendSearch': this.returnSendSearch.bind(this),
    };
    this.data = {
      user: CacheValues.getData('user'),
      dialog: false,
      searches: [],
      SnackbarSendResearch: false,
    };
    this.wiring();
  }

  open(data) {
    this.data.searches = data;
    this.data.dialog = true;
  }

  closeDialog() {
    this.data.dialog = false;
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

  //Função para abrir mensagem(snackbar) ao enviar pesquisa
  openSnackbarSendResearch(data) {
    return this.components_controller.SnackbarSendResearch.methods.open(data);
  }

  // Função buscar pesquisas (todas)
  readSearchers() {
    this.send_to_server('get_searches', null, 'returnReadSearchers');
    this.data.loading = true;
  }

  returnReadSearchers(msg) {
    let searchPattern = [];
    if (msg.datas.data.length > 0) {
      for (let i = 0; i < msg.datas.data.length; i++) {
        for (let j = 0; j < msg.datas.data[i].search.length; j++) {
          searchPattern.push(msg.datas.data[i].search[j])
        }
      }
    }
    if (msg.datas.data.length > 0) {
      this.data.searches = searchPattern;
    }
    else {
      this.data.searches = [];
    }
    this.data.loading = false;
  }

  // Função enviar pesquisa
  sendSearch() {
    this.saveSearch();
    this.send_to_server('user_searches_send', null, 'returnSendSearch');
  }

  returnSendSearch() {
    this.readSearchers();
    this.openSnackbarSendResearch('Pesquisa enviada!');
    this.data.dialog = false;
  }

  adjustPrice(searches){
    for(let i = 0; i < searches.length; i++){
      searches[i].price = searches[i].price.toString();
      searches[i].price = searches[i].price.replace(/,/g, '.');
      let index = searches[i].price.lastIndexOf('.');
      if(index >= 0) searches[i].price = searches[i].price.substr(0,index).replace(/\./,'')+searches[i].price.substr(index);
      searches[i].price = Number(searches[i].price);
    }
  }

  // Função salvar pesquisa
  saveSearch() {
    // if(this.data.user.type === 'admin'){
    //   this.adjustPrice(this.data.searches);
    // } else {
    //   for (let i = 0; i < this.data.searches.length; i++) {
    //     if (!this.data.searches[i].price.includes('.')) {
    //       this.data.searches[i].price = Number(this.data.searches[i].price)/100;
    //     } else {
    //       this.data.searches[i].price = Number(this.data.searches[i].price);
    //     }
    //   }
    // }
    this.adjustPrice(this.data.searches);
    this.send_to_server('user_searches_save', {searches: this.data.searches}, 'returnSaveSearch')
  }

}

export default new DialogSendSearch().$vue;