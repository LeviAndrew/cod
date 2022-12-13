<style>
    .card1 {
        top: 30px;
    }
</style>
<template>
    <div>
        <v-layout align-center justify-center>
            <v-flex sm8>
                <v-card class="card1">
                    <v-card-title primary-title>
                        <span class="headline">Bem-vindo Pesquisador</span>
                    </v-card-title>
                    <template>
                        <v-card-text>
                            <v-form class="form" ref="form" v-model="valid" lazy-validation>

                                <!--Nome-->
                                <v-text-field label="Nome" v-model="name"></v-text-field>

                                <!--Sobrenome-->
                                <v-text-field label="Sobrenome" v-model="surname"></v-text-field>

                                <!--E-mail-->
                                <v-text-field label="E-mail" v-model="email"
                                              :rules="emailRules">
                                </v-text-field>

                                <!--Telefone-->
                                <v-text-field label="Telefone" v-model="phoneNumber"
                                              :mask="'(##) #####-####'">
                                </v-text-field>

                                <!--Password-->
                                <v-text-field label="Senha"
                                              v-model="password"
                                              :append-icon="pass ? 'visibility' : 'visibility_off'"
                                              :append-icon-cb="() => (pass = !pass)"
                                              :type="pass ? 'password' : 'text'">
                                </v-text-field>

                            </v-form>
                        </v-card-text>
                    </template>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!--Botão salvar-->
                        <v-btn :loading="loading"
                               color="teal"
                               flat
                               @click="updateProfile()">
                            Salvar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
        <SnackbarUpdateResearcher></SnackbarUpdateResearcher>
    </div>
</template>
<script src="./Home.js"></script>