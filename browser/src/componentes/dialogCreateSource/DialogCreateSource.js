import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarCreateSource from "../snackbars/snackbarSourceManager/SnackbarCreateSource.vue";

class DialogCreateSource extends Basic {
  constructor() {
    super('DialogCreateSource');
    this.components = {
      SnackbarCreateSource: SnackbarCreateSource
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'readRegions': this.readRegions.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'createSource': this.createSource.bind(this),
      'openSnackbarCreateSource': this.openSnackbarCreateSource.bind(this),
      'clear': this.clear.bind(this),
    };
    this.listeners = {
      'returnCreateSource': this.returnCreateSource.bind(this),
      'returnReadResearchers': this.returnReadResearchers.bind(this),
      'returnReadRegions': this.returnReadRegions.bind(this),
    };
    this.data = {
      loading: false,
      valid: true,
      id: '',
      regions: [],
      users: [],
      dialog: false,
      regionId2: '',
      data: {
        regionId: '',
        source: {
          name: '',
          products: [],
          code: '',
          researchers: [],
          address: {
            state: '',
            city: '',
            neighborhood: '',
            street: '',
            postalCode: '',
            number: ''
          }
        }
      },
      SnackbarCreateSource: false,
      basket: [],

      pcodeRules: [
        v => !!v || 'Esse campo é obrigatório',
        v => (v && v.length <= 10) || 'O CEP deve ter no mínimo 8 números'
      ],
    };
    this.wiring();
  }

  open(data) {
    this.data.regionId2 = data;
    this.readRegions();
    this.readResearchers();
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

  // Função para chamar Snackbar ao criar fonte
  openSnackbarCreateSource(data) {
    return this.components_controller.SnackbarCreateSource.methods.open(data);
  }

  // Função ler regiões
  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions');
  }

  returnReadRegions(msg) {
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data;
    } else {
      this.data.regions = [];
    }
  }

  // Função ler pesquisadores
  readResearchers() {
    this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
  }

  returnReadResearchers(msg) {
    if (msg.datas.data.length > 0) {
      this.data.users = msg.datas.data.map(user => {
        return {
          text: user.name + " " + user.surname,
          value: {
            id: user.id,
          }
        }
      });
    } else {
      this.data.users = [];
    }
  }

  // Função criar fonte
  createSource() {
    // TODO: FAZER CONDIÇÕES E ENDEREÇO SE AUTOCOMPLETAR
    let temvazio = false;
    if (!this.data.data.source.name || !this.data.data.source.address.postalCode || !this.data.data.source.address.state ||
      !this.data.data.source.address.city || !this.data.data.source.code || !this.data.data.source.address.neighborhood ||
      !this.data.data.source.address.street || !this.data.data.regionId || !this.data.data.source.address.number) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarCreateSource('Preencha todos os campos!');
    } else {
      this.send_to_server('source_create', this.data.data, 'returnCreateSource');
    }
  }

  returnCreateSource(msg) {
    if (msg.datas.success === false) {
      this.openSnackbarCreateSource('Uma fonte não pode ter o mesmo código que outra!');
    } if (msg.datas.success === true) {
      this.clear();
      this.openSnackbarCreateSource('Fonte cadastrada!');
      this.readSourcesbyRegion();
      this.data.dialog = false;
    }
  }

  // Função ler fontes por região
  readSourcesbyRegion() {
    let data = {
      regionId: this.data.regionId2
    };
    this.send_to_server('source_read_region', data, 'returnReadSourcesbyRegion');
    this.data.loading = true;
  }

}

export default new DialogCreateSource().$vue;