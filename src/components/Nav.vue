<template>
  <v-navigation-drawer absolute temporary :value="show" @input="$emit($event?'showed':'quit')">
    <v-toolbar flat>
      <v-list>
        <v-list-tile> <v-list-tile-title class="title">
          フィルタ
        </v-list-tile-title> </v-list-tile>
        <v-list-tile>
          <v-select :value="filters[0]" @input="$emit('updateFilter',0,$event)" label="時間" :items="timeFilters"></v-select>
        </v-list-tile>
        <v-list-tile>
          <v-select :value="filters[1]" @input="$emit('updateFilter',1,$event)" label="距離" :items="placeFilters"></v-select>
        </v-list-tile>
        <v-list-tile>
          <v-select :value="filters[2]" @input="$emit('updateFilter',2,$event)" label="ジャンル" :items="genreFilters"></v-select>
        </v-list-tile>
      </v-list>
    </v-toolbar>

    <v-divider></v-divider>


  </v-navigation-drawer>
</template>

<script>
export default {
  props : [
    "filters", "show"
  ],
  data() {
    return({
      timeFilters: [
        { text: "すべて", value: "" },
        { text: "開店(15分後にも)", value: "after15m" },
        { text: "今日開店", value: "today" },
      ],
      placeFilters: [
        { text: "すべて", value: "" },
        { text: "800m未満(徒歩10分)", value: "in800m" },
      ],
      genreFilters: [
        { text: "すべて", value: "" },
        { text: "洋食", value: "genre洋食" },
        { text: "ハンバーグ", value: "genreハンバーグ" },
        { text: "ラーメン", value: "genreラーメン" },
        { text: "牛丼", value: "genre牛丼" },
        { text: "そばうどん", value: "genreそばうどん" },
        { text: "カレー", value: "genreカレー" },
        { text: "パン屋", value: "genreパン屋" },
      ]
    });
  },
  computed: {
  },
  methods: {
  }
}
</script>