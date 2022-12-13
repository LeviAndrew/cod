import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarNewWeek from "../snackbars/newWeek/SnackbarNewWeek.vue";

class DialogNewWeek extends Basic {
  constructor() {
    super('DialogNewWeek');
    this.components = {
      SnackbarNewWeek: SnackbarNewWeek
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'newWeek': this.newWeek.bind(this),
    };
    this.listeners = {
      'returnVerifySearch': this.returnVerifySearch.bind(this),
      'returnNewWeek': this.returnNewWeek.bind(this),
    };
    this.data = {
      sheet: false,
      persistent: false,
      dialog: false,
      loading: false,
      regionId: '',
      month: '',
      year: '',
      searches: [],
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
      rows: [10, 25, 50],
      SnackbarNewWeek: false,
    };
    this.wiring();
    this.onReady = [];
  }

  open(data, dates) {
    this.data.regionId = data;
    this.data.year = dates.year;
    this.data.month = dates.month;
    this.data.dialog = true;
    this.data.persistent = false;
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

  // Função para chamar Snackbar(mensagem) ao abrir nova semana
  openSnackbarNewWeek(data) {
    return this.components_controller.SnackbarNewWeek.methods.open(data);
  }

  // Função verificar pesquisas em aberto
  verifySearch() {
    this.send_to_server('verify_opened_searches_user', this.data.regionId, 'returnVerifySearch');
    this.data.persistent = false;
  }

  returnVerifySearch(msg) {
    this.data.persistent = false;
    if (msg.datas.data.length > 0) {
      this.data.searches = msg.datas.data
    } else {
      this.data.searches = []
    }
  }

  newWeek() {
    this.send_to_server('open_new_month_searches', this.data.regionId, 'returnNewWeek');
    this.data.loading = true;
    this.data.persistent = true;
  }

  returnNewWeek(msg) {
    if (msg.datas.success === true) {
      this.openSnackbarNewWeek('Nova semana aberta!');
      this.data.dialog = false;
      this.data.loading = false;
      this.data.persistent = false;
      this.readSearch();
    } else {
      this.openSnackbarNewWeek('Não existe pesquisa para inicar uma próxima semana!');
      this.data.persistent = false;
      this.data.loading = false;
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

}

export default new DialogNewWeek().$vue;