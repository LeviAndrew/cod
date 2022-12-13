<style>
    .source_filter {
        left: 1%;
        top: 10px;
        position: relative;
    }

    .search_source_btn {
        top: 10px;
    }

    .td {
        padding: 1px;
        margin-top: -2px;
    }

    .ecxelbtn {
        top: 8px;
    }

    .headline {
        max-height: 3em;
    }

    .searchChecked {
        background-color: #4DB6AC;
    }
</style>
<template>
    <div>
        <v-layout align-center justify-center>
            <v-flex fluid>
                <!--Inicio da tabela-->
                <v-card>
                    <v-card-title class="headline">

                        <!--Select(filtro) de fontes-->
                        <v-layout class="source_filter">

                            <v-form class="form" ref="form" v-model="valid" v-show="!productCode"
                                    lazy-validation>
                                <v-flex xs12 sm16 d-flex>
                                    <v-autocomplete :items="sources"
                                                    v-model="sourceId"
                                                    no-data-text="Não há fontes"
                                                    label="Selecione a fonte"
                                                    item-text="name"
                                                    item-value="id"
                                                    @change="disableButton()">
                                    </v-autocomplete>
                                </v-flex>
                            </v-form>

                            <!--Botão filtrar por fonte-->
                            <v-tooltip bottom v-show="!!sourceId">
                                <v-btn dark
                                       slot="activator"
                                       icon
                                       color="teal"
                                       class="search_source_btn"
                                       @click.native="readSearchesbySource(sourceId)">
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <span>Filtrar</span>
                            </v-tooltip>

                            <v-form class="form" ref="form" v-model="valid" v-show="!sourceId"
                                    lazy-validation style="margin-left: 0.5em">
                                <v-flex xs12 sm16 d-flex>
                                    <v-autocomplete :items="products"
                                                    v-model="productCode"
                                                    no-data-text="Não há fontes"
                                                    label="Selecione o produto"
                                                    item-text="name"
                                                    item-value="code">
                                    </v-autocomplete>
                                </v-flex>
                            </v-form>

                            <!--Botão filtrar por Produto-->
                            <v-tooltip bottom v-show="!!productCode">
                                <v-btn dark
                                       slot="activator"
                                       icon
                                       color="teal"
                                       class="search_source_btn"
                                       @click.native="readSearchesByProductCode()">
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <span>Filtrar</span>
                            </v-tooltip>

                            <!--Botão para limpar filtro de fonte-->
                            <v-tooltip bottom>
                                <v-btn dark
                                       slot="activator"
                                       icon
                                       class="search_source_btn"
                                       @click="clear(); readSearchers()">
                                    <v-icon color="teal">clear</v-icon>
                                </v-btn>
                                <span>Limpar filtro</span>
                            </v-tooltip>

                            <!--Botão para importar padrão de pesquisa excel-->
                            <v-tooltip bottom>
                                <v-btn class="ecxelbtn"
                                       slot="activator"
                                       icon
                                       :disabled="disabled"
                                       @click="downloadExcel()">
                                    <v-icon color="teal" medium>
                                        vertical_align_bottom
                                    </v-icon>
                                </v-btn>
                                <span>Baixar padrão excel</span>
                            </v-tooltip>
                        </v-layout>

                        <v-spacer></v-spacer>
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

                    <!--Tabela de pesquisa-->
                    <v-data-table
                            :headers="headers"
                            :items="searches"
                            :search="search"
                            rows-per-page-text=""
                            :rows-per-page-items="rows"
                            no-data-text="Não há pesquisas disponíveis"
                            :loading="load"
                            class="elevation-1 scroll-y"
                            style="max-height: calc(100vh - 200px); table-layout: fixed">
                        <template slot="items" slot-scope="props">

                            <tr v-bind:class="{searchChecked: props.item.searchChecked}">
                                <!--Código-->
                                <td class="text-xs-left"
                                    style="border-right: solid thin lightgray; font-size: 11px">
                                    {{props.item.code}}
                                </td>

                                <!--Nome do produto-->
                                <td class="text-xs-left"
                                    style="border-right: solid thin lightgray; font-size: 11px">
                                    {{props.item.name}}
                                </td>

                                <!--Nome da fonte-->
                                <td class="text-xs-left"
                                    style="border-right: solid thin lightgray; font-size: 11px">
                                    {{props.item.source.name}}
                                </td>

                                <!--Especificação 1-->
                                <td class="text-xs-left"
                                    style="border-right: solid thin lightgray">
                                    <v-flex xs8 d-flex align-center>
                                        <v-text-field style="font-size: 11px; padding-top: 1px"
                                                      v-model="props.item.especOne">
                                        </v-text-field>
                                        <v-flex xs2>
                                            <v-tooltip bottom>
                                                <v-btn dark
                                                       small
                                                       slot="activator"
                                                       icon
                                                       @click="openWindow(props.item.especOne)">
                                                    <v-icon color="blue" medium>
                                                        mdi-eye-outline
                                                    </v-icon>
                                                </v-btn>
                                                <span>{{props.item.especOne}}</span>
                                            </v-tooltip>
                                        </v-flex>
                                    </v-flex>
                                </td>

                                <!--Especificação 2-->
                                <td class="text-xs-left"
                                    style="border-right: solid thin lightgray">
                                    <v-layout>
                                        <v-flex xs10 d-flex align-center>
                                            <v-text-field style="font-size: 11px; padding-top: 1px"
                                                          v-model="props.item.especTwo"></v-text-field>
                                            <v-flex xs2>
                                                <v-tooltip bottom>
                                                    <v-btn dark
                                                           small
                                                           slot="activator"
                                                           icon
                                                           @click="openWindow(props.item.especTwo)">
                                                        <v-icon color="blue">
                                                            mdi-eye-outline
                                                        </v-icon>
                                                    </v-btn>
                                                    <span>{{props.item.especTwo}}</span>
                                                </v-tooltip>
                                            </v-flex>
                                        </v-flex>
                                    </v-layout>
                                </td>

                                <!--Preço-->
                                <td class="text-xs-left">
                                    <v-layout>
                                        <v-flex xs4 d-flex align-center>
                                            <p class="mr-1">R$</p>
                                            <v-text-field
                                                    class="td"
                                                    style="font-size: 11px"
                                                    v-model="props.item.price">
                                            </v-text-field>
                                            <!--<v-text-field-->
                                                    <!--v-if="user.type == 'admin'"-->
                                                    <!--class="td"-->
                                                    <!--style="font-size: 11px"-->
                                                    <!--v-model="props.item.price">-->
                                            <!--</v-text-field>-->
                                            <!--<v-text-field v-else-->
                                                          <!--class="td"-->
                                                          <!--style="font-size: 11px"-->
                                                          <!--v-money="props.item.money"-->
                                                          <!--v-model="props.item.price">-->
                                            <!--</v-text-field>-->
                                        </v-flex>
                                        <v-flex xs2
                                                v-show="props.item.price/props.item.currentPrice > 1.05 || props.item.price/props.item.currentPrice < 0.95">
                                            <v-tooltip bottom>
                                                <v-btn dark
                                                       slot="activator"
                                                       icon>
                                                    <v-icon color="yellow darken-3"
                                                            medium>
                                                        mdi-alert-decagram
                                                    </v-icon>
                                                </v-btn>
                                                <span v-show="props.item.price/props.item.currentPrice > 1.05">O preço subiu mais de 5%</span>
                                                <span v-show="props.item.price/props.item.currentPrice < 0.95">O preço baixou mais de 5%</span>
                                            </v-tooltip>
                                        </v-flex>
                                        <v-flex style="margin-left: 1em">
                                            <v-switch color="teal"
                                                      class="position"
                                                      v-model="props.item.searchChecked">
                                            </v-switch>
                                        </v-flex>
                                    </v-layout>
                                </td>
                            </tr>

                        </template>
                        <!--Alerta do search-->
                        <v-alert slot="no-results" :value="true" color="error"
                                 icon="warning">
                            Não foi encontrado nenhum produto com o nome: "{{ search }}".
                        </v-alert>
                        <!--Mensagem quando não há nenhum dado-->
                        <template slot="no-data">
                            <v-layout align-center justify-center>Não há
                                pesquisas disponíveis
                            </v-layout>
                        </template>
                    </v-data-table>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!--Botão salvar-->
                        <v-btn color="teal"
                               :loading="loading"
                               :disabled="loading"
                               flat
                               @click.native="saveSearch(searches); loader = 'loading'">
                            Salvar
                        </v-btn>
                        <v-btn color="teal" flat
                               @click.native="openDialogSendSearch(searches)">
                            Enviar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <SnackbarResearch></SnackbarResearch>
        <DialogSendSearch></DialogSendSearch>
    </div>
</template>
<script src="./ResearchTable.js"></script>