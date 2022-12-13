<style>
    .region-filter {
        width: 20%;
        top: 10px;
        position: relative;
    }

    .search_source_btn {
        top: 10px;
        left: 5px;
    }

    .headline {
        height: 3em;
    }
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="800px">
            <!--Inicio da tabela-->
            <v-card>
                <v-card>
                    <v-card-title class="headline">
                        <!--Select de fontes-->
                        <v-layout class="region-filter" v-if="regions.length !== 1">
                            <v-autocomplete :items="regions"
                                            v-model="data.regionId"
                                            label="Selecione a região"
                                            item-text="name"
                                            item-value="id">
                            </v-autocomplete>
                        </v-layout>
                        <v-btn dark
                               icon
                               color="teal"
                               class="search_source_btn"
                               v-if="regions.length !== 1"
                               @click="readSourcesbyRegion(data.regionId)">
                            <v-icon>search</v-icon>
                        </v-btn>

                        <v-layout row wrap v-if="regions.length === 1">
                            <h5>
                                {{regions[0].name}}
                            </h5>
                        </v-layout>

                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <!--Search-->
                        <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Pesquisar"
                                single-line
                                hide-details>
                        </v-text-field>
                    </v-card-title>
                </v-card>

                <!--Tabela de fontes-->
                <v-data-table
                        :headers="headers"
                        :items="sources"
                        :search="search"
                        v-model="fontId"
                        rows-per-page-text=""
                        :rows-per-page-items="rows"
                        no-data-text="Não há fontes disponíveis"
                        item-key="name"
                        style="max-height: 400px"
                        class="scroll-y elevation-1">
                    <template slot="items" slot-scope="source">
                        <td>{{ source.item.name }}</td>
                        <td class="justify-center layout px-0">

                            <!--Botão conectar pesquisador á fonte-->
                            <v-btn icon class="mx-0" @click="connectResearcherToSource(source.item.id)">
                                <v-icon color="green">done</v-icon>
                            </v-btn>

                        </td>
                    </template>
                    <!--Alerta do search-->
                    <v-alert slot="no-results" :value="true" color="error" icon="warning">
                        Não foi encontrada nenhuma fonte com o nome: "{{ search }}".
                    </v-alert>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarConnectResearcher></SnackbarConnectResearcher>
    </div>
</template>
<script src="./DialogConnectResearcher.js"></script>