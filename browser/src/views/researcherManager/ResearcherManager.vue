<style lang="scss">
    .researcher_card {
        width: 90%;
        left: 5%;
        top: 30px
    }

    .registerResearcher {
        position: relative;
        margin-bottom: 30px;
        left: 20%;
    }

    .search {
        width: 1px;
    }
</style>
<template>
    <div>
        <v-layout align-center justify-center>
            <v-flex fluid>
                <v-card class="researcher_card">
                    <v-card-title>
                        <!--Registrar pesquisadores-->
                        <v-tooltip top>
                            <v-btn @click="openDialogCreateResearcher()" color="teal" dark small top
                                   left fab slot="activator">
                                <v-icon>add</v-icon>
                            </v-btn>
                            <span>Adicionar pesquisador</span>
                        </v-tooltip>

                        <!--Search-->
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <v-text-field
                                v-model="search"
                                class="search"
                                append-icon="search"
                                label="Pesquisar"
                                single-line
                                hide-details>
                        </v-text-field>
                    </v-card-title>

                    <!--Ler pesquisadores-->
                    <v-data-table
                            :headers="headers"
                            :items="users"
                            :search="search"
                            rows-per-page-text=""
                            :rows-per-page-items="rows"
                            no-data-text="Não há pesquisadores disponíveis"
                            :loading="loading">
                        <template slot="items" slot-scope="user">
                            <td>{{ user.item.name }}&nbsp{{user.item.surname}}</td>
                            <td class="justify-center layout px-0">

                                <!--EDITAR PESQUISADOR-->
                                <v-tooltip bottom>
                                    <v-btn @click="openDialogEditResearcher(user.item)" slot="activator" dark icon class="mx-0">
                                        <v-icon color="teal">edit</v-icon>
                                    </v-btn>
                                    <span>Editar</span>
                                </v-tooltip>

                                <!--REMOVER PESQUISADOR-->
                                <v-tooltip bottom>
                                    <v-btn slot="activator" @click="openDialogRemoveResearcher(user.item)" dark icon class="mx-0">
                                        <v-icon color="red">delete</v-icon>
                                    </v-btn>
                                    <span>Remover</span>
                                </v-tooltip>

                                <!--ASSOCIAR PESQUISADOR A FONTE-->
                                <v-tooltip bottom>
                                    <v-btn slot="activator" @click="openDialogConnectResearcher(user.item)" dark icon class="mx-0">
                                        <v-icon color="blue">touch_app</v-icon>
                                    </v-btn>
                                    <span>Associar fonte</span>
                                </v-tooltip>

                                <!--BOTÃO VISUALIZAR FONTES ASSOCIADAS-->
                                <v-tooltip bottom>
                                    <v-btn v-if="false" slot="activator" @click="openDialogViewResearcherSources()" dark icon class="mx-0">
                                        <v-icon color="green">book</v-icon>
                                    </v-btn>
                                    <span>Visualizar fontes associadas</span>
                                </v-tooltip>

                            </td>
                        </template>
                        <v-alert slot="no-results" :value="true" color="error" icon="warning">
                            Não foi encontrado nenhum pesquisador com o nome: "{{ search }}".
                        </v-alert>
                        <!--Mensagem quando não há nenhum dado-->
                        <template slot="no-data">
                            <v-layout align-center justify-center>Não há pesquisadores disponíveis</v-layout>
                        </template>
                    </v-data-table>
                </v-card>
            </v-flex>
        </v-layout>
        <DialogEditResearcher></DialogEditResearcher>
        <DialogRemoveResearcher></DialogRemoveResearcher>
        <DialogConnectResearcher></DialogConnectResearcher>
        <DialogCreateResearcher></DialogCreateResearcher>
        <DialogViewResearcherSources></DialogViewResearcherSources>
    </div>
</template>
<script src="./ResearcherManager.js"></script>