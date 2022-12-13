<style></style>
<template>
    <div>
        <v-snackbar v-model="snackbar" :timeout="1500" :right="'right'">
            <span>{{ text }}</span>
        </v-snackbar>
    </div>
</template>
<script src="./SnackbarEditSource.js"></script>