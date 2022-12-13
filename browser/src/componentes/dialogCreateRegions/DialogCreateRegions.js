import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarCreateRegion from "../snackbars/scnackbarRegionManager/SnackbarCreateRegion.vue";

class DialogCreateRegions extends Basic {
  constructor() {
    super('DialogCreateRegions');
    this.components = {
      SnackbarCreateRegion: SnackbarCreateRegion,
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'readRegions': this.readRegions.bind(this),
      'createRegion': this.createRegion.bind(this),
      'openSnackbarCreateRegion': this.openSnackbarCreateRegion.bind(this),
      'clear': this.clear.bind(this),
    };
    this.listeners = {
      'returnCreateRegion': this.returnCreateRegion.bind(this),
    };
    this.data = {
      valid: true,
      id: '',
      dialog: false,
      data: {
        name: ''
      },
      SnackbarCreateRegion: false,
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

  // Função para chamar Snackbar ao criar região
  openSnackbarCreateRegion(data) {
    return this.components_controller.SnackbarCreateRegion.methods.open(data);
  }

  // Função ler regiões
  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions');
  }

  // Função criar região
  createRegion() {
    let temvazio = false;
    if (!this.data.data.name) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarCreateRegion('Preencha todos os campos!');
    } else {
      this.send_to_server('region_create', this.data.data, 'returnCreateRegion');
      this.data.dialog = false;
    }
  }

  returnCreateRegion() {
    this.openSnackbarCreateRegion('Região cadastrada!');
    this.readRegions();
    this.clear();
  }
}

export default new DialogCreateRegions().$vue;