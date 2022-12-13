import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarCreateRegion from "../snackbars/scnackbarRegionManager/SnackbarCreateRegion.vue";

class DialogReadSourceproducts extends Basic {
  constructor() {
    super('DialogReadSourceproducts');
    this.components = {};
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
    };
    this.listeners = {
      'returnReadSourceProducts': this.returnReadSourceProducts.bind(this),
    };
    this.data = {
      loading: false,
      dialog: false,
      basket: [],
      sourceId: '',
      search: '',
      headers: [
        {
          text: 'Nome',
          align: 'left',
          sortable: false,
          value: 'name'
        }
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
    };
    this.wiring();
  }

  open(data) {
    this.data.dialog = true;
    this.data.sourceId = data;
    this.readSourceProducts();
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

  readSourceProducts() {
    this.send_to_server('source_read_products', {sourceId: this.data.sourceId}, 'returnReadSourceProducts');
    this.data.loading = true;
  }

  returnReadSourceProducts(msg) {
    if (msg.datas.data.products.length > 0) {
      this.data.basket = msg.datas.data.products;
    } else {
      this.data.basket = [];
    }
    this.data.loading = false;
  }

}

export default new DialogReadSourceproducts().$vue;