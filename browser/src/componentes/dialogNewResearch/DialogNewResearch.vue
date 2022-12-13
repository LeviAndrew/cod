<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <v-icon medium color="red">warning</v-icon>
                    &nbsp
                    <h1 style="color: red;">Será criado uma pesquisa a partir do zero!</h1>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid">

                        <!--MẼS-->
                        <v-flex xs12 sm8>
                            <v-autocomplete :items="mes"
                                            v-model="month"
                                            label="Selecione o mês"
                                            item-value="value">
                            </v-autocomplete>
                        </v-flex>

                        <!--ANO-->
                        <v-flex xs12 sm8>
                            <v-text-field
                                    name="input-1"
                                    label="Digite o ano"
                                    v-model="year"
                                    :rules="[() => !!year || 'Esse campo é obrigatório']"
                                    :mask="'####'">
                            </v-text-field>
                        </v-flex>

                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <span>Deseja abrir uma nova pesquisa para o sistema?</span>
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                    <v-btn :loading="loading"
                           color="teal"
                           flat
                           @click.native="openNewMonth()">
                        Salvar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarNewResearch></SnackbarNewResearch>
    </div>
</template>
<script src="./DialogNewResearch.js"></script>