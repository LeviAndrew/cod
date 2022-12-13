<style>
    .position {
        padding-top: -10px;
        width: 1px;
    }

    .tds {
        padding: 1px;
        margin-top: -5px;
        width: 100%;
    }

    .td {
        padding: 1px;
        font-size: 12px
    }
</style>
<template>
    <div v-if="searches">
        <v-layout justify-center column>
                <v-layout align-center justify-center row fill-height>
                    <v-flex xs5 d-flex align-center>
                        <p class="mr-1" style="font-size: 12px">R$</p>
                        <v-text-field
                                ref="searches.price"
                                v-model.lazy="searches.price"
                                @input="saveReview('text')"
                                class="td">
                        </v-text-field>
                    </v-flex>

                    <!--Switch SIM ou NÂO-->
                    <v-flex xs7 d-flex align-center>
                        <v-switch color="teal"
                                  class="position"
                                  :label="`${searches.changed.changedString()}`"
                                  style="margin-left: 1em"
                                  v-model="searches.changed"
                                  @change="saveReview('switch')">
                        </v-switch>
                    </v-flex>
                </v-layout>
                <v-layout align-center justify-center row fill-height>
                    <v-flex xs3>
                        <v-tooltip bottom v-if="searches.promotion">
                            <v-icon color="red" slot="activator">
                                mdi-sale
                            </v-icon>
                            <span>Item em promoção!</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs3>
                        <v-tooltip bottom v-if="searches.position">
                            <v-icon color="primary" slot="activator" @click="getLocation(searches.position)">
                                mdi-map-marker
                            </v-icon>
                            <span>Click para ver a localização no mapa</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs3>
                        <v-tooltip bottom v-if="searches.barCode">
                            <v-icon color="primary" slot="activator">
                                mdi-barcode-scan
                            </v-icon>
                            <span>Usou o codigo de barras</span>
                        </v-tooltip>
                        <v-tooltip bottom v-else>
                            <v-icon color="red" slot="activator">
                                mdi-barcode-scan
                            </v-icon>
                            <span>Não usou o codigo de barras</span>
                        </v-tooltip>
                    </v-flex>
                    <v-flex xs3>
                        <v-tooltip bottom v-if="searches.status === 'Closed'">
                            <v-icon color="primary" slot="activator">
                                mdi-thumb-up
                            </v-icon>
                            <span>Entregue!</span>
                        </v-tooltip>
                        <v-tooltip bottom v-else>
                            <v-icon color="red" slot="activator">
                                mdi-thumb-down
                            </v-icon>
                            <span>Pesquisando...</span>
                        </v-tooltip>
                    </v-flex>
                </v-layout>
        </v-layout>

<!--        <v-container d-flex align-center class="tds">-->
<!--            &lt;!&ndash;Todo: trocar input e switch de lado&ndash;&gt;-->
<!--            <v-layout>-->
<!--                &lt;!&ndash;Preço&ndash;&gt;-->
<!--                <v-flex xs4 d-flex align-center>-->
<!--                    <p class="mr-1" style="font-size: 12px">R$</p>-->
<!--                    <v-text-field-->
<!--                            ref="searches.price"-->
<!--                            v-model.lazy="searches.price"-->
<!--                            @input="saveReview('text')"-->
<!--                            class="td">-->
<!--                    </v-text-field>-->
<!--                </v-flex>-->

<!--                &lt;!&ndash;Switch SIM ou NÂO&ndash;&gt;-->
<!--                <v-flex xs5 d-flex align-center>-->
<!--                    <v-switch color="teal"-->
<!--                              class="position"-->
<!--                              :label="`${searches.changed.changedString()}`"-->
<!--                              style="margin-left: 1em"-->
<!--                              v-model="searches.changed"-->
<!--                              @change="saveReview('switch')">-->
<!--                    </v-switch>-->
<!--                </v-flex>-->


<!--                <v-flex xs2 d-flex align-center-->
<!--                        v-if="searches.status === 'Closed'"-->
<!--                        style="margin-left: 1em">-->
<!--                    <v-tooltip bottom>-->
<!--                        <v-icon color="green" slot="activator">-->
<!--                            mdi-thumb-up-->
<!--                        </v-icon>-->
<!--                        <span>Entregue!</span>-->
<!--                    </v-tooltip>-->
<!--                </v-flex>-->
<!--                <v-flex xs2 d-flex align-center v-else style="margin-left: 1em">-->
<!--                    <v-tooltip bottom>-->
<!--                        <v-icon color="orange" slot="activator">-->
<!--                            mdi-thumb-down-->
<!--                        </v-icon>-->
<!--                        <span>Pesquisando...</span>-->
<!--                    </v-tooltip>-->
<!--                </v-flex>-->
<!--            </v-layout>-->

<!--        </v-container>-->
    </div>
</template>
<script src="./ReviewDetails.js"></script>
