<style>
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="800px">
            <!--Inicio da tabela-->
            <v-card>

                <v-card>
                    <v-card-title class="headline">
                        <span>Fontes</span>
                        <!--Search-->
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Pesquisar"
                                single-line
                                hide-details>
                        </v-text-field>
                    </v-card-title>
                </v-card>

                <!--Tabela de produtos-->
                <v-data-table
                        :headers="headers"
                        :items="source"
                        :search="search"
                        :loading="loading"
                        rows-per-page-text=""
                        :rows-per-page-items="rows"
                        no-data-text="Não há fontes associadas"
                        style="max-height: 400px"
                        class="scroll-y elevation-1">
                    <template slot="items" slot-scope="props">
                        <!--<td>{{props.item.name}}</td>-->
                        <td class="justify-center layout px-0">
                            <!--botoes aqui-->
                        </td>
                    </template>
                    <!--Alerta do search-->
                    <v-alert slot="no-results" :value="true" color="error" icon="warning">
                        Não foi encontrado nenhuma fonte com o nome: "{{ search }}".
                    </v-alert>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <!--Botões sair-->
                    <v-btn color="teal" flat @click="closeDialog()">Sair</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script src="./DialogViewResearcherSources.js"></script>