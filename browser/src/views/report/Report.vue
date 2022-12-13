<style>
    .dates-btn {
        top: 15%;
    }
</style>
<template>
    <v-layout row wrap pa-1>
        <!--cabeçalho-->
        <v-flex xs12>
            <v-layout row wrap>
                <!--inicio das informações-->
                <v-flex xs3>
                    <v-card-title primary-title>
                        <h4>Ponderador anterior: {{totalPreviousWeight}}</h4>
                    </v-card-title>
                </v-flex>
                <v-flex xs3>
                    <v-card-title primary-title>
                        <h4>Ponderador atual: {{totalWeight}}</h4>
                    </v-card-title>
                </v-flex>
                <v-flex xs2>
                    <v-card-title primary-title>
                        <h4>Inflação: {{monetaryInflation}}%</h4>
                    </v-card-title>
                </v-flex>

                <!--TODO: mostrar o ano ou tirar o mês que já vem setado-->
                <v-flex xs1 v-if="years.length">
                    <v-autocomplete
                            v-model="year"
                            :items="years"
                            label="Ano">
                    </v-autocomplete>
                </v-flex>
                <v-flex xs1 v-if="months.length">
                    <v-autocomplete
                            v-model="month"
                            :items="months"
                            label="Mês">
                    </v-autocomplete>
                </v-flex>

                <v-tooltip bottom v-if="month && year">
                    <v-btn slot="activator" dark icon class="dates-btn" @click="filterDates()">
                        <v-icon color="teal">search</v-icon>
                    </v-btn>
                    <span>Filtrar</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <v-btn slot="activator"
                           dark
                           icon
                           class="dates-btn"
                           @click="downloadReportXLSX()">
                        <v-icon color="teal" medium>vertical_align_bottom</v-icon>
                    </v-btn>
                    <span>Baixar relatório</span>
                </v-tooltip>
                <!--inicio dos agrupadores-->
                <v-flex xs12>
                    <v-form class="form" ref="form" v-model="valid" lazy-validation>
                        <v-layout align-center justify-center row fill-height wrap>
                            <v-flex xs1 pl-4>
                                <v-tooltip bottom>
                                    <v-btn dark
                                           icon
                                           color="teal"
                                           slot="activator"
                                           @click="clear()">
                                        <v-icon>clear</v-icon>
                                    </v-btn>
                                    <span>Limpar filtros</span>
                                </v-tooltip>
                            </v-flex>
                            <v-flex xs2 pa-1>
                                <v-autocomplete
                                        style="max-height: 60px; overflow: hidden"
                                        v-model="valueGroup1"
                                        :items="group1"
                                        small-chips
                                        label="Grupo 1"
                                        no-data-text="Não há dados"
                                        multiple>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex xs2 pa-1>
                                <v-autocomplete
                                        style="max-height: 60px; overflow: hidden"
                                        v-model="valueGroup2"
                                        :items="group2"
                                        small-chips
                                        label="Grupo 2"
                                        no-data-text="Não há dados"
                                        multiple>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex xs2 pa-1>
                                <v-autocomplete
                                        style="max-height: 60px; overflow: hidden"
                                        v-model="valueGroup3"
                                        :items="group3"
                                        small-chips
                                        label="Grupo 3"
                                        no-data-text="Não há dados"
                                        multiple>
                                </v-autocomplete>
                            </v-flex>
                            <!--<v-flex xs2 pa-1>-->
                                <!--<v-autocomplete-->
                                        <!--style="max-height: 60px; overflow: hidden"-->
                                        <!--v-model="valueGroup4"-->
                                        <!--:items="group4"-->
                                        <!--small-chips-->
                                        <!--label="Grupo 4"-->
                                        <!--no-data-text="Não há dados"-->
                                        <!--multiple>-->
                                <!--</v-autocomplete>-->
                            <!--</v-flex>-->
                            <v-flex xs3 pa-1>
                                <v-autocomplete
                                        style="max-height: 60px; overflow: hidden"
                                        v-model="valueProducts"
                                        :items="products"
                                        small-chips
                                        label="Produto"
                                        no-data-text="Não há produtos"
                                        multiple>
                                </v-autocomplete>
                            </v-flex>
                        </v-layout>
                    </v-form>
                </v-flex>
            </v-layout>
        </v-flex>
        <!--tabela-->
        <v-flex xs12>
            <v-data-table
                    :headers="headers"
                    :items="report"
                    hide-actions
                    no-data-text="Não há relatório disponível"
                    style="max-height: calc(100vh - 230px)"
                    class="scroll-y elevation-1">
                <v-progress-linear slot="progress" color="teal" indeterminate>
                </v-progress-linear>
                <template slot="items" slot-scope="props">
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.code }}</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{props.item.previousWeight}}</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.inflation }}%</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.weight }}</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.group1 }}</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.group2 }}</td>
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.group3 }}</td>
                    <!--<td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{ props.item.group4 }}</td>-->
                    <td class="text-xs-center" style="border-right: solid thin lightgray; font-size: 11px">{{props.item.productName}}</td>
                </template>
            </v-data-table>
        </v-flex>
    </v-layout>
</template>
<script src="./Report.js"></script>