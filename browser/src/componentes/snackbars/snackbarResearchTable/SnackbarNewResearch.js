import Basic from '../../../utils/BasicComponents';
import CacheValues from '../../../utils/CacheValues';

// !!!!!!! ESSE SCNACKBAR ESTA SENDO CHAMADO NA PÁGINA DE CESTA DE PRODUTOS !!!!!!!!

// FUNÇÃO SNACKBAR PARA CRIAR NOVA PESQUISA NO SISTEMA (a partir do zero)
class SnackbarNewResearch extends Basic {
  constructor() {
    super('SnackbarNewResearch');
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

export default new SnackbarNewResearch().$vue;