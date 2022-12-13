<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialogUpdate" max-width="500px">
            <v-card>
                <v-card-title style="background-color: teal" class="headline">
                    <span style="color: white">Editar Região</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md6>
                                <v-text-field label="Nome" v-model="data.name"
                                              :rules="[() => !!data.name || 'Esse campo é obrigatório']">
                                </v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Cancelar
                    </v-btn>
                    <v-btn color="teal" flat @click="updateRegion(id)">Salvar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarEditRegion></SnackbarEditRegion>
    </div>
</template>
<script src="./DialogEditRegions.js"></script>