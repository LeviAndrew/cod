<style lang="scss">
    .input-r {
        width: 70%;
    }
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="400px">
            <v-card>
                <v-card-title style="background-color: teal; font-size: 23px">
                    <span style="color: white" class="headline">Preencha as informações do pesquisador</span>
                </v-card-title>
                <v-card-text class="input-r">
                    <v-form class="form" ref="form" v-model="valid" lazy-validation>
                        <v-text-field label="Nome"
                                      v-model="data.name"
                                      required
                                      :rules="[() => !!data.name || 'Esse campo é obrigatório']">
                        </v-text-field>
                        <v-text-field label="Sobrenome"
                                      v-model="data.surname"
                                      required
                                      :rules="[() => !!data.surname || 'Esse campo é obrigatório']">
                        </v-text-field>
                        <v-text-field label="E-mail"
                                      v-model="data.email"
                                      required
                                      :rules="emailRules">
                        </v-text-field>
                        <v-text-field label="Telefone"
                                      v-model="data.phoneNumber"
                                      required
                                      :mask="'(##) #####-####'"
                                      :rules="[() => !!data.phoneNumber || 'Esse campo é obrigatório']">
                        </v-text-field>
                        <v-text-field label="Senha"
                                      v-model="data.password"
                                      required
                                      :append-icon="pass ? 'visibility' : 'visibility_off'"
                                      :append-icon-cb="() => (pass = !pass)"
                                      :type="pass ? 'password' : 'text'"
                                      :rules="[() => !!data.password || 'Esse campo é obrigatório']">
                        </v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Cancelar
                    </v-btn>
                    <v-btn color="teal" flat @click="createResearcher()">
                        Salvar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarCreateResearcher></SnackbarCreateResearcher>
    </div>
</template>
<script src="./DialogCreateResearcher.js"></script>