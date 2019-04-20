<template>
  <v-dialog :value="show" v-on:input="onQuit"
   hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-card-title class="headline">新規ごはん屋さん</v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="newShopInfo"
          :items="newShopItems"
          :loading="newShopLoadingColor"
          :search-input.sync="newShopSearch"
          no-filter
          color="white"
          hide-no-data
          hide-selected
          item-text="name"
          label="店名"
          placeholder="お店の名前 ハイライトなど"
          prepend-icon="mdi-database-search"
          return-object
        ></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-btn color="green darken-1" flat @click="dialog = false">キャンセル</v-btn>
        <v-spacer/>
        <v-btn color="green darken-1" flat @click="dialog = false">無から</v-btn>
        <v-btn color="green darken-1" flat @click="dialog = false; newShopFromTabelog()">食べログから</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  const default_shop = {
    name: '名前',
    close_day: 'なし',
    open_time: '11:00-22:30',
    menus: [{'name':'', 'url': '', 'price':42}],
    tags: [],
    flavor: 'おいしい',
  };
  function make_shop(info) {
    return Object.assign(Object.assign({}, default_shop), info);
  }

  export default {
    props: {
      show: Boolean,
    },
    data: () => ({
      newShopInfo: undefined,
      newShopItems: [],
      newShopLoading: 0,
      newShopSearch: null,
      newShopNameCurrent: "",
    }),
    computed: {
      newShopLoadingColor() {
        return ["", "info", "warning"][this.newShopLoading];
      }
    },
    watch: {
      newShopSearch(name) {
        const none = 0, wait = 1, loading = 2;
        if (!name || name == "" ) return;
        const intername = 1000;
        console.log("enqueue", this.newShopNameCurrent);
        this.newShopNameCurrent = name;
        if (this.newShopLoading !== loading) this.newShopLoading = wait;
        window.setTimeout(() => {
          if (this.newShopNameCurrent !== name) return;
          this.newShopLoading = loading;
          console.log("startFetch", this.newShopNameCurrent);
          window.fetch(window.api_url+`/tabelog_shop?type=search_shops&name=${name}`).then(
            v=>v.json()
          ).then(v=>{
            console.log("get", v);
            this.newShopItems = v.list;
            this.newShopLoading = none;
          });
        }, intername)
      }
    },
    methods: {
      onQuit(e) {
        if (!e) this.$emit('quit');
      },
      newShop(shop) {
        this.$emit("quit");
        this.$emit("addShop", shop);
      },
      newShopFromTabelog(){ 
        const url = this.newShopInfo.url;
        console.log("startFetch", url);
        window.fetch(window.api_url+`/tabelog_shop?type=fetch_shop&url=${url}`).then(
          v=>v.json()
        ).then(v=>{
          this.newShop(make_shop(v.info))
        });
      }
    }
  }
</script>

<style>

</style>
