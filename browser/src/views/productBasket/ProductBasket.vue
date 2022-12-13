<style>
    .basket_card {
        width: 90%;
        left: 5%;
        bottom: 50px
    }

    .regionSelect {
        width: 30%;
        left: 5%;
        bottom: 15px;
        position: relative;
    }

    .search-basket-button {
        top: 10px;
    }

    .search {
        width: 1px;
    }

    .regionName {
        position: relative;
        margin-top: 40px;
        bottom: 40px;
        left: 5%;
    }
</style>
<template>
    <div>
        <v-layout align-center justify-center>
            <v-flex fluid>

                <!--Select de região-->
                <v-container fluid v-if="regions.length !== 1">
                    <v-layout row wrap class="regionSelect">
                        <v-autocomplete :items="regions"
                                        v-model="regionId"
                                        label="Selecione a região"
                                        item-text="name"
                                        item-value="id">
                        </v-autocomplete>
                        <v-btn dark icon color="teal" class="search-basket-button" @click.native="readBasket(regionId)">
                            <v-icon>search</v-icon>
                        </v-btn>
                    </v-layout>
                </v-container>

                <v-container fluid v-if="regions.length === 1">
                    <v-layout row wrap>
                        <h2 class="regionName">
                            {{regions[0].name}}
                        </h2>
                    </v-layout>
                </v-container>

                <!--Inicio da tabela-->
                <v-card class="basket_card">
                    <v-card-title>

                        <!--Botão importar excel-->
                        <v-tooltip top>
                            <v-btn @click="importBasket(regionId)" slot="activator" icon :disabled="disabled">
                                <v-icon color="teal">vertical_align_top</v-icon>
                            </v-btn>
                            <span>Importar cesta</span>
                        </v-tooltip>
                        <input id="importBasket" ref="importBasket" type="file" style="display: none"
                               accept=".xls, .xlsx, .xlsm">

                        <!--Botão baixar padrao-->
                        <v-tooltip top>
                            <v-btn @click="baixarPadrao()" slot="activator" icon :disabled="disabled">
                                <v-icon color="teal">vertical_align_bottom</v-icon>
                            </v-btn>
                            <span>Baixar excel padrão</span>
                        </v-tooltip>

                        <!--Botão abrir nova pesquisa a partir do zero-->
                        <v-tooltip top>
                            <v-btn @click="openDialogNewResearch(regionId)" slot="activator" icon>
                                <v-icon color="teal">open_in_new</v-icon>
                            </v-btn>
                            <span>Abrir nova pesquisa para o sistema</span>
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

                    <!--Tabela de produtos-->
                    <v-data-table
                            item-key="name"
                            :headers="headers"
                            :items="basket"
                            :search="search"
                            :loading="load"
                            rows-per-page-text=""
                            :rows-per-page-items="rows"
                            no-data-text="Não há cesta disponível"
                            style="max-height: calc(100vh - 300px)"
                            class="scroll-y elevation-1">
                        <template slot="items" slot-scope="props">
                            <td v-for="">{{props.item.name}}</td>
                            <td class="justify-center layout px-0">
                                <!--AQUI VAI UNS BOTÕES TALVEZ-->
                            </td>
                        </template>
                        <!--Alerta do search-->
                        <v-alert slot="no-results" :value="true" color="error" icon="warning">
                            Não foi encontrado nenhum produto com o nome: "{{ search }}".
                        </v-alert>
                        <!--Mensagem quando não há nenhum dado-->
                        <template slot="no-data">
                            <v-layout align-center justify-center>Não há cestas disponíveis</v-layout>
                        </template>
                    </v-data-table>
                </v-card>
            </v-flex>
        </v-layout>
        <DialogNewResearch></DialogNewResearch>
        <SnackbarImportBasket></SnackbarImportBasket>
    </div>
</template>
<script src="./ProductBasket.js"></script>