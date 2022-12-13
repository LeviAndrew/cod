import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarNewMonth from "../snackbars/newMonth/SnackbarNewMonth.vue";

class DialogNewMonth extends Basic {
  constructor() {
    super('DialogNewMonth');
    this.components = {
      SnackbarNewMonth: SnackbarNewMonth
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'newMonth': this.newMonth.bind(this),
    };
    this.listeners = {
      'returnNewMonth': this.returnNewMonth.bind(this),
      'returnVerifySearch': this.returnVerifySearch.bind(this),
    };
    this.data = {
      sheet: false,
      persistent: false,
      dialog: false,
      regionId: '',
      month: '',
      year: '',
      searches: [],
      loading: false,
      headers: [
        {
          text: 'Pesquisador',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Fontes',
          align: 'center',
          sortable: true,
          value: 'source'
        },
      ],
      rows: [10,25,50],
      SnackbarNewMonth: false,
    };
    this.wiring();
    this.onReady = [];
  }

  open(data) {
    this.data.regionId = data;
    this.data.dialog = true;
    this.verifySearch();
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

  // Função para chamar Snackbar(mensagem) ao abrir novo mês
  openSnackbarNewMonth(data) {
    return this.components_controller.SnackbarNewMonth.methods.open(data);
  }

  // Função verificar pesquisas em aberto
  verifySearch() {
    this.send_to_server('verify_opened_searches_user', this.data.regionId, 'returnVerifySearch');
  }

  returnVerifySearch(msg) {
    if (msg.datas.data.length > 0) {
      this.data.searches = msg.datas.data
    } else {
      this.data.searches = []
    }
  }

  // Função abrir novo mês
  newMonth() {
    this.send_to_server('open_new_month', this.data.regionId, 'returnNewMonth');
    this.data.loading = true;
    this.data.persistent = true;
  }

  returnNewMonth(msg) {
    this.data.month = msg.datas.data[0].month;
    this.data.year = msg.datas.data[0].year;
    if (msg.datas.success === true) {
      this.readDate();
      this.openSnackbarNewMonth('Novo mês aberto!');
      this.data.dialog = false;
      this.data.loading = false;
      this.data.persistent = false;
      this.readSearch();
    } else {
      this.openSnackbarNewMonth(msg.datas.data[0][0].buttons.description);
    }
  }

  // Função ler pesquisas para a crítica(todas)
  readSearch() {
    let data = {
      regionId: this.data.regionId.regionId,
      year: this.data.year,
      month: this.data.month
    };
    this.send_to_server('read_all_searches_to_review', data, 'returnReadSearch');
  }

  //Função ler datas
  readDate() {
    this.send_to_server('read_review_date', this.data.regionId, 'returnReadDate');
  }

}

export default new DialogNewMonth().$vue;