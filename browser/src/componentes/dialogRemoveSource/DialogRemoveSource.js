import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';
import SnackbarRemoveSource from "../snackbars/snackbarSourceManager/SnackbarRemoveSource.vue";

class DialogRemoveSource extends Basic {
    constructor() {
        super('DialogRemoveSource');
        this.components = {
            SnackbarRemoveSource: SnackbarRemoveSource
        };
        this.methods = {
            'open': this.open.bind(this),
            'callMethod': this.callMethod.bind(this),
            'closeDialog': this.closeDialog.bind(this),
            'readSourcebyId': this.readSourcebyId.bind(this),
            'removeSource': this.removeSource.bind(this),
            'openSnackbarRemoveSource': this.openSnackbarRemoveSource.bind(this),
        };
        this.listeners = {
            'returnSourceRemove': this.returnSourceRemove.bind(this),
        };
        this.data = {
            id: '',
            loading: false,
            dialogRemove: false,
            regionId: '',
            regionId2: ''
        };
        this.wiring();
    }

    // FUNÇÃO PARA ABRIR SNACKBAR DE SOURCE
    openSnackbarRemoveSource(data) {
        return this.components_controller.SnackbarRemoveSource.methods.open(data);
    }

    open(data) {
        this.data.regionId = data.region;
        this.data.regionId2 = data.regionId2;
        this.data.id = data.source.id;
        this.data.dialogRemove = true;
    }

    closeDialog() {
        this.data.dialogRemove = false;
    }

    callMethod(method) {
        if (!method) {
            this.closeDialog();
        } else {
            this[method]();
        }
    }

    // LER FONTE POR ID
    readSourcebyId(id) {
        this.send_to_server('source_read_id', {sourceId: id}, 'returnSourcebyId');
    }

    // REMOVER FONTE
    removeSource(id) {
        this.send_to_server('source_remove', {id: id}, 'returnSourceRemove');
        this.data.loading = true;
    }

    returnSourceRemove() {
        this.readSourcesbyRegion();
        this.data.loading = false;
        this.data.dialogRemove = false;
        this.openSnackbarRemoveSource('Fonte removida!');
    }

    // Função ler fontes por região
    readSourcesbyRegion() {
        let data = {
            regionId: this.data.regionId2
        };
        this.send_to_server('source_read_region', data, 'returnReadSourcesbyRegion');
        this.data.loading = true;
    }
}

export default new DialogRemoveSource().$vue;