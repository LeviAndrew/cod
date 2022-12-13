<style lang="scss">
    .headline {
        height: 3em;
    }
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="400px">
            <v-card>
                <v-card-title style="background-color: teal; font-size: 23px">
                    <span style="color: white">Editar Fonte</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md8>
                                <!--NOME DA FONTE-->
                                <v-text-field label="Nome" v-model="data.source.name">
                                </v-text-field>
                                <!--CEP-->
                                <v-text-field label="CEP"
                                              v-model="data.source.address.postalCode"
                                              :mask="'#####-###'">
                                </v-text-field>
                                <!--BAIRRO-->
                                <v-text-field label="Bairro"
                                              v-model="data.source.address.neighborhood">
                                </v-text-field>
                                <!--RUA-->
                                <v-text-field label="Rua"
                                              v-model="data.source.address.street">
                                </v-text-field>
                                <!--NÚMERO-->
                                <v-text-field label="Número"
                                              v-model="data.source.address.number">
                                </v-text-field>

                                <!--PESQUISADORES-->
                                <!--<v-select :items="users"-->
                                <!--v-model="users"-->
                                <!--multiple-->
                                <!--chips-->
                                <!--autocomplete-->
                                <!--label="Pesquisadores"-->
                                <!--item-value="value.id"-->
                                <!--:rules="[() => !!data.source.researchers || 'Esse campo é obrigatório']">-->
                                <!--<template slot="selection"-->
                                <!--slot-scope="data">-->
                                <!--<v-chip-->
                                <!--close-->
                                <!--@input="data.parent.selectItem(data.item)"-->
                                <!--:selected="data.selected"-->
                                <!--class="chip&#45;&#45;select-multi"-->
                                <!--:key="JSON.stringify(data.item)">-->
                                <!--{{data.item.text}}-->
                                <!--</v-chip>-->
                                <!--</template>-->
                                <!--</v-select>-->

                                <!--<v-layout row wrap>-->
                                <!--<v-flex xs12 sm15>-->
                                <!--<v-select :items="produtos"-->
                                <!--v-model="data.regionId"-->
                                <!--multiple-->
                                <!--chips-->
                                <!--autocomplete-->
                                <!--label="Selecione os produtos"-->
                                <!--item-value="value.id">-->
                                <!--<template slot="selection"-->
                                <!--slot-scope="data">-->
                                <!--<v-chip-->
                                <!--close-->
                                <!--@input="data.parent.selectItem(data.item)"-->
                                <!--:selected="data.selected"-->
                                <!--class="chip&#45;&#45;select-multi"-->
                                <!--:key="JSON.stringify(data.item)">-->
                                <!--{{data.item.text}}-->
                                <!--</v-chip>-->
                                <!--</template>-->
                                <!--</v-select>-->
                                <!--</v-flex>-->
                                <!--</v-layout>-->

                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                    <v-btn color="teal" flat @click="updateSource(data.id)">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarEditSource></SnackbarEditSource>
    </div>
</template>
<script src="./DialogEditSource.js"></script>