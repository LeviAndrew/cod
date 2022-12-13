import Basic from '../../utils/BasicComponents';
import CacheValues from '../../utils/CacheValues';
import DialogEditResearcher from "../../componentes/dialogEditResearcher/DialogEditResearcher.vue";
import DialogRemoveResearcher from "../../componentes/dialogRemoveResearcher/DialogRemoveResearcher.vue";
import DialogConnectResearcher from "../../componentes/dialogConnectResearcher/DialogConnectResearcher.vue";
import DialogCreateResearcher from "../../componentes/dialogCreateResearcher/DialogCreateResearcher.vue";
import DialogViewResearcherSources from "../../componentes/dialogViewResearcherSources/DialogViewResearcherSources.vue";

class ResearcherManager extends Basic {
    constructor() {
        super('ResearcherManager');
        this.data = {
            loading: false,
            users: [],
            search: '',
            data: {
                name: '',
                surname: '',
                email: '',
                password: '',
                phoneNumber: '',
            },
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
                    value: 'actions'
                }
            ],
            rows: [10, 25, 50,
                {"text": "Todos", "value": -1}
            ],
            DialogEditResearcher: false,
            DialogRemoveResearcher: false,
            DialogConnectResearcher: false,
            DialogCreateResearcher: false,
            DialogViewResearcherSources: false,
        };

        this.methods = {
            'ready': this.ready.bind(this),
            'readResearchers': this.readResearchers.bind(this),
            'openDialogEditResearcher': this.openDialogEditResearcher.bind(this),
            'openDialogRemoveResearcher': this.openDialogRemoveResearcher.bind(this),
            'openDialogConnectResearcher': this.openDialogConnectResearcher.bind(this),
            'openDialogCreateResearcher': this.openDialogCreateResearcher.bind(this),
            'openDialogViewResearcherSources': this.openDialogViewResearcherSources.bind(this),
        };
        this.components = {
            DialogEditResearcher: DialogEditResearcher,
            DialogRemoveResearcher: DialogRemoveResearcher,
            DialogConnectResearcher: DialogConnectResearcher,
            DialogCreateResearcher: DialogCreateResearcher,
            DialogViewResearcherSources: DialogViewResearcherSources,
        };
        this.listeners = {
            'user_ready': this.ready.bind(this),
            'returnReadResearchers': this.returnReadResearchers.bind(this),
        };
        this.watch = {};
        this.onReady = [
            this.readResearchers.bind(this),
        ];
        this.wiring();
    }

    ready() {
        this.send_to_browser('activate_toolbar', {});
    }

    // FUNÇÃO DIALOG PARA EDITAR PESQUISADOR
    openDialogEditResearcher(data) {
        return this.components_controller.DialogEditResearcher.methods.open(data);
    }

    // FUNÇÃO DIALOG VISUALIZAR FONTES ASSOCIADAS AO PESQUISADOR
    openDialogViewResearcherSources(data) {
        return this.components_controller.DialogViewResearcherSources.methods.open(data);
    }

    // FUNÇÃO DIALOG PARA REMOVER PESQUISADOR
    openDialogRemoveResearcher(data) {
        return this.components_controller.DialogRemoveResearcher.methods.open(data);
    }

    // FUNÇÃO DIALOG PARA ASSOCIAR PESQUISADOR A FONTE
    openDialogConnectResearcher(data) {
        return this.components_controller.DialogConnectResearcher.methods.open(data.id);
    }

    // FUNÇÃO DIALOG PARA CRIAR PESQUISADOR
    openDialogCreateResearcher() {
        return this.components_controller.DialogCreateResearcher.methods.open();
    }

    readResearchers() {
        this.send_to_server('read_all_researchers', null, 'returnReadResearchers');
        this.data.loading = true;
    }

    returnReadResearchers(msg) {
        if (msg.datas.data.length > 0) {
            this.data.users = msg.datas.data;
        } else {
            this.data.users = [];
        }
        this.data.loading = false;
    }

}

export default new ResearcherManager().$vue;