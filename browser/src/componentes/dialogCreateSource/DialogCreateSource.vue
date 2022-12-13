<style>
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="610px">
            <v-card>
                <v-card-title style="background-color: teal">
                    <span style="font-size: 23px; color: white">Digite as informações da fonte</span>
                </v-card-title>
                <v-card-text>

                    <v-form ref="form" v-model="valid">
                        <!--NOME DA FONTE-->
                        <v-container grid-list-md>
                            <v-layout>
                                <v-flex xs1 md3>
                                    <v-subheader>Nome</v-subheader>
                                </v-flex>
                                <v-flex md6>
                                    <v-text-field
                                            name="input-1"
                                            label="Nome da fonte"
                                            id="name"
                                            v-model="data.source.name"
                                            required
                                            :rules="[() => !!data.source.name || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-container>

                        <!--ENDEREÇO-->
                        <v-container grid-list-md>
                            <v-layout row>
                                <v-flex xs3>
                                    <v-subheader>Endereço</v-subheader>
                                </v-flex>
                                <v-form class="form" ref="form" v-model="valid">
                                    <v-text-field
                                            name="input-1"
                                            label="CEP"
                                            id="postalCode"
                                            v-model="data.source.address.postalCode"
                                            :mask="'#####-###'"
                                            required
                                            :rules="pcodeRules">
                                    </v-text-field>
                                    <v-text-field
                                            name="input-1"
                                            label="Estado"
                                            id="state"
                                            :mask="'AA'"
                                            required
                                            v-model="data.source.address.state"
                                            :rules="[() => !!data.source.address.state || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                    <v-text-field
                                            name="input-1"
                                            label="Cidade"
                                            id="city"
                                            required
                                            v-model="data.source.address.city"
                                            :rules="[() => !!data.source.address.city || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                    <v-text-field
                                            name="input-1"
                                            label="Bairro"
                                            id="neighborhood"
                                            required
                                            v-model="data.source.address.neighborhood"
                                            :rules="[() => !!data.source.address.neighborhood || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                    <v-text-field
                                            name="input-1"
                                            label="Rua"
                                            id="street"
                                            required
                                            v-model="data.source.address.street"
                                            :rules="[() => !!data.source.address.street || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                    <v-text-field
                                            name="input-1"
                                            label="Número"
                                            id="number"
                                            required
                                            :mask="'####'"
                                            v-model="data.source.address.number"
                                            :rules="[() => !!data.source.address.number || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                </v-form>
                            </v-layout>
                        </v-container>

                        <!--CÓDIGO-->
                        <v-container grid-list-md>
                            <v-layout row>
                                <v-flex xs12 sm3>
                                    <v-subheader>Código</v-subheader>
                                </v-flex>
                                <v-flex md6>
                                    <v-text-field
                                            name="input-1"
                                            label="Digite o código da fonte"
                                            id="code"
                                            required
                                            v-model="data.source.code"
                                            :rules="[() => !!data.source.code || 'Esse campo é obrigatório']">
                                    </v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-container>

                        <!--REGIÃO-->
                        <v-container grid-list-md>
                            <v-layout row wrap>
                                <v-flex xs12 sm4>
                                    <v-subheader>Região</v-subheader>
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-autocomplete :items="regions"
                                                    v-model="data.regionId"
                                                    label="Selecione a região"
                                                    item-text="name"
                                                    item-value="id">
                                    </v-autocomplete>
                                </v-flex>
                            </v-layout>
                        </v-container>

                        <!--PESQUISADORES-->
                        <v-container grid-list-md>
                            <v-layout row wrap>
                                <v-flex xs12 sm4>
                                    <v-subheader>Pesquisadores</v-subheader>
                                </v-flex>
                                <v-flex xs12 sm6>
                                    <v-autocomplete :items="users"
                                                    v-model="data.source.researchers"
                                                    multiple
                                                    chips
                                                    label="Selecione os pesquisadores"
                                                    item-value="value.id"
                                                    :rules="[() => !!data.source.researchers || 'Esse campo é obrigatório']">
                                        <template slot="selection" slot-scope="data">
                                            <v-chip
                                                    close
                                                    @input="data.parent.selectItem(data.item)"
                                                    :selected="data.selected"
                                                    class="chip--select-multi"
                                                    :key="JSON.stringify(data.item)">
                                                {{data.item.text}}
                                            </v-chip>
                                        </template>
                                    </v-autocomplete>
                                </v-flex>
                            </v-layout>
                        </v-container>

                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                    <v-btn color="teal" flat @click="createSource()">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarCreateSource></SnackbarCreateSource>
    </div>
</template>
<script src="./DialogCreateSource.js"></script>