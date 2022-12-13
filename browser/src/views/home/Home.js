import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import SnackbarUpdateResearcher from "../../componentes/snackbars/snackbarResearcher/SnackbarUpdateResearcher.vue";

class Home extends Basic {
  constructor() {
    super('Home');
    this.data = {
      loading: false,
      valid: true,
      user: CacheValues.getData('user'),
      name: '',
      surname: '',
      email: '',
      password: '',
      phoneNumber: '',
      pass: '',
      emailRules: [
        v => !!v || 'Esse campo é obrigatório',
        v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'O E-mail deve ser válido'
      ],
      SnackbarUpdateResearcher: false
    };

    this.methods = {
      'ready': this.ready.bind(this),
      'updateProfile': this.updateProfile.bind(this),
      'open': this.open.bind(this),
    };
    this.components = {
      SnackbarUpdateResearcher: SnackbarUpdateResearcher
    };
    this.listeners = {
      'user_ready': this.ready.bind(this),
      'returnUpdateProfile': this.returnUpdateProfile.bind(this)
    };
    this.watch = {};
    this.wiring();
    this.onReady = [
      this.open.bind(this),
    ];
  }

  ready() {
    this.send_to_browser('activate_toolbar', {});
  }

  open() {
    this.data.name = CacheValues.getData('user').name;
    this.data.surname = CacheValues.getData('user').surname;
    this.data.email = CacheValues.getData('user').email;
    this.data.phoneNumber = CacheValues.getData('user').phoneNumber;
  }

  // Função abrir Snackbar ao editar informações do pesquisador
  openSnackbarUpdateResearcher(data) {
    return this.components_controller.SnackbarUpdateResearcher.methods.open(data);
  }

  updateProfile() {
    let data = {
      name: this.data.name,
      surname: this.data.surname,
      email: this.data.email,
      password: this.data.password,
      phoneNumber: this.data.phoneNumber
    };
    this.send_to_server('user_change_infos', data, 'returnUpdateProfile');
    this.data.loading = true;
  }

  returnUpdateProfile() {
    this.data.loading = false;
    this.openSnackbarUpdateResearcher('Perfil editado!');
  }
}

export default new Home().$vue;