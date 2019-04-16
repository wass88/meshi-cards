<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>飯カード</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-content>
      <List/>
    </v-content>
  </v-app>
</template>

<script>

import List from './components/List';

export default {
  name: 'App',
  components: {
    List,
  },
  data() {
    return {
      //
    };
  },
};
</script>
