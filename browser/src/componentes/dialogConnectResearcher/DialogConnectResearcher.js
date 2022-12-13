import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarConnectResearcher from "../snackbars/snackbarResearcherManager/SnackbarConnectResearcher.vue";

// Dialog para associar pesquisadores à fonte
class DialogConnectResearcher extends Basic {
  constructor() {
    super('DialogConnectResearcher');
    this.components = {
      SnackbarConnectResearcher: SnackbarConnectResearcher
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'connectResearcherToSource': this.connectResearcherToSource.bind(this),
      'readSourcesbyRegion': this.readSourcesbyRegion.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'readRegions': this.readRegions.bind(this),
      'openSnackbarConnectResearcher': this.openSnackbarConnectResearcher.bind(this),
    };
    this.listeners = {
      'returnConnectResearcherToSource': this.returnConnectResearcherToSource.bind(this),
      'returnReadRegions': this.returnReadRegions.bind(this),
      'returnReadSourcesbyRegion': this.returnReadSourcesbyRegion.bind(this),
    };
    this.data = {
      search: '',
      regions: [],
      sources: [],
      selected: [],
      id: '',
      dialog: false,
      fontId: [],
      researcherId: '',
      sourceId: [],
      data: {
        regionId: '',
      },
      headers: [
        {
          text: 'Fontes',
          align: 'left',
          sortable: false,
          value: 'name'
        },
        {
          text: 'Selecionar',
          align: 'center',
          sortable: false,
          value: 'selected'
        }
      ],
      rows: [10, 25, 50,
        {"text": "Todos", "value": -1}
      ],
      SnackbarConnectResearcher: false,
    };
    this.wiring();
  }

  open(data) {
    this.data.id = data;
    this.readRegions();
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

  // Função para abrir Snackbar ao conectar pesquisador
  openSnackbarConnectResearcher(data) {
    return this.components_controller.SnackbarConnectResearcher.methods.open(data);
  }

  // Função ler pesquisadores
  readResearchers() {
    this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
  }

  // Função ler fonte por região
  readSourcesbyRegion(id) {
    this.send_to_server('source_read_region', {regionId: id}, 'returnReadSourcesbyRegion');
  }

  returnReadSourcesbyRegion(msg) {
    if (msg.datas.data.length > 0) {
      this.data.sources = msg.datas.data;
    } else {
      this.data.sources = [];
    }
  }

  // TODO: FAZER RESTRIÇÃO PARA PESQUISADORES QUE JÁ TEM A FONTE ASSOCIADA
  // TODO: Mostrar apenas fontes não associadas ou colocar mensagem ali em baixo caso a fonte ja estiver associada
  // Função conectar pesquisador á fonte
  connectResearcherToSource(id) {
    let data = {
      researcherId: this.data.id,
      fontId: id
    };
    this.send_to_server('connect_researcher_source', data, 'returnConnectResearcherToSource');
  }

  returnConnectResearcherToSource(msg) {
    if (msg.datas.success === false) {
      this.openSnackbarConnectResearcher('Pesquisador já está associado a esta fonte!')
    } else {
      this.openSnackbarConnectResearcher('Pesquisador associado!');
      this.data.dialog = false;
    }
  }

  // Função ler regiões
  readRegions() {
    this.send_to_server('read_all_regions', null, 'returnReadRegions')
  }

  returnReadRegions(msg) {
    // Quando há apenas uma região, as fontes já são listadas
    if (msg.datas.data.length === 1) {
      this.data.regionId = msg.datas.data[0].id;
      this.readSourcesbyRegion(this.data.regionId);
    }
    if (msg.datas.data.length > 0) {
      this.data.regions = msg.datas.data;
    } else {
      this.data.regions = [];
    }
  }
}

export default new DialogConnectResearcher().$vue;