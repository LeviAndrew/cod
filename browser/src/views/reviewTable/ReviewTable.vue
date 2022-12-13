<style>
    .region_filter {
        left: 10%;
        top: 25%;
        width: 5%;
        position: relative;
    }

    .date_filter {
        left: 10%;
        top: 25%;
        width: 9%;
        position: relative;
    }

    .search_btn {
        width: 90%;
        bottom: 5px;
    }

    .review_filter {
        right: 10px;
        width: 3%;
        position: relative;
        overflow: hidden;
        max-height: 50px;
    }

    .review_filter2 {
        width: 10%;
        position: relative;
        overflow: hidden;
        max-height: 50px;
    }

    .review_filter3 {
        left: 1%;
        width: 18%;
        position: relative;
        overflow: hidden;
        max-height: 50px;
    }

    .filter-btn {
        top: 5px;
        left: 10px;
    }

    .region_filter + .date_filter {
        margin-left: 5px;
    }

    .headline {
        height: 3em;
    }

    .reviewChecked {
        background-color: #4DB6AC;
    }
</style>
<template>
    <div>
        <v-layout align-center justify-center>
            <v-flex fluid xs12>
                <!--Inicio da tabela-->

                <v-card>

                    <v-card-title class="headline">

                        <v-tooltip v-model="show" color="#000" :fixed="fixedTooltip" :nudge-bottom="115">
                            <span>Fonte: {{tooltipText.source.name}}</span>
                            <br>
                            <span>Espec 1: {{tooltipText.searches[tooltipText.searches.length - 1].especOne}}</span>
                            <br>
                            <span>Espec 2: {{tooltipText.searches[tooltipText.searches.length - 1].especTwo}}</span>
                        </v-tooltip>

                        <!--speed dial 2-->
                        <v-speed-dial
                                v-model="fab2"
                                :direction="direction"
                                :transition="transition">

                            <v-btn slot="activator"
                                   v-model="fab2"
                                   color="blue darken-2"
                                   dark
                                   small
                                   fab>
                                <v-icon>mdi-file-chart</v-icon>
                                <v-icon>close</v-icon>
                            </v-btn>

                            <!--Botão baixar crítica em excel-->
                            <v-tooltip bottom>
                                <v-btn slot="activator"
                                       fab
                                       small
                                       dark
                                       color="green"
                                       @click="downloadExcel()">
                                    <v-icon>vertical_align_bottom</v-icon>
                                </v-btn>
                                <span>Baixar excel padrão</span>
                            </v-tooltip>

                            <!--Botão importar crítica do Excel para o sistema-->
                            <v-tooltip bottom>
                                <v-btn slot="activator"
                                       fab
                                       small
                                       dark
                                       color="blue"
                                       @click.native="openDialogImportReview()">
                                    <v-icon>vertical_align_top</v-icon>
                                </v-btn>
                                <span>Importar crítica</span>
                            </v-tooltip>

                        </v-speed-dial>

                        <!--floating button 1-->
                        <v-speed-dial
                                v-if="months[0] === searchMonth"
                                v-model="fab"
                                :direction="direction"
                                :transition="transition">

                            <v-btn slot="activator"
                                   v-model="fab"
                                   color="blue darken-2"
                                   dark
                                   small
                                   fab>
                                <v-icon>folder_open</v-icon>
                                <v-icon>close</v-icon>
                            </v-btn>

                            <!--Botão dialog para abrir nova semana-->
                            <v-tooltip bottom>
                                <v-btn slot="activator"
                                       fab
                                       small
                                       dark
                                       color="green darken-3"
                                       @click="openDialogNewWeek(regionId)">
                                    <v-icon>redo</v-icon>
                                </v-btn>
                                <span>Nova Semana</span>
                            </v-tooltip>

                            <!--Botão dialog para abrir novo mês-->
                            <v-tooltip bottom>
                                <v-btn slot="activator"
                                       fab
                                       small
                                       dark
                                       color="blue darken-3"
                                       @click="openDialogNewMonth(regionId)">
                                    <v-icon>keyboard_tab</v-icon>
                                </v-btn>
                                <span>Novo Mês</span>
                            </v-tooltip>
                        </v-speed-dial>

                        <!--Botão baixar crítica-->
                        <v-tooltip bottom>
                            <v-btn slot="activator"
                                   dark
                                   icon
                                   @click="downloadReview()">
                                <v-icon color="teal" medium>vertical_align_bottom</v-icon>
                            </v-btn>
                            <span>Baixar crítica</span>
                        </v-tooltip>

                        <!--Botão calcular crítica (ICONE DE CALC AINDA NAO COLOCADO)-->
                        <v-tooltip bottom>
                            <v-btn slot="activator"
                                   dark
                                   icon
                                   @click="calcReview()">
                                <v-icon color="teal">mdi-calculator</v-icon>
                            </v-btn>
                            <span>Calcular crítica</span>
                        </v-tooltip>

                        <!--Select(filtro) de região-->
                        <v-layout class="region_filter" xms6 align-center justify-center row fill-height>
                            <v-flex>
                                <v-autocomplete :items="regions"
                                                v-model="regionId"
                                                label="Região"
                                                no-data-text="Não há regiões"
                                                item-text="name"
                                                item-value="id"
                                                @change="readDate(regionId)">
                                </v-autocomplete>
                            </v-flex>
                        </v-layout>

                        <!--Filtro de mês-->
                        <v-layout class="date_filter" xms6 align-center justify-center row fill-height>
                            <v-flex v-if="years.length">
                                <v-autocomplete
                                        :items="years"
                                        v-model="searchYear"
                                        label="Ano">
                                </v-autocomplete>
                            </v-flex>

                            <v-flex v-if="searchYear">
                                <v-autocomplete
                                        :items="months"
                                        v-model="searchMonth"
                                        label="Mês">
                                </v-autocomplete>
                            </v-flex>

                            <v-tooltip bottom v-if="searchMonth">
                                <v-btn slot="activator"
                                       dark
                                       icon
                                       color="teal"
                                       class="search_btn"
                                       @click="readSearchbymonth()">
                                    <v-icon>search</v-icon>
                                </v-btn>
                                <span>Procurar</span>
                            </v-tooltip>
                        </v-layout>
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <v-spacer></v-spacer>
                        <!--Filtro de fonte-->
                        <!--<v-form class="form" ref="form" v-model="valid" lazy-validation>-->
                        <v-layout class="review_filter" xms6>
                            <v-flex>
                                <v-autocomplete :items="fonts"
                                                v-model="sourceId"
                                                small-chips
                                                multiple
                                                no-data-text="Não há fontes"
                                                label="Fonte"
                                                item-value="value.id">
                                </v-autocomplete>
                            </v-flex>
                        </v-layout>
                        <!--Filtro de pesquisador-->
                        <v-layout class="review_filter2" xms6>
                            <v-flex>
                                <v-autocomplete :items="researchers"
                                                v-model="researcherId"
                                                small-chips
                                                multiple
                                                no-data-text="Não há pesquisadores"
                                                label="Pesquisador"
                                                item-value="value.id">
                                </v-autocomplete>
                            </v-flex>
                        </v-layout>
                        <!--Filtro de produto-->
                        <v-layout class="review_filter3" xms6>
                            <v-flex>
                                <v-autocomplete :items="products"
                                                v-model="productId"
                                                small-chips
                                                dense
                                                clearable
                                                selection="selection"
                                                multiple
                                                no-data-text="Não há produtos"
                                                label="Produtos"
                                                item-value="value.id">
                                </v-autocomplete>
                            </v-flex>
                        </v-layout>
                        <v-tooltip bottom>
                            <v-btn slot="activator"
                                   dark
                                   icon
                                   color="teal"
                                   class="filter-btn"
                                   @click="filter()">
                                <v-icon>sort</v-icon>
                            </v-btn>
                            <span>Filtrar</span>
                        </v-tooltip>
                        <!--</v-form>-->
                    </v-card-title>
                    <!--Tabela de crítica-->
                    <v-data-table
                            :headers="headers"
                            :hide-headers="false"
                            :items="searches"
                            :loading="loading"
                            :rows-per-page-items="rows"
                            rows-per-page-text=""
                            item-key="name"
                            no-data-text="Não há crítica disponível"
                            style="max-height: calc(100vh - 200px)"
                            class="scroll-y elevation-1">
                        <template slot="items" slot-scope="props">
                            <tr v-bind:class="{reviewChecked: props.item.searches[props.item.searches.length - 1].reviewChecked}">
                                <!--<tr @click="props.expanded = !props.expanded">-->

                                <!--Código produto-->
                                <td class="text-xs-left" style="border-right: solid thin lightgray; font-size: 11px">
                                    {{props.item.product.code}}
                                </td>

                                <!--nome pesquisa(produto)-->
                                <td class="text-xs-left" style="border-right: solid thin lightgray; font-size: 11px">
                                    <v-layout>
                                        <v-flex xs10 d-flex align-center>
                                            {{props.item.product.name}}
                                            <v-flex xs2>

                                                <v-btn dark
                                                       small
                                                       @click="tooltipProduct(props.item)"
                                                       icon>
                                                    <v-icon color="blue">
                                                        mdi-eye-outline
                                                    </v-icon>
                                                </v-btn>

                                            </v-flex>
                                        </v-flex>
                                    </v-layout>
                                </td>

                                <!--TODO: FAZER V-IF PARA AS COLUNAS-->
                                <!--<td v-if="props.item.searches" v-for="(search, index) in searches">-->
                                <!--<ReviewDetails-->
                                <!--:searches="props.item.searches[index]"-->
                                <!--:regionId="regionId">-->
                                <!--</ReviewDetails>-->
                                <!--</td>-->

                                <td class="text-xs-left" style="border-right: solid thin lightgray; font-size: 11px">
                                    <v-layout>
                                        <v-flex>
                                            {{props.item.searches[0].variance}}
                                        </v-flex>
                                        <v-flex>
                                            <v-switch color="teal"
                                                      class="position"
                                                      v-model="props.item.searches[props.item.searches.length - 1].reviewChecked"
                                                      @change="checkedReviewSearch(props.item.searches[props.item.searches.length-1])">
                                            </v-switch>
                                        </v-flex>
                                    </v-layout>
                                </td>

                                <!--Dados anteriores-->
                                <td class="text-xs-left" style="border-right: solid thin lightgray; font-size: 12px">
                                    R$ {{props.item.searches[0].previousValue}} &nbsp; Alterado: {{props.item.searches[0].previousChanged}}
                                </td>

                                <!--Pesquisa anterior 1(PREÇO E CHANGED) ~ mais antiga-->
                                <td class="text-xs-left" v-if="props.item.searches"
                                    style="border-right: solid thin lightgray; font-size: 12px">
                                    <ReviewDetails
                                            :searches="props.item.searches[0]"
                                            :regionId="regionId">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 2(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails style="border-right: solid thin lightgray;"
                                                   :searches="props.item.searches[1]">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 3(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails style="border-right: solid thin lightgray;"
                                                   :searches="props.item.searches[2]">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 4(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails style="border-right: solid thin lightgray;"
                                                   :searches="props.item.searches[3]">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 5(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails style="border-right: solid thin lightgray;"
                                                   :searches="props.item.searches[4]">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 6(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails
                                            :searches="props.item.searches[5]">
                                    </ReviewDetails>
                                </td>

                                <!--Pesquisa anterior 7(PREÇO E CHANGED)-->
                                <td class="text-xs-left" v-if="props.item.searches">
                                    <ReviewDetails
                                            :searches="props.item.searches[6]">
                                    </ReviewDetails>
                                </td>
                                <!--</tr>-->
                            </tr>
                        </template>

                        <!--<div>-->
                        <template slot="expand" slot-scope="props">
                            <v-card flat>
                                <v-card-text>teste</v-card-text>
                            </v-card>
                        </template>
                        <!--</div>-->

                    </v-data-table>



                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!--Botão salvar-->
                        <v-btn :loading="loading"
                               color="teal"
                               flat
                               @click="saveReview(); loader = 'loading'">
                            Salvar
                        </v-btn>
                    </v-card-actions>

                </v-card>
            </v-flex>
        </v-layout>
        <SnackbarSaveReview></SnackbarSaveReview>
        <SnackbarSearchError></SnackbarSearchError>
        <DialogNewMonth></DialogNewMonth>
        <DialogNewWeek></DialogNewWeek>
        <DialogImportReview></DialogImportReview>
    </div>
</template>
<script src="./ReviewTable.js"></script>