import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import ReviewDetails from "../../componentes/reviewDetails/ReviewDetails.vue";
import SnackbarSaveReview from "../../componentes/snackbars/snackbarReviewTable/SnackbarSaveReview.vue";
import DialogNewMonth from "../../componentes/dialogNewMonth/DialogNewMonth.vue";
import DialogNewWeek from "../../componentes/dialogNewWeek/DialogNewWeek.vue";
import SnackbarSearchError from "../../componentes/snackbars/snackbarReviewTable/SnackbarSearchError.vue";
import DialogImportReview from "../../componentes/dialogImportReview/DialogImportReview.vue";

class ReviewTable extends Basic {
  constructor() {
    super('ReviewTable');
    this.data = {
      show: false,
      user: CacheValues.getData('user'),
      direction: 'bottom',
      valid: true,
      fab: false,
      fab2: false,
      tabs: null,
      transition: 'scale-transition',
      loader: null,
      loading: false,
      disabled: false,
      switch1: false,
      fonts: [],
      researchers: [],
      products: [],
      regions: [],
      searches: [],
      regionId: '',
      productId: '',
      researcherId: '',
      sourceId: '',
      id: '',
      year: '',
      month: '',
      rows: [30, 60, 100],
      headers: [],
      value: '',
      SnackbarSaveReview: false,
      DialogNewMonth: false,
      DialogNewWeek: false,
      DialogImportReview: false,
      searchYear: '',
      searchMonth: '',
      years: [],
      months: [],
      tooltipText: {
        source: {
          name: 'Ainda sem objeto',
        },
        searches: [
          {
            especOne: 'Ainda sem objeto',
            especTwo: 'Ainda sem objeto',
          }
        ]
      },
      fixedTooltip: false,
    };
    this.months = new Map();
    this.checkedMap = new Map();
    this.methods = {
      'openDialogImportReview': this.openDialogImportReview.bind(this),
      'openDialogNewMonth': this.openDialogNewMonth.bind(this),
      'readSearchbymonth': this.readSearchbymonth.bind(this),
      'openDialogNewWeek': this.openDialogNewWeek.bind(this),
      'downloadReview': this.downloadReview.bind(this),
      'downloadExcel': this.downloadExcel.bind(this),
      'readSearch': this.readSearch.bind(this),
      'calcReview': this.calcReview.bind(this),
      'saveReview': this.saveReview.bind(this),
      'readDate': this.readDate.bind(this),
      'filter': this.filter.bind(this),
      'clear': this.clear.bind(this),
      'tooltipProduct': this.tooltipProduct.bind(this),
      'checkedReviewSearch': this.checkedReviewSearch.bind(this),
    };
    this.components = {
      ReviewDetails,
      SnackbarSaveReview: SnackbarSaveReview,
      SnackbarSearchError: SnackbarSearchError,
      DialogNewMonth: DialogNewMonth,
      DialogNewWeek: DialogNewWeek,
      DialogImportReview: DialogImportReview
    };
    this.listeners = {
      'returnReadSearch': this.returnReadSearch.bind(this),
      'returnReadRegionsReview': this.returnReadRegionsReview.bind(this),
      'returnReadDate': this.returnReadDate.bind(this),
      'returnReadDate2': this.returnReadDate2.bind(this),
      'returnfilter': this.returnfilter.bind(this),
      'returnCalcReview': this.returnCalcReview.bind(this),
      'checkedReviewSearchReturn': this.checkedReviewSearchReturn.bind(this),
    };
    this.watch = {
      // Loader dos botões
      loader() {
        const l = this.loader;
        this[l] = !this[l];
        setTimeout(() => (this[l] = false), 1000);
        this.loader = null
      },
      searchYear: this.getMonths.bind(this),
    };
    this.wiring();
    this.onReady = [
      this.readRegionsReview.bind(this),
    ];
  }

  clear() {
    this._instance.$refs.form.reset();
  }

  // Função abrir mensagem(Snackbar) quando pesquisa é salva
  openSnackbarSaveReview(data) {
    return this.components_controller.SnackbarSaveReview.methods.open(data);
  }

  // Função abrir mensagem(Snackbar) ao clicar no botão search e não tiver data(Mês/Ano)
  openSnackbarSearchError(data) {
    return this.components_controller.SnackbarSearchError.methods.open(data);
  }

  // Função abrir dialog para importar crítica
  openDialogImportReview(data) {
    return this.components_controller.DialogImportReview.methods.open(this.data.regionId);
  }

  // Função abrir dialog novo mẽs
  openDialogNewMonth(data) {
    if (!this.data.regionId) {
      this.openSnackbarSaveReview('Selecione uma região!');
    } else {
      return this.components_controller.DialogNewMonth.methods.open({regionId: data});
    }
  }

  // Função abrir dialog nova semana
  openDialogNewWeek(data) {
    if (!this.data.regionId) {
      this.openSnackbarSaveReview('Selecione uma região primeiro!');
    } else {
      let dates = {
        year: this.data.searchYear,
        month: this.data.searchMonth
      };
      return this.components_controller.DialogNewWeek.methods.open({regionId: data}, dates);
    }
  }

  createHeader(maxSearch) {
    let allHeaders = [
      {
        text: 'Código',
        align: 'left',
        sortable: false,
        value: 'code'
      },
      {
        text: 'Nome',
        align: 'left',
        sortable: false,
        value: 'name'
      },
      {
        text: 'Variação',
        align: 'left',
        sortable: false,
        value: 'variance'
      },
      {
        text: 'Dados anteriores',
        align: 'left',
        sortable: false,
        value: 'jdh'
      },
    ];
    for (let i = 0; i < maxSearch; i++) {
      let text = i + 1;
      let header = {
        text: 'Pesquisa ' + text++,
        align: 'center',
        sortable: false
      };
      allHeaders.push(header);
    }
    this.data.headers = allHeaders;
  }

  // Função ler regiões
  readRegionsReview() {
    this.send_to_server('read_all_regions', null, 'returnReadRegionsReview')
  }

  returnReadRegionsReview(msg) {
    // quando só tem uma região ele ja lê as pesquisas.
    if (msg.datas.data.length === 1) {
      this.data.regionId = msg.datas.data[0].id;
      this.readDate2(this.data.regionId);
    }
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data;
    } else {
      this.data.regions = [];
    }
  }

  // Função para atribuir valor à year e month ao escolher o mês e ano manualmente(e procurar ao clicar no botão)
  readSearchbymonth() {
    if (!this.data.regionId) {
      this.openSnackbarSearchError('Selecione uma região!')
    } else if (!this.data.years && !this.data.months) {
      this.openSnackbarSearchError('Selecione a data!');
    } else {
      this.readSearch();
    }
  }

  // Função ler pesquisas para a crítica(todas)
  readSearch() {
    let data = {
      regionId: this.data.regionId,
      year: this.data.searchYear,
      month: this.data.searchMonth
    };
    this.send_to_server('read_all_searches_to_review', data, 'returnReadSearch');
    this.data.loading = true;
  }

  returnReadSearch(msg) {
    let searchPattern = [];
    if (msg.datas.data.searches.length > 0) {
      for (let i = 0; i < msg.datas.data.searches.length; i++) {
        searchPattern.push(msg.datas.data.searches[i]);
      }
      this.data.searches = searchPattern;

      // criar tabela dinâmica
      this.createHeader(msg.datas.data.columnsAmount);

      // atribuir items para as variaveis(select)
      this.data.fonts = msg.datas.data.sources;
      this.data.researchers = msg.datas.data.researchers;
      this.data.products = msg.datas.data.products;
    } else {
      this.data.searches = [];
    }
    this.data.loading = false;
  }

  // Função ler datas para select
  readDate(id) {
    this.send_to_server('read_review_date', {regionId: id}, 'returnReadDate');
  }

  returnReadDate(msg) {
    if (msg.datas.data.length > 0) {
      for (let i = 0; i < msg.datas.data.length; i++) {
        if (!this.months.has(msg.datas.data[i].year)) this.months.set(msg.datas.data[i].year, []);
        this.months.get(msg.datas.data[i].year).push(msg.datas.data[i].month);
      }
      for (let year of this.months.keys()) {
        this.data.years.push(year);
      }
      this.data.searchMonth = msg.datas.data[0].month;
      this.data.searchYear = msg.datas.data[0].year;
    }
  }

  getMonths() {
    this.data.months = this.months.get(this.data.searchYear);
  }

  // Função para atribuir valor á year e month só pra quando tiver apenas uma região!
  readDate2(id) {
    this.send_to_server('read_review_date', {regionId: id}, 'returnReadDate2');
  }

  returnReadDate2(msg) {
    if (msg.datas.data.length > 0) {
      this.returnReadDate(msg);
      this.readSearch();
    }
  }

  // Função para filtrar pesquisa (fonte, pesquisador e produtos)
  filter() {
    let data = {
      regionId: this.data.regionId,
      year: this.data.searchYear,
      month: this.data.searchMonth,
      filter: {
        products: this.data.productId,
        researchers: this.data.researcherId,
        fonts: this.data.sourceId,
      },
    };
    this.send_to_server('read_all_searches_to_review_filter', data, 'returnfilter');
    this.data.loading = true;
  }

  returnfilter(msg) {
    let searchPattern = [];
    if (msg.datas.data.searches.length > 0) {
      for (let i = 0; i < msg.datas.data.searches.length; i++) {
        searchPattern.push(msg.datas.data.searches[i]);
      }
      this.data.searches = searchPattern;
      this.data.loading = false;
    }
  }

  // Função para mostrar mensagem ao clicar em salvar, sim só isso mesmo.
  saveReview() {
    this.openSnackbarSaveReview('Crítica salva!');
  }

  // Função baixar crítica pro Excel
  downloadExcel() {
    return this.siom.windowOpen('/api/open/defaultReviewXLS');
  }

  // Função baixar crítica
  downloadReview() {
    if (this.data.searches.length === 0) {
      this.openSnackbarSearchError('Não há crítica para baixar')
    } else {
      return this.siom.windowOpen(`/api/open/reviewXLSX?userId=${this.data.user.id}&regionId=${this.data.regionId}&year=${this.data.searchYear}&month=${this.data.searchMonth}`);
    }
  }

  returnCalcReview() {
    this.openSnackbarSaveReview('Crítica calculada!');
    this.data.loading = false;
  }

  // Função calcular crítica
  calcReview() {
    let data = {
      regionId: this.data.regionId,
      year: this.data.searchYear,
      month: this.data.searchMonth,
    };
    let date = (this.data.searchYear && this.data.searchMonth);
    if (!date) {
      this.openSnackbarSearchError('Selecione a data');
    } else {
      this.send_to_server('calculate_report', data, 'returnCalcReview');
      this.data.loading = true;
    }
  }

  tooltipProduct(item){
    if(item === this.data.tooltipText && this.data.show){
      this.data.show = false;
    }else{
      this.data.tooltipText = item;
      this.data.show = true;
    }
  }

  checkedReviewSearch(search){
    this.checkedMap.set(search.id, search);
    this.send_to_server('checkedReviewSearch', {searchId: search.id, reviewChecked: search.reviewChecked}, 'checkedReviewSearchReturn');
  }

  checkedReviewSearchReturn(msg){
    let search = msg.datas.data[0];
    if(this.checkedMap.has(search.id)) {
      if(this.checkedMap.get(search.id).reviewChecked !== search.reviewChecked) this.checkedMap.get(search.id).reviewChecked = search.reviewChecked;
      this.checkedMap.delete(search.id);
    }
  }

}

export default new ReviewTable().$vue;