import Basic from '../../utils/BasicComponents';
import SnackbarImportBasket from "../../componentes/snackbars/snackbarProductBasket/SnackbarImportBasket.vue";
import DialogNewResearch from "../../componentes/dialogNewResearch/DialogNewResearch.vue";

class ProductBasket extends Basic {
  constructor() {
    super('ProductBasket');
    this.data = {
      load: false,
      loading: false,
      disabled: false,
      search: '',
      id: '',
      regions: [],
      regionId: '',
      pagination: {},
      basket: [],
      headers: [
        {
          text: 'Cesta',
          align: 'left',
          sortable: false,
          value: 'name'
        },
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
      SnackbarImportBasket: false,
      DialogNewResearch: false,
    };
    this.methods = {
      'readBasket': this.readBasket.bind(this),
      'importBasket': this.importBasket.bind(this),
      'baixarPadrao': this.baixarPadrao.bind(this),
      'openDialogNewResearch': this.openDialogNewResearch.bind(this),
    };
    this.components = {
      SnackbarImportBasket: SnackbarImportBasket,
      DialogNewResearch: DialogNewResearch,
    };
    this.listeners = {
      'returnReadRegionsBasket': this.returnReadRegionsBasket.bind(this),
      'returnReadBasket': this.returnReadBasket.bind(this),
      'returnImportBasket': this.returnImportBasket.bind(this),
    };
    this.watch = {};
    this.wiring();
    this.onReady = [
      this.readRegionsBasket.bind(this),
    ];
  }

  // Abrir Dialog de criar nova pesquisa a partir do zero
  openDialogNewResearch(data) {
    if (!this.data.regionId) {
      this.openSnackbarImportBasket('Selecione uma região primeiro!');
    } else {
      return this.components_controller.DialogNewResearch.methods.open(data);
    }
  }

  // Função disabilitar botões(importar cesta e baixar padrão)
  HideButtonTrue() {
    this.data.disabled = true;
  }

  // Função re-habilitar botões(importar cesta e baixar padrão)
  HideButtonFalse() {
    this.data.disabled = false;
  }

  // Função importar cesta do Excel
  importBasket(id) {
    if (!this.data.regionId) {
      this.openSnackbarImportBasket('Selecione uma região primeiro!');
    } else {
      this.$instance.$refs.importBasket.onchange = event => {
        let file = event.target.files[0];
        this.to_base_64_promise(file)
          .then((ret) => {
            this.send_to_server('import_basket', {regionId: id, document: ret}, 'returnImportBasket');
            this.data.load = true;
          })
          .catch((error) => {
            console.log(error);
          })
      };
      this.$instance.$refs.importBasket.click();
    }
  }

  returnImportBasket() {
    this.readBasket(this.data.regionId);
    this.data.load = false;
    this.HideButtonTrue();
    this.openSnackbarImportBasket('Importação concluída!');
  }

  // Função baixar padrão de cesta
  baixarPadrao() {
    return this.siom.windowOpen('/api/open/baseBasketUpdate');
  }

  to_base_64_promise(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((success, fail) => {
      reader.onload = () => {
        const base = 'base64,';
        let ret = reader.result.slice(reader.result.indexOf(base) + base.length, reader.result.length);
        success(ret);
      };
      reader.onerror = (error) => {
        fail(error);
      };
    })
  }

  // Função ler cesta de produtos
  readBasket(id) {
    if (!id) {
      this.openSnackbarImportBasket('Selecione a região primeiro!');
    } else {
      this.send_to_server('read_product_basket', {regionId: id}, 'returnReadBasket');
      this.data.loading = true;
    }
  }

  returnReadBasket(msg) {
    let productPattern = [];
    if (msg.datas.data.length > 0) {
      for (let i = 0; i < msg.datas.data[0].basket.length; i++) {
        productPattern.push(msg.datas.data[0].basket[i].product);
      }
    }
    if (msg.datas.data.length > 0) {
      this.data.basket = productPattern;
      this.HideButtonTrue();
    }
    else {
      this.data.basket = [];
      this.HideButtonFalse();
    }
    this.data.loading = false;
  }

  // Função ler regiões
  readRegionsBasket() {
    this.send_to_server('read_all_regions', null, 'returnReadRegionsBasket')
  }

  returnReadRegionsBasket(msg) {
    // quando só tem uma região ele ja lê a cesta.
    if (msg.datas.data.length === 1) {
      this.data.regionId = msg.datas.data[0].id;
      this.readBasket(this.data.regionId);
    }
    // quando tem mais de uma região tem de selecionar alguma.
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data;
    } else {
      this.data.regions = [];
    }
  }

  // Função para abrir Snackbar ao importar cesta
  openSnackbarImportBasket(data) {
    return this.components_controller.SnackbarImportBasket.methods.open(data);
  }
}

export default new ProductBasket().$vue;