import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import DialogCreateSource from "../../componentes/dialogCreateSource/DialogCreateSource.vue";
import DialogRemoveSource from "../../componentes/dialogRemoveSource/DialogRemoveSource.vue";
import DialogEditSource from "../../componentes/dialogEditSource/DialogEditSource.vue";
import DialogConnectProductsToSource
    from "../../componentes/dialogConnectProductsToSource/DialogConnectProductsToSource.vue";
import DialogReadSourceproducts from "../../componentes/dialogReadSourceproducts/DialogReadSourceproducts.vue";
import SnackbarSource from "../../componentes/snackbars/snackbarSourceManager/SnackbarSource.vue";

class SourceManager extends Basic {
    constructor() {
        super('SourceManager');
        this.data = {
            loading: false,
            sources: [],
            sourceId: [],
            selected: [],
            regions: [],
            newRegionId: '',
            sourceEdit: {
                address: {
                    neighborhood: {}
                }
            },
            users: [],
            search: '',
            dialogRegion: false,
            dialog: false,
            model: '',
            drawer: false,
            data: {
                regionId: [],
                source: {
                    name: '',
                    products: [],
                    code: '',
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
                }
            ],
            rows: [10, 25, 50,
                {"text": "Todos", "value": -1}
            ],
            close() {
                this.dialog = false;
            },
            DialogCreateSource: false,
            DialogRemoveSource: false,
            DialogEditSource: false,
            DialogConnectProductsToSource: false,
            DialogReadSourceproducts: false,
        };

        this.methods = {
            'readSourcesbyRegion': this.readSourcesbyRegion.bind(this),
            'editSource': this.editSource.bind(this),
            'openDialogCreateSource': this.openDialogCreateSource.bind(this),
            'openDialogRemoveSource': this.openDialogRemoveSource.bind(this),
            'openDialogEditSource': this.openDialogEditSource.bind(this),
            'openDialogConnectProductsToSource': this.openDialogConnectProductsToSource.bind(this),
            'openDialogReadSourceproducts': this.openDialogReadSourceproducts.bind(this),
        };
        this.components = {
            DialogCreateSource: DialogCreateSource,
            DialogRemoveSource: DialogRemoveSource,
            DialogEditSource: DialogEditSource,
            DialogConnectProductsToSource: DialogConnectProductsToSource,
            DialogReadSourceproducts: DialogReadSourceproducts,
            SnackbarSource: SnackbarSource,
        };
        this.listeners = {
            'returnReadRegionsSource': this.returnReadRegionsSource.bind(this),
            'returnReadSourcesbyRegion': this.returnReadSourcesbyRegion.bind(this),
        };
        this.watch = {};
        this.wiring();
        this.onReady = [
            this.readRegionsSource.bind(this),
        ];
    }

    // Função para abrir Snackbar(mensagem)
    openSnackbarSource(data) {
        return this.components_controller.SnackbarSource.methods.open(data);
    }

    // Função dialog criar fonte
    openDialogCreateSource() {
        return this.components_controller.DialogCreateSource.methods.open(this.data.regionId);
    }

    // Função dialog remover fonte
    openDialogRemoveSource(data1, data2) {
        let data = {
            source: data1,
            region: data2,
            regionId2: this.data.regionId
        };
        return this.components_controller.DialogRemoveSource.methods.open(data);
    }

    // Função dialog editar fonte
    openDialogEditSource(data) {
        return this.components_controller.DialogEditSource.methods.open(data.id);
    }

    // Função dialog associar produtos a fonte
    openDialogConnectProductsToSource(data1, data2) {
        if (data2.length === 0) {
            this.data.newRegionId = this.data.regionId;
        } else {
            this.data.newRegionId = data2;
        }
        let ids = {
            sourceId: data1,
            regionId: this.data.newRegionId,
        };
        return this.components_controller.DialogConnectProductsToSource.methods.open(ids);
    }

    // Função dialog ler produtos da fonte
    openDialogReadSourceproducts(data) {
        return this.components_controller.DialogReadSourceproducts.methods.open(data);
    }

    // Função ler regiões
    readRegionsSource() {
        this.send_to_server('read_all_regions', null, 'returnReadRegionsSource')
    }

    returnReadRegionsSource(msg) {
        // para não precisar trocar o nome de todos os retornos da mesma função
        if (msg.source !== this) return;
        // quando só tem uma região ele ja lê as fontes.
        if (msg.datas.data.length === 1) {
            this.data.regionId = msg.datas.data[0].id;
            this.readSourcesbyRegion(this.data.regionId);
        }
        // quando tem mais de uma região tem de selecionar alguma.
        if (msg.datas.data.length > 0) {
            this.data.regions = msg.datas.data;
        } else {
            this.data.regions = [];
        }
    }

    // Função ler fontes por região
    readSourcesbyRegion(id) {
        if (id.length === 0) {
            this.openSnackbarSource('Selecione uma região primeiro!');
        } else {
            this.send_to_server('source_read_region', {regionId: id}, 'returnReadSourcesbyRegion');
            this.data.loading = true;
        }
    }

    returnReadSourcesbyRegion(msg) {
        if (msg.datas.data.length > 0) {
            this.data.sources = msg.datas.data;
        } else {
            this.data.sources = [];
        }
        this.data.loading = false;
    }

    // Função para pegar os dados de fontes e mostrar no dialog de editar.
    editSource(source) {
        this.data.sourceEdit = Object.assign({}, source);
    }
}

export default new SourceManager().$vue;