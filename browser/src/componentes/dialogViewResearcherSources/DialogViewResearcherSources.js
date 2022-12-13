import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import Routes from '../../routes/Routes';

// DIALOG PARA MOSTRAR AS FONTES ASSOCIADAS AO PESQUISADOR
class DialogViewResearcherSources extends Basic {
    constructor() {
        super('DialogViewResearcherSources');
        this.components = {};
        this.methods = {
            'open': this.open.bind(this),
            'callMethod': this.callMethod.bind(this),
            'closeDialog': this.closeDialog.bind(this),
        };
        this.listeners = {
            // 'returnSourceRemove': this.returnSourceRemove.bind(this),
        };
        this.data = {
            dialog: false,
            loading: false,
            search: '',
            source: [],
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

    open() {
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
}

export default new DialogViewResearcherSources().$vue;