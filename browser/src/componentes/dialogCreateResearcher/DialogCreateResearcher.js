import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarCreateResearcher from "../snackbars/snackbarResearcherManager/SnackbarCreateResearcher.vue";

class DialogCreateResearcher extends Basic {
  constructor() {
    super('DialogCreateResearcher');
    this.components = {
      SnackbarCreateResearcher: SnackbarCreateResearcher
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'createResearcher': this.createResearcher.bind(this),
      'openSnackbarCreateResearcher': this.openSnackbarCreateResearcher.bind(this),
      'clear': this.clear.bind(this),
    };
    this.listeners = {
      'returnCreateResearcher': this.returnCreateResearcher.bind(this),
    };
    this.data = {
      valid: true,
      id: '',
      data: {
        name: '',
        surname: '',
        email: '',
        phoneNumber: '',
        password: ''
      },
      dialog: false,
      pass: false,
      SnackbarCreateResearcher: false,

      emailRules: [
        v => !!v || 'Esse campo é obrigatório',
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'O E-mail deve ser válido'
      ],
    };
    this.wiring();
  }

  open() {
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

  // Função para resetar forms
  clear() {
    this._instance.$refs.form.reset()
  }

  // Função para chamar Snackbar ao criar pesquisador
  openSnackbarCreateResearcher(data) {
    return this.components_controller.SnackbarCreateResearcher.methods.open(data);
  }

  // Função ler pesquisadores
  readResearchers() {
    this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
  }

  // Função criar pesquisador
  createResearcher() {
    let temvazio = false;
    if (!this.data.data.name || !this.data.data.surname || !this.data.data.email || !this.data.data.password || !this.data.data.phoneNumber) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarCreateResearcher('Preencha todos os campos!');
    } else {
      this.send_to_server('researcher_create', this.data.data, 'returnCreateResearcher');
      this.data.dialog = false;
    }
  }

  returnCreateResearcher() {
    this.openSnackbarCreateResearcher('Pesquisador cadastrado!');
    this.readResearchers();
    this.clear();
  }
}

export default new DialogCreateResearcher().$vue;