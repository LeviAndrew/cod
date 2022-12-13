<style lang="scss">
</style>
<template>
    <div>
        <v-dialog v-model="dialogRemove" max-width="530px">
            <v-card>
                <v-card-title>
                    <h2>
                        <v-icon medium color="red">warning</v-icon>
                        &nbsp
                        Você tem certeza que quer deletar essa região?
                    </h2>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="teal" flat @click="closeDialog()">
                        Não
                    </v-btn>
                    <v-btn color="teal" flat @click="removeRegion(id)">
                        Sim
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SnackbarRemoveSource></SnackbarRemoveSource>
    </div>
</template>
<script src="./DialogRemoveRegions.js"></script>