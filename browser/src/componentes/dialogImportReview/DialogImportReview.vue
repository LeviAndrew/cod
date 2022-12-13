<style lang="scss"></style>
<template>
    <div>
        <v-dialog :persistent="persistent" v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title style="background-color: teal; font-size: 23px">
                    <span style="color: white">Importar crítica</span>
                </v-card-title>
                <input id="importBasket" ref="importReview" type="file" style="display: none"
                       accept=".xls, .xlsx, .xlsm">
                <v-card-text>
                    <v-container grid-list-md>
                        <v-form class="form" ref="form" v-model="valid" lazy-validation>
                            <v-layout wrap>
                                <v-flex sm6>
                                    <!--Mês-->
                                    <v-text-field v-model="month"
                                                  label="Mês"
                                                  :mask="'##'"
                                                  :rules="[() => !!month || 'Digite o mês']">
                                    </v-text-field>
                                </v-flex>
                                <v-flex sm6>
                                    <!--Ano-->
                                    <v-text-field v-model="year"
                                                  label="Ano"
                                                  :mask="'####'"
                                                  :rules="[() => !!year || 'Digite o ano']">
                                    </v-text-field>
                                </v-flex>
                                <v-flex md6>
                                    <v-subheader>{{fileName}}</v-subheader>
                                </v-flex>
                            </v-layout>
                        </v-form>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-flex md6>
                        <v-btn color="teal" @click="selectDocument()" flat :disabled="disabled2">Selecionar documento</v-btn>
                    </v-flex>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="disabled2" color="teal" flat @click="closeDialog(); clear()">Cancelar</v-btn>
                    <v-btn :disabled="disabled" color="teal" @click="importReview()" :loading="loading" flat>Importar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script src="./DialogImportReview.js"></script>