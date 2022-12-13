<style lang="scss">
    .input {
        width: 50%;
    }
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title style="background-color: teal">
                    <span style="font-size: 23px; color: white">Digite o nome da região</span>
                </v-card-title>
                <v-card-text class="input">
                    <v-form class="form" ref="form" v-model="valid" lazy-validation>
                        <v-text-field v-model="data.name"
                                      label="Nome"
                                      :rules="[() => !!data.name || 'Esse campo é obrigatório']">
                        </v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">Cancelar</v-btn>
                    <v-btn color="teal" flat @click="createRegion()">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarCreateRegion></SnackbarCreateRegion>
    </div>
</template>
<script src="./DialogCreateRegions.js"></script>