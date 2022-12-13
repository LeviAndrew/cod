<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <h2>
                        <v-icon medium color="red">warning</v-icon>
                        Se você enviar, todas as suas pesquisas serão fechadas.
                    </h2>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <span>Deseja enviar a(s) pesquisa(s) ?</span>
                    <v-btn color="teal" flat @click="closeDialog()">Não</v-btn>
                    <v-btn color="teal" flat @click="sendSearch()">Sim</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarSendResearch></SnackbarSendResearch>
    </div>
</template>
<script src="./DialogSendSearch.js"></script>