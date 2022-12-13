<style>
    .source_card {
        width: 90%;
        left: 5%;
        bottom: 50px
    }

    .region_Select {
        width: 30%;
        left: 5%;
        bottom: 15px;
        position: relative;
    }

    .search-source-button {
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

                <!--SELECT DE REGIÃO-->
                <v-container fluid v-if="regions.length !== 1">
                    <v-layout row wrap class="region_Select">
                        <v-autocomplete :items="regions"
                                        v-model="data.regionId"
                                        label="Selecione a região"
                                        item-text="name"
                                        item-value="id">
                        </v-autocomplete>
                        <v-btn dark icon color="teal" class="search-source-button"
                               @click.native="readSourcesbyRegion(data.regionId)">
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

                <!--TABELA-->
                <v-card class="source_card">
                    <v-card-title>
                        <!--REGISTRAR FONTE-->
                        <v-tooltip top>
                            <v-btn @click.native="openDialogCreateSource()" color="teal" dark small  top left
                                   fab slot="activator">
                                <v-icon>add</v-icon>
                            </v-btn>
                            <span>Nova fonte</span>
                        </v-tooltip>
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
                    <v-data-table
                            :headers="headers"
                            :items="sources"
                            :search="search"
                            rows-per-page-text=""
                            :rows-per-page-items="rows"
                            no-data-text="Não há fontes disponíveis"
                            :loading="loading">
                        <template slot="items" slot-scope="source">
                            <td>{{ source.item.name }}</td>
                            <td class="justify-center layout px-0">

                                <!--Botão editar fonte-->
                                <v-btn @click.native="openDialogEditSource(source.item)" dark icon class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="teal">edit</v-icon>
                                        <span>Editar</span>
                                    </v-tooltip>
                                </v-btn>

                                <!--Botão remover fonte-->
                                <v-btn @click.native="openDialogRemoveSource(source.item, data.regionId)" dark icon
                                       class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="red">delete</v-icon>
                                        <span>Remover</span>
                                    </v-tooltip>
                                </v-btn>

                                <!--Botão associar produtos á fonte-->
                                <v-btn @click.native="openDialogConnectProductsToSource(source.item.id, data.regionId)"
                                       dark icon class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="blue">touch_app</v-icon>
                                        <span>Associar produtos</span>
                                    </v-tooltip>
                                </v-btn>

                                <!--Botão ler produtos da fonte-->
                                <v-btn @click.native="openDialogReadSourceproducts(source.item.id)" dark icon
                                       class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="green">book</v-icon>
                                        <span>Visualizar produtos associados</span>
                                    </v-tooltip>
                                </v-btn>

                            </td>
                        </template>
                        <v-alert slot="no-results" :value="true" color="error" icon="warning">
                            Não foi encontrado nenhuma fonte com o nome: "{{ search }}".
                        </v-alert>
                    </v-data-table>
                </v-card>
            </v-flex>
        </v-layout>
        <SnackbarSource></SnackbarSource>
        <DialogCreateSource></DialogCreateSource>
        <DialogRemoveSource></DialogRemoveSource>
        <DialogEditSource></DialogEditSource>
        <DialogConnectProductsToSource></DialogConnectProductsToSource>
        <DialogReadSourceproducts></DialogReadSourceproducts>
    </div>
</template>
<script src="./SourceManager.js"></script>