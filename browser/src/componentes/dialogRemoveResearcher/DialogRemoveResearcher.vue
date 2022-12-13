<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <h2>
                        <v-icon medium color="red">warning</v-icon>
                        &nbsp
                        Você tem certeza que quer deletar esse pesquisador?
                    </h2>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Não
                    </v-btn>
                    <v-btn color="teal" flat
                           @click="removeResearchers(id)">
                        Sim
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarRemoveResearcher></SnackbarRemoveResearcher>
    </div>
</template>
<script src="./DialogRemoveResearcher.js"></script>