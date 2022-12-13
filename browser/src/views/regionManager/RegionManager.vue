<style lang="scss" scoped>
    .region-card {
        width: 90%;
        left: 5%;
        top: 30px
    }

    .registerRegion {
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
            <v-flex>
                <v-card class="region-card">
                    <v-card-title>
                        <v-tooltip top>
                            <v-btn @click.native="openDialogCreateRegions()" color="teal" dark small top left
                                   fab slot="activator">
                                <v-icon>add</v-icon>
                            </v-btn>
                            <span>Adicionar região</span>
                        </v-tooltip>
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <!--Search-->
                        <v-text-field
                                v-model="search"
                                class="search"
                                append-icon="search"
                                label="Pesquisar"
                                single-line
                                hide-details>
                        </v-text-field>
                    </v-card-title>
                    <!--LER REGIÕES-->
                    <v-data-table
                            :headers="headers"
                            :items="regions"
                            :search="search"
                            rows-per-page-text=""
                            :rows-per-page-items="rows"
                            no-data-text="Não há regiões disponíveis"
                            class="elevation-1"
                            :loading="loading">
                        <template slot="items" slot-scope="region">
                            <td>{{ region.item.name }}</td>
                            <td class="justify-center layout px-0">

                                <!--EDITAR REGIÃO-->
                                <v-btn @click.native="openDialogEditRegions(region.item)" dark icon class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="teal">edit</v-icon>
                                        <span>Editar</span>
                                    </v-tooltip>
                                </v-btn>
                                <!--DIALOG REMOVER REGIÃO-->

                                <v-btn @click.native="openDialogRemoveRegions(region.item)" dark icon class="mx-0">
                                    <v-tooltip bottom>
                                        <v-icon slot="activator" color="red">delete</v-icon>
                                        <span>Remover</span>
                                    </v-tooltip>
                                </v-btn>

                            </td>
                        </template>
                        <!--Alerta do search-->
                        <v-alert slot="no-results" :value="true" color="error" icon="warning">
                            Não foi encontrado nenhuma região com o nome: "{{ search }}".
                        </v-alert>
                        <!--Mensagem quando não há nenhum dado-->
                        <template slot="no-data">
                            <v-layout align-center justify-center>Não há regiões disponíveis</v-layout>
                        </template>
                    </v-data-table>
                </v-card>
            </v-flex>
        </v-layout>
        <DialogEditRegions></DialogEditRegions>
        <DialogRemoveRegions></DialogRemoveRegions>
        <DialogCreateRegions></DialogCreateRegions>
    </div>
</template>
<script src="./RegionManager.js"></script>