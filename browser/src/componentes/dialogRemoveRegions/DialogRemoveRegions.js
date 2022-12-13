import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarRemoveRegion from "../snackbars/scnackbarRegionManager/SnackbarRemoveRegion.vue";

class DialogRemoveRegions extends Basic {
  constructor() {
    super('DialogRemoveRegions');
    this.components = {
      SnackbarRemoveSource: SnackbarRemoveRegion
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'readRegions': this.readRegions.bind(this),
      'removeRegion': this.removeRegion.bind(this),
      'openSnackbarRemoveSource': this.openSnackbarRemoveSource.bind(this),
    };
    this.listeners = {
      'returnRemoveRegion': this.returnRemoveRegion.bind(this),
    };
    this.data = {
      id: '',
      dialogRemove: false,
      SnackbarRemoveSource: false,
    };
    this.wiring();
  }

  // FUNÇÃO PARA ABRIR SNACKBAR DE REGION
  openSnackbarRemoveSource(data) {
    return this.components_controller.SnackbarRemoveSource.methods.open(data);
  }

  open(data) {
    this.data.id = data.id;
    this.data.dialogRemove = true;
  }

  closeDialog() {
    this.data.dialogRemove = false;
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions');
  }

  removeRegion(id) {
    this.send_to_server('region_remove', {id: id}, 'returnRemoveRegion');
    this.data.dialogRemove = false;
  }

  returnRemoveRegion() {
    this.openSnackbarRemoveSource('Região removida!');
    this.readRegions();
  }
}

export default new DialogRemoveRegions().$vue;