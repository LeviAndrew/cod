import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import SnackbarResearch
  from "../../componentes/snackbars/snackbarResearchTable/SnackbarResearch.vue";
import DialogSendSearch
  from "../../componentes/dialogSendSearch/DialogSendSearch.vue";
import {Money} from 'v-money';

class ResearchTable extends Basic {
  constructor() {
    super('ResearchTable');
    this.data = {
      user: CacheValues.getData('user'),
      disabled: true,
      valid: true,
      loader: null,
      loading: false,
      load: false,
      search: '',
      searches: [],
      sources: [],
      products: [],
      productId: '',
      productCode: '',
      id: '',
      espec1: '',
      espec2: '',
      price: '',
      sourceId: '',
      money: {
        decimal: '.',
        thousands: '',
        precision: 2,
        masked: false
      },
      headers: [
        {
          text: 'Código',
          align: 'left',
          sortable: true,
          value: 'code',
        },
        {
          text: 'Nome',
          align: 'left',
          sortable: true,
          value: 'name',
        },
        {
          text: 'Fonte',
          align: 'left',
          sortable: true,
          value: 'source'
        },
        {
          text: 'Especificação 1',
          align: 'left',
          sortable: false,
          value: 'espec1'
        },
        {
          text: 'Especificação 2',
          align: 'left',
          sortable: false,
          value: 'espec2'
        },
        {
          text: 'Preço',
          align: 'left',
          sortable: true,
          value: 'price'
        },
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
      SnackbarResearch: false,
      DialogSendSearch: false,
    };
    this.methods = {
      'readSearchers': this.readSearchers.bind(this),
      'saveSearch': this.saveSearch.bind(this),
      'readSearchesbySource': this.readSearchesbySource.bind(this),
      'openDialogSendSearch': this.openDialogSendSearch.bind(this),
      'downloadExcel': this.downloadExcel.bind(this),
      'disableButton': this.disableButton.bind(this),
      'openWindow': this.openWindow.bind(this),
      'clear': this.clear.bind(this),
      'readSearchesByProductCode': this.readSearchesByProductCode.bind(this),
    };
    this.components = {
      SnackbarResearch: SnackbarResearch,
      DialogSendSearch: DialogSendSearch,
      Money: Money,
    };
    this.listeners = {
      'returnReadSearchers': this.returnReadSearchers.bind(this),
      'returnSaveSearch': this.returnSaveSearch.bind(this),
      'returnReadResearchersSource': this.returnReadResearchersSource.bind(this),
      'returnSearchesbySource': this.returnSearchesbySource.bind(this),
      'returnSearchesByProductCode': this.returnSearchesByProductCode.bind(this),
    };
    this.watch = {
      // Loader dos botões
      loader() {
        const l = this.loader;
        this[l] = !this[l];
        setTimeout(() => (this[l] = false), 1000);
        this.loader = null
      }
    };
    this.wiring();
    this.onReady = [
      this.disableButton.bind(this),
      this.readSearchers.bind(this),
      this.readResearchersSource.bind(this),
    ];
  }

  clear() {
    this._instance.$refs.form.reset();
    this.data.sourceId = '';
    this.data.productCode = '';
    this.data.disabled = true;
  }

  // Função abrir mensagem(Snackbar) quando pesquisa é salva
  openSnackbarResearch(data) {
    return this.components_controller.SnackbarResearch.methods.open(data);
  }

  // Função dialog para enviar pesquisa
  openDialogSendSearch(data) {
    if(this.data.user.type === 'admin'){
      this.adjustPrice(data);
    }
    return this.components_controller.DialogSendSearch.methods.open(data);
  }

  // Função buscar pesquisas (todas)
  readSearchers() {
    this.send_to_server('get_searches', null, 'returnReadSearchers');
    this.data.loading = true;
  }

  adaptProductsToFilter(){
    let map = new Map();
    for(let i = 0; i < this.data.searches.length; i++){
      if(!map.has(this.data.searches[i].code)) map.set(this.data.searches[i].code, this.data.searches[i].name);
    }
    for(let [code, name] of map.entries()){
      this.data.products.push({
        code: code,
        name: `${code} ${name}`
      });
    }
    this.data.products.sort(function (a, b) {
      if (a.code > b.code) {
        return 1;
      }
      if (a.code < b.code) {
        return -1;
      }
      return 0;
    });
  }

  returnReadSearchers(msg) {
    if (msg.datas.data.length > 0) {
      this.data.searches = this.adaptSearches(msg.datas.data);
      this.adaptProductsToFilter();
    }
    else {
      this.data.searches = [];
    }
    this.data.loading = false;
  }

  adaptSearches(searches){
    let searchPattern = [];
    if (searches.length > 0) {
      for (let i = 0; i < searches.length; i++) {
        for (let j = 0; j < searches[i].search.length; j++) {
          let search = searches[i].search[j];
          search.currentPrice = search.price;
          // if(this.data.user.type !== 'admin'){
          //   search.price = (search.price * 100).toFixed();
          // }
          searchPattern.push(search);
        }
      }
    }
    return searchPattern;
  }

  // Função buscar pesquisas por fonte
  readSearchesbySource(id) {
    this.send_to_server('get_searches_by_source', {sourceId: id}, 'returnSearchesbySource');
    this.data.load = true;
  }

  returnSearchesbySource(msg) {
    if (msg.datas.data.length > 0) {
      this.data.searches = this.adaptSearches(msg.datas.data);
    } else {
      this.data.searches = [];
    }
    this.data.load = false;
    this.data.disabled = false;
  }

  returnSearchesByProductCode(msg){
    if (msg.datas.data.length > 0) {
      this.data.searches = this.adaptSearches(msg.datas.data);
    } else {
      this.data.searches = [];
    }
    this.data.load = false;
  }

  readSearchesByProductCode(){
    console.log('productCode', this.data.productCode);
    this.send_to_server('readSearchesByProductCode', {productCode: this.data.productCode}, 'returnSearchesByProductCode');
    this.data.load = true;
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
  saveSearch(searches) {
    // if(this.data.user.type === 'admin'){
    //   this.adjustPrice(searches);
    // } else {
    //   for (let i = 0; i < searches.length; i++) {
    //     if (!searches[i].price.includes('.')) {
    //       searches[i].price = Number(searches[i].price)/100;
    //     } else {
    //       searches[i].price = Number(searches[i].price);
    //     }
    //   }
    // }
    this.adjustPrice(searches);
    this.send_to_server('user_searches_save', {searches}, 'returnSaveSearch')
  }

  returnSaveSearch() {
    this.openSnackbarResearch('Pesquisa salva!');
  }

  // Função ler fontes do pesquisador logado
  readResearchersSource() {
    this.send_to_server('source_read_of_researcher', null, 'returnReadResearchersSource')
  }

  returnReadResearchersSource(msg) {
    if (msg.datas.data.length > 0) {
      this.data.sources = msg.datas.data;
    } else {
      this.data.sources = [];
    }
  }

  // Função para baixar pesquisa em Excel
  downloadExcel() {
    return this.siom.windowOpen(`/api/open/searchXLS?userId=${CacheValues.getData('user').id}&sourceId=${this.data.sourceId}`);
  }

  // Habilitar botão de baixar padrão ao selecionar fonte
  disableButton() {
    this.data.disabled = true
  }

  openWindow(spec) {
    if (spec.substr(0, 4).toLowerCase() === 'http') {
      window.open(spec);
    }
  }

}

export default new ResearchTable().$vue;