<style lang="scss">
    .dialog-card {
        width: 90%;
        left: 5%;
        margin-top: 30px;
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
                        <span>Produtos</span>
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
                        v-if="selected"
                        :headers="headers"
                        :items="basket"
                        :search="search"
                        item-key="name"
                        v-model="selected"
                        select-all
                        rows-per-page-text=""
                        :rows-per-page-items="rows"
                        style="max-height: 400px"
                        class="scroll-y elevation-1">
                    <template slot="header" slot-scope="props">
                        <td>
                            {{ props.header.text }}
                        </td>
                    </template>
                    <template slot="items" slot-scope="props">
                        <td>
                            <v-checkbox
                                    v-model="props.selected"
                                    primary
                                    hide-details>
                            </v-checkbox>
                        </td>
                        <td>{{props.item.name}}</td>
                        <!--<pre>{{selected}}</pre>-->
                        <!--<pre>{{props.item}}</pre>-->
                    </template>
                    <!--Alerta do search-->
                    <v-alert slot="no-results" :value="true" color="error" icon="warning">
                        Não foi encontrado nenhum produto com o nome: "{{ search }}".
                    </v-alert>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <!--Botões salvar e cancelar-->
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                    <v-btn color="teal" flat @click="connectProducts(selected)">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarConnectProductsToSource></SnackbarConnectProductsToSource>
    </div>
</template>
<script src="./DialogConnectProductsToSource.js"></script>