<style lang="scss">
    .body {
        max-height: 100%;
        max-width: 100%;
    }
</style>
<template>
    <v-app id="inspire">
        <div v-if="user.type" id="app">
            <v-navigation-drawer clipped
                                 fixed
                                 v-model="drawer"
                                 temporary
                                 app>
                <v-list dense>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/RegionManager')">
                        <v-list-tile-action>
                            <v-icon color="teal">mdi-city</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Regiões</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/ProductBasket')">
                        <v-list-tile-action>
                            <v-icon color="teal">shopping_basket</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Cesta de Produtos</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/SourceManager')">
                        <v-list-tile-action>
                            <v-icon color="teal">mdi-home-map-marker</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Fontes</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/ResearcherManager')">
                        <v-list-tile-action>
                            <v-icon color="teal">supervisor_account</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Pesquisadores</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/ResearchTable')">
                        <v-list-tile-action>
                            <v-icon color="teal">book</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Pesquisas</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile @click="go('/ReviewTable')">
                        <v-list-tile-action>
                            <v-icon color="teal">assignment</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Tabela de crítica</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile v-if="user.type==='admin'" @click="go('/Report')">
                        <v-list-tile-action>
                            <v-icon color="teal">assessment</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>Relatório</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>

                </v-list>
            </v-navigation-drawer>

            <v-toolbar app
                       fixed
                       dense
                       clipped-left
                       color="teal"
                       dark>
                <v-toolbar-side-icon v-if="user.type==='admin'" @click.stop="drawer = !drawer">
                </v-toolbar-side-icon>

                <v-divider v-if="user.type === 'admin'"
                        class="mx-3"
                        inset
                        vertical>
                </v-divider>

                <v-toolbar-title>{{$route.name}}</v-toolbar-title>
                <v-spacer></v-spacer>

                <!--Botão ir até página de pesquisas(usuário comum)-->
                <div v-if="user.type === 'researcher'" @click="go('/ResearchTable')">
                    <v-tooltip bottom>
                        <v-btn slot="activator" icon>
                            <v-icon>book</v-icon>
                        </v-btn>
                        <span>Pesquisas</span>
                    </v-tooltip>
                </div>

                <v-tooltip bottom>
                    <!--Botão página de perfil-->
                    <v-btn slot="activator" icon @click="go('/Home')">
                        <v-icon>account_box</v-icon>
                    </v-btn>
                    <span>Perfil</span>
                </v-tooltip>

                <!--Botão deslogar-->
                <v-tooltip bottom>
                    <v-btn slot="activator" icon @click="logout(); go('/login')">
                        <v-icon>exit_to_app</v-icon>
                    </v-btn>
                    <span>Sair</span>
                </v-tooltip>

            </v-toolbar>
        </div>

        <v-content>
            <v-layout class="body"
                      justify-center
                      align-top>
                <v-flex style="max-height: 100%" fluid>
                    <router-view></router-view>
                </v-flex>
            </v-layout>
        </v-content>

    </v-app>
</template>
<script src="./App.js"></script>