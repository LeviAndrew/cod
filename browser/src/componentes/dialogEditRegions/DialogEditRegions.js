import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarEditRegion from "../snackbars/scnackbarRegionManager/SnackbarEditRegion.vue";

class DialogEditRegions extends Basic {
  constructor() {
    super('DialogEditRegions');
    this.components = {
      SnackbarEditRegion: SnackbarEditRegion
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'updateRegion': this.updateRegion.bind(this),
      'readRegions': this.readRegions.bind(this),
      'openSnackbarEditRegion': this.openSnackbarEditRegion.bind(this),
    };
    this.listeners = {
      'returnUpdateRegion': this.returnUpdateRegion.bind(this),
    };
    this.data = {
      id: '',
      data: {
        name: ''
      },
      dialogUpdate: false,
      SnackbarEditRegion: false,
    };
    this.wiring();
  }

  open(data) {
    this.data.id = data.id;
    this.data.data.name = data.name;
    this.data.dialogUpdate = true;
  }

  closeDialog() {
    this.data.dialogUpdate = false;
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

  // FUNÇÃO PARA ABRIR SNACKBAR DE REGION
  openSnackbarEditRegion(data) {
    return this.components_controller.SnackbarEditRegion.methods.open(data);
  }

  // LER REGIÃO
  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions');
  }

  // EDITAR REGIÃO
  updateRegion(id) {
    let data = {
      id: id,
      update: {
        name: this.data.data.name
      }
    };
    let temvazio = false;
    if (!this.data.data.name) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarEditRegion('Preencha todos os campos!');
    } else {
      this.send_to_server('region_update', data, 'returnUpdateRegion');
      this.data.dialogUpdate = false;
    }
  }

  returnUpdateRegion() {
    this.openSnackbarEditRegion('Região editada!');
    this.readRegions();
  }
}

export default new DialogEditRegions().$vue;