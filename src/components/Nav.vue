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
        <v-list-tile>
          <v-btn block @click="login">Login</v-btn>
        </v-list-tile>
      </v-list>
    </v-toolbar>



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
        { text: "400m以下(徒歩5分)", value: "in400m" },
        { text: "800m以下(徒歩10分)", value: "in800m" },
        { text: "1200m以下(徒歩15分)", value: "in1200m" },
        { text: "2000m以下(自転車10分)", value: "in2000m" },
        { text: "3000m以下(自転車15分)", value: "in3000m" },
        { text: "4000m以下(自転車20分)", value: "in4000m" },
      ],
      genreFilters: [
        { text: "すべて", value: "" },
        { text: "洋食", value: "genre洋食" },
        { text: "中華", value: "genre中華" },
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
    login() {
      this.$emit("login")
    }
  }
}
</script>