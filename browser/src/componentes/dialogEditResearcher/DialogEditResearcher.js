import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarEditResearcher from "../snackbars/snackbarResearcherManager/SnackbarEditResearcher.vue";

class DialogEditResearcher extends Basic {
  constructor() {
    super('DialogEditResearcher');
    this.components = {
      SnackbarEditResearcher: SnackbarEditResearcher
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'updateResearchers': this.updateResearchers.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'openSnackbarEditResearcher': this.openSnackbarEditResearcher.bind(this),
      'clear': this.clear.bind(this),
    };
    this.listeners = {
      'returnUpdateResearchers': this.returnUpdateResearchers.bind(this),
    };
    this.data = {
      valid: true,
      users: [],
      id: '',
      dialog: false,
      pass: '',
      data: {
        name: '',
        surname: '',
        email: '',
        password: '',
        phoneNumber: '',
      },
      SnackbarEditResearcher: false,
      emailRules: [
        v => !!v || 'Esse campo é obrigatório',
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'O E-mail deve ser válido'
      ],
    };
    this.wiring();
  }

  // FUNÇÃO PARA ABRIR SNACKBAR DE RESEARCHER
  openSnackbarEditResearcher(data) {
    return this.components_controller.SnackbarEditResearcher.methods.open(data);
  }

  // Função para resetar forms
  clear() {
    this._instance.$refs.form.reset()
  }

  open(data) {
    this.data.data.name = data.name;
    this.data.data.surname = data.surname;
    this.data.data.email = data.email;
    this.data.data.phoneNumber = data.phoneNumber;
    this.data.id = data.id;
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

  readResearchers() {
    this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
  }

  updateResearchers(id) {
    let data = {
      id: id,
      update: {
        name: this.data.data.name,
        surname: this.data.data.surname,
        email: this.data.data.email,
        password: this.data.data.password,
        phoneNumber: this.data.data.phoneNumber
      }
    };
    let temvazio = false;
    if (!this.data.data.name || !this.data.data.surname || !this.data.data.email || !this.data.data.phoneNumber) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarEditResearcher('Preencha todos os campos!');
    } else {
      this.send_to_server('researcher_update', data, 'returnUpdateResearchers');
      this.data.dialog = false;
    }
  }

  returnUpdateResearchers() {
    this.openSnackbarEditResearcher('Pesquisador editado!');
    this.readResearchers();
    this.clear();
  }
}

export default new DialogEditResearcher().$vue;