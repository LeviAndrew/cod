<style></style>
<template>
    <div>
        <v-snackbar v-model="snackbar" :timeout="1500" top="top" left="left">
            <span>{{ text }}</span>
        </v-snackbar>
    </div>
</template>
<script src="./SnackbarSearchError.js"></script>