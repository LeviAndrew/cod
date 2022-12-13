import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarRemoveResearcher from "../snackbars/snackbarResearcherManager/SnackbarRemoveResearcher.vue";

class DialogRemoveResearcher extends Basic {
  constructor() {
    super('DialogRemoveResearcher');
    this.components = {
      SnackbarRemoveResearcher: SnackbarRemoveResearcher
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'removeResearchers': this.removeResearchers.bind(this),
      'openSnackbarResearcher': this.openSnackbarRemoveResearcher.bind(this),
    };
    this.listeners = {
      'returnRemoveResearchers': this.returnRemoveResearchers.bind(this),
    };
    this.data = {
      text: '',
      users: [],
      id: '',
      dialog: false,
      SnackbarRemoveResearcher: false,
    };
    this.wiring();
  }

  // FUNÇÃO PARA ABRIR SNACKBAR DE RESEARCHER
  openSnackbarRemoveResearcher(data) {
    return this.components_controller.SnackbarRemoveResearcher.methods.open(data);
  }

  open(data) {
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

  removeResearchers(id) {
    this.send_to_server('researcher_remove', {id: id}, 'returnRemoveResearchers');
    this.data.dialog = false;
  }

  returnRemoveResearchers() {
    this.openSnackbarRemoveResearcher('Pesquisador removido!');
    this.readResearchers();
  }
}

export default new DialogRemoveResearcher().$vue;