<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline">
        <span>飯カードα (データ吹っ飛ぶかも)</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      <v-btn flat @click="$refs.list.newShopShow=true">カード作成</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <v-content>
      <List ref="list"/>
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
    };
  },
};
</script>
