<template>
  <v-navigation-drawer absolute temporary :value="show" @input="$emit($event?'showed':'quit')">
    <v-toolbar flat>
      <v-list>
        <v-list-tile>
          <v-list-tile-title class="title">
            フィルタ
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-toolbar>

    <v-divider></v-divider>

    <v-select :value="filters[0]" @input="$emit('updateFilter',0,$event)" label="時間" :items="timeFilters" outline ></v-select>
    <v-select :value="filters[1]" @input="$emit('updateFilter',1,$event)" label="距離" :items="placeFilters" outline ></v-select>
    <v-select :value="filters[2]" @input="$emit('updateFilter',2,$event)" label="ジャンル" :items="genreFilters" outline ></v-select>

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
        { text: "開店(15分後でも)", value: "15m" },
      ],
      placeFilters: [
        { text: "すべて", value: "" },
        { text: "200m未満", value: "200m" },
      ],
      genreFilters: [
        { text: "すべて", value: "" },
        { text: "洋食", value: "洋食" },
      ]
    });
  },
  computed: {
  },
  methods: {
  }
}
</script>