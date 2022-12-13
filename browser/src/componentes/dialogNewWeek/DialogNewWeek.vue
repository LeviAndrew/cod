<style>
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="600px" :persistent="persistent">
            <v-card>
                <v-card-title>
                    Pesquisas em aberto
                </v-card-title>
                <v-data-table
                        :headers="headers"
                        :hide-headers="false"
                        :items="searches"
                        :rows-per-page-items="rows"
                        rows-per-page-text=""
                        no-data-text="Não há pesquisas em aberto"
                        :loading="loading"
                        style="max-height: calc(100vh - 200px)"
                        class="scroll-y elevation-1">
                    <template slot="items" slot-scope="props">
                        <!--Nome do pesquisador-->
                        <td>{{props.item.user}}</td>

                        <!--Fontes-->
                        <td>
                            <div class="text-xs-center">
                                <v-menu offset-y>
                                    <v-btn slot="activator"
                                           icon>
                                        <v-icon color="primary">mdi-comment-eye</v-icon>
                                    </v-btn>
                                    <v-list style="max-height: 300px"
                                            class="scroll-y"
                                            id="scroll-target">
                                        <v-list-tile-title v-for="item in props.item.source">
                                            {{ item.name }}
                                        </v-list-tile-title>
                                    </v-list>
                                </v-menu>
                            </div>
                        </td>
                    </template>
                </v-data-table>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <span style="font-weight: bold">Deseja abrir nova semana?</span>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Não
                    </v-btn>
                    <v-btn color="teal" :loading="loading" flat @click="newWeek()">
                        Sim
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarNewWeek></SnackbarNewWeek>
    </div>
</template>
<script src="./DialogNewWeek.js"></script>