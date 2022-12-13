<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialogRemove" max-width="520px">
            <v-card>
                <v-card-title>
                    <h2>
                        <v-icon medium color="red">warning</v-icon>
                        &nbsp
                        Você tem certeza que quer deletar essa fonte?
                    </h2>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Não
                    </v-btn>
                    <v-btn color="teal" flat @click.native="removeSource(id)" :loading="loading">
                        Sim
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarRemoveSource></SnackbarRemoveSource>
    </div>
</template>
<script src="./DialogRemoveSource.js"></script>