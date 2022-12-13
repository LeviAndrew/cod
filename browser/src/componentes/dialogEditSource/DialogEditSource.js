import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarEditSource from "../snackbars/snackbarSourceManager/SnackbarEditSource.vue";

class DialogEditSource extends Basic {
  constructor() {
    super('DialogEditSource');
    this.components = {
      SnackbarEditSource: SnackbarEditSource
    };
    this.methods = {
      'open': this.open.bind(this),
      'callMethod': this.callMethod.bind(this),
      'closeDialog': this.closeDialog.bind(this),
      'updateSource': this.updateSource.bind(this),
      'readSourcebyId': this.readSourcebyId.bind(this),
      'readSourcesbyRegion': this.readSourcesbyRegion.bind(this),
      'readResearchers': this.readResearchers.bind(this),
      'openSnackbarEditSource': this.openSnackbarEditSource.bind(this),
    };
    this.listeners = {
      'returnSourceUpdate': this.returnSourceUpdate.bind(this),
      'returnSourcebyId': this.returnSourcebyId.bind(this),
      'returnReadResearchers': this.returnReadResearchers.bind(this),
    };
    this.data = {
      sources: [],
      regions: [],
      users: [],
      id: '',
      dialog: false,
      data: {
        regionId: [],
        source: {
          name: '',
          products: [],
          code: '',
          researchers: [],
          address: {
            state: '',
            city: '',
            neighborhood: '',
            street: '',
            postalCode: '',
            number: ''
          }
        }
      },
      SnackbarEditSource: false,
    };
    this.wiring();
    this.onReady = [];
  }

  // FUNÇÃO PARA ABRIR SNACKBAR DE SOURCE
  openSnackbarEditSource(data) {
    return this.components_controller.SnackbarEditSource.methods.open(data);
  }

  open(data) {
    this.data.data.id = data;
    this.readSourcebyId(this.data.data.id);
    this.readResearchers();
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

  // FUNÇÃO LER PESQUISAORES
  readResearchers() {
    this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
  }

  returnReadResearchers(msg) {
    if (msg.datas.data.length > 0) {
      this.data.users = msg.datas.data.map(user => {
        return {
          text: user.name,
          value: {
            id: user.id,
          }
        }
      });
    } else {
      this.data.users = [];
    }
  }

  // Ler fontes por Id (vem tudo)
  readSourcebyId(id) {
    this.send_to_server('source_read_id', {sourceId: id}, 'returnSourcebyId');
  }

  returnSourcebyId(msg) {
    if (msg.datas.data.length > 0) {
      this.data.sources = msg.datas.data[0];
      this.data.data.source.name = this.data.sources.name;
      this.data.data.source.address.postalCode = this.data.sources.address.postalCode;
      this.data.data.source.address.neighborhood = this.data.sources.address.neighborhood.name;
      this.data.data.source.address.street = this.data.sources.address.street;
      this.data.data.source.address.number = this.data.sources.address.number;
      this.data.dialog = true;
    } else {
      this.data.sources = [];
    }
  }

  // Função editar fonte
  updateSource(id) {
    let data = {
      id: id,
      update: {
        name: this.data.data.source.name,
        address: {
          neighborhood: this.data.data.source.address.neighborhood,
          street: this.data.data.source.address.street,
          postalCode: this.data.data.source.address.postalCode,
          number: this.data.data.source.address.number
        }
      }
    };
    let temvazio = false;
    if (!this.data.data.source.name || !this.data.data.source.address.neighborhood || !this.data.data.source.address.street ||
      !this.data.data.source.address.postalCode || !this.data.data.source.address.number) {
      temvazio = true;
    }
    if (temvazio === true) {
      this.openSnackbarEditSource('Preencha todos os campos!');
    } else {
      this.send_to_server('source_update', data, 'returnSourceUpdate');
      this.data.dialog = false;
    }
  }

  returnSourceUpdate() {
    this.openSnackbarEditSource('Fonte editada!');
    this.readSourcesbyRegion();
    this.readSourcebyId();
  }

  // Ler fontes por região (vem apenas nome e id)
  readSourcesbyRegion(id) {
    this.send_to_server('source_read_region', {regionId: id}, 'returnReadSourcesbyRegion');
  }
}

export default new DialogEditSource().$vue;