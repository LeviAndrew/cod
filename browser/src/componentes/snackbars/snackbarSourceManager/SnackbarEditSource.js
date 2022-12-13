import Basic from '../../../utils/BasicComponents';
import CacheValues from '../../../utils/CacheValues';

// FUNÇÃO SNACKBAR PARA EDITAR FONTE
class SnackbarEditSource extends Basic {
  constructor() {
    super('SnackbarEditSource');
    this.data = {
      text: '',
      snackbar: false,
    };

    this.methods = {
      'open': this.open.bind(this),
      'close': this.close.bind(this)
    };
    this.components = {};
    this.listeners = {};
    this.watch = {};
    this.wiring();
  }

  open(data) {
    this.data.snackbar = true;
    this.data.text = data;
  }

  close() {
    this.data.snackbar = false;
  }
}

export default new SnackbarEditSource().$vue;