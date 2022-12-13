<style lang="scss" scoped>
    .is-danger {
        color: red;
        font-size: 12px;
    }
    .logo {
        max-height: 110px;
        max-width: 200px;
        margin-top: 5%;
    }
</style>
<template>
    <v-app id="inspire">
        <v-content>
            <v-container fluid fill-height>
                <v-layout align-center justify-center>
                    <v-flex xs12 sm8 md4>
                        <v-card>
                            <v-layout align-center justify-center>
                                <img class="logo" src="../../assets/LabticIDPB.png">
                            </v-layout>
                            <v-card-title primary-title>
                                <h3 class="headline mb-0">Login</h3>
                            </v-card-title>
                            <v-card-text>
                                <v-form>
                                    <v-text-field prepend-icon="person" name="login" label="E-mail" type="text"
                                                  :error="validate_login"
                                                  v-on:click="validate_login = false" v-model="user.email">
                                    </v-text-field>
                                    <v-text-field prepend-icon="lock" name="password" label="Senha" id="password" type="password"
                                                  :error="validate_login"
                                                  v-on:keyup.enter="login"
                                                  v-on:click="validate_login = false" v-model="user.password">
                                    </v-text-field>
                                    <span class="is-danger" v-if="validate_login">Usuário ou senha incorretos.</span>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" v-on:click="login">Entrar</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>
</template>
<script src="./Login.js"></script>