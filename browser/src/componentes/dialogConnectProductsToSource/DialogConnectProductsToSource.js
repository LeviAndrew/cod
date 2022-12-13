import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarConnectProductsToSource from "../snackbars/snackbarSourceManager/SnackbarConnectProductsToSource.vue";

class DialogConnectProductsToSource extends Basic {
  constructor() {
    super('DialogConnectProductsToSource');
    this.components = {
      SnackbarConnectProductsToSource: SnackbarConnectProductsToSource
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'connectProducts': this.connectProducts.bind(this),
      'readBasket': this.readBasket.bind(this),
      'openSnackbarConnectProductsToSource': this.openSnackbarConnectProductsToSource.bind(this),
    };
    this.listeners = {
      'returnConnectProducts': this.returnConnectProducts.bind(this),
      'returnReadBasket': this.returnReadBasket.bind(this),
    };
    this.data = {
      alreadyAssociated: [],
      valid: true,
      loading: false,
      dialog: false,
      search: '',
      selected: [],
      regions: [],
      productsId: [],
      region: '',
      regionId: '',
      sourceId: '',
      id: '',
      basket: [],
      headers: [
        {
          text: 'Produtos',
          align: 'left',
          sortable: false,
          value: 'name'
        },
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
      SnackbarConnectProductsToSource: false
    }
    ;
    this.wiring();
  }

  open(ids) {
    this.data.regionId = ids.regionId;
    this.data.sourceId = ids.sourceId;
    this.data.dialog = true;
    this.readBasket(this.data.regionId);
  }

  closeDialog() {
    this.data.dialog = false;
    this.data.selected = [];
  }

  callMethod(method) {
    if (!method) {
      this.closeDialog();
    } else {
      this[method]();
    }
  }

// Função abrir Snackbar ao associar produtos
  openSnackbarConnectProductsToSource(data) {
    return this.components_controller.SnackbarConnectProductsToSource.methods.open(data);
  }

// Função ler cesta de produto
  readBasket(id) {
    this.send_to_server('read_product_basket', {regionId: id}, 'returnReadBasket');
  }

  // todo: fazer com que um item associado já apareça como selected
  returnReadBasket(msg) {
    // console.log('selected recebe', this.data.selected);
    // if (this.data.selected.length !== 0) {
    //   console.log('tem selected');
    //   for (let prod in msg.datas.data[0].basket) {
    //     for (let i in this.data.selected) {
    //       if (msg.datas.data[0].basket[prod].product.id === this.data.selected[i].id) {
    //         console.log('deu boa');
    //         this.data.alreadyAssociated = this.data.selected;
    //       }
    //     }
    //   }
    // }

    let productPattern = [];
    if (msg.datas.data.length > 0) {
      for (let i = 0; i < msg.datas.data[0].basket.length; i++) {
        productPattern.push(msg.datas.data[0].basket[i].product);
      }
    }
    if (msg.datas.data.length > 0) {
      this.data.basket = productPattern;
    }
    else {
      this.data.basket = [];
    }
  }

// Função associar produtos á fonte
  connectProducts(selected) {
    let prodsId = [];
    for (let prod in selected) {
      prodsId.push(selected[prod].id);
    }
    let data = {
      sourceId: this.data.sourceId,
      productsId: prodsId,
    };
    this.send_to_server('connect_products_source', data, 'returnConnectProducts');
  }

  returnConnectProducts(msg) {
    if (msg.datas.success === false) {
      this.openSnackbarConnectProductsToSource('Selecione pelo menos um produto!');
    } else {
      this.openSnackbarConnectProductsToSource('Produtos associados!');
      // this.data.selected.push(this.data.alreadyAssociated);
      this.data.selected = [];
      this.data.dialog = false;
      this.readBasket();
    }
  }
}

export default new DialogConnectProductsToSource().$vue;