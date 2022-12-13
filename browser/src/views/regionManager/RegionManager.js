import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import DialogEditRegions from "../../componentes/dialogEditRegions/DialogEditRegions.vue";
import DialogRemoveRegions from "../../componentes/dialogRemoveRegions/DialogRemoveRegions.vue";
import DialogCreateRegions from "../../componentes/dialogCreateRegions/DialogCreateRegions.vue";

class RegionManager extends Basic {
  constructor() {
    super('RegionManager');
    this.data = {
      loading: false,
      user: CacheValues.getData('user'),
      regions: [],
      text: '',
      model: '',
      regionEdit: {},
      drawer: false,
      toolbartitle: 'Região',
      search: '',
      id: '',
      headers: [
        {
          text: 'Nome',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Ações',
          align: 'center',
          sortable: false,
          value: 'update'
        },
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
      DialogEditRegions: false,
      DialogRemoveRegions: false,
    };

    this.methods = {
      'ready': this.ready.bind(this),
      'readRegions': this.readRegions.bind(this),
      'editRegion': this.editRegion.bind(this),
      'openDialogEditRegions': this.openDialogEditRegions.bind(this),
      'openDialogRemoveRegions': this.openDialogRemoveRegions.bind(this),
      'openDialogCreateRegions': this.openDialogCreateRegions.bind(this),
    };
    this.components = {
      DialogEditRegions: DialogEditRegions,
      DialogRemoveRegions: DialogRemoveRegions,
      DialogCreateRegions: DialogCreateRegions
    };
    this.listeners = {
      'user_ready': this.ready.bind(this),
      'returnReadRegions': this.returnReadRegions.bind(this),
    };
    this.watch = {};
    this.onReady = [
      this.readRegions.bind(this),
    ];
    this.wiring();
  }

  ready() {
    this.send_to_browser('activate_toolbar', {});
  }

  // FUNÇÃO DIALOG PARA EDITAR REGIÃO
  openDialogEditRegions(data) {
    return this.components_controller.DialogEditRegions.methods.open(data);
  }

  // FUNÇÃO DIALOG PARA REMOVER REGIÃO
  openDialogRemoveRegions(data) {
    return this.components_controller.DialogRemoveRegions.methods.open(data);
  }

  // FUNÇÃO DIALOG PARA CRIAR REGIÃO
  openDialogCreateRegions() {
    return this.components_controller.DialogCreateRegions.methods.open();
  }

  // Função para pegar os dados de região e mostrar no dialog de editar.
  editRegion(region) {
    this.data.regionEdit = Object.assign({}, region);
  }

  // FUNÇÃO LER REGIÕES
  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions');
    this.data.loading = true;
  }

  returnReadRegions(msg) {
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data;
    } else {
      this.data.regions = [];
    }
    this.data.loading = false;
  }

}

export default new RegionManager().$vue;