import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import ReviewDetails from "../../componentes/reviewDetails/ReviewDetails.vue";

class Visitor extends Basic {
  constructor() {
    super('Visitor');
    this.data = {};
    this.methods = {};
    this.components = {};
    this.listeners = {};
    this.watch = {
      // Loader dos botões
      loader() {
        const l = this.loader;
        this[l] = !this[l];
        setTimeout(() => (this[l] = false), 1000);
        this.loader = null
      }
    };
    this.wiring();
    this.onReady = [];
  }

  // Função abrir mensagem(Snackbar) quando pesquisa é salva
  // openSnackbarSaveReview(data) {
  //   return this.components_controller.SnackbarSaveReview.methods.open(data);
  // }

}

export default new Visitor().$vue;