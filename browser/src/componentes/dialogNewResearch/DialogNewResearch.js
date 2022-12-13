import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import SnackbarNewResearch from "../snackbars/snackbarResearchTable/SnackbarNewResearch.vue";

// APENAS USAR PARA INICIAR UMA PESQUISA DO ZERO

class DialogNewResearch extends Basic {
  constructor() {
    super('DialogNewResearch');
    this.data = {
      loading: false,
      date: '',
      landscape: true,
      valid: true,
      dialog: false,
      regionId: '',
      year: '',
      month: '',
      mes: [
        {
          text: 'Janeiro',
          value: 1
        },
        {
          text: 'Fevereiro',
          value: 2
        },
        {
          text: 'Março',
          value: 3
        },
        {
          text: 'Abril',
          value: 4
        },
        {
          text: 'Maio',
          value: 5
        },
        {
          text: 'Junho',
          value: 6
        },
        {
          text: 'Julho',
          value: 7
        },
        {
          text: 'Agosto',
          value: 8
        },
        {
          text: 'Setembro',
          value: 9
        },
        {
          text: 'Outubro',
          value: 10
        },
        {
          text: 'Novembro',
          value: 11
        },
        {
          text: 'Dezembro',
          value: 12
        },
      ],
      SnackbarNewResearch: false,
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'openNewMonth': this.openNewMonth.bind(this),
    };
    this.components = {
      SnackbarNewResearch: SnackbarNewResearch
    };
    this.listeners = {
      'returnOpenNewMonth': this.returnOpenNewMonth.bind(this),
    };
    this.watch = {};
    this.wiring();
    this.onReady = [];
  }

  open(data) {
    this.data.regionId = data;
    this.data.dialog = true;
  }

  closeDialog() {
    this.data.dialog = false;
    this.clear();
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

  // Função para resetar formulários
  clear() {
    this._instance.$refs.form.reset()
  }

  // Função abrir Snackbar quando nova pesquisa é criada
  openSnackbarNewResearch(data) {
    return this.components_controller.SnackbarNewResearch.methods.open(data);
  }

  // Função abrir novo mês
  openNewMonth() {
    let data = {
      regionId: this.data.regionId,
      month: this.data.month,
      year: this.data.year
    };
    let temvazio = false;
    if (!this.data.month || !this.data.year) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarNewResearch('Preencha todos os campos!');
    } else {
      this.send_to_server('open_new_month_discard_previous', data, 'returnOpenNewMonth');
      this.data.loading = true;
    }
  }

  returnOpenNewMonth() {
    this.data.loading = false;
    this.openSnackbarNewResearch('Relatório inicial criado!');
    this.closeDialog();
  }
}

export default new DialogNewResearch().$vue;