<template>
  <v-container>
    <Shop v-for="(shop, i) in shops" :key="shop.id" :info="shop"
          @click.native="editShop(i)"></Shop>

    <v-btn fab dark fixed bottom right color="indigo"
           @click="newShopShow=true">
      <v-icon dark>add</v-icon>
    </v-btn>
    <NewShop @addShop="addShop"
             :show="newShopShow" @quit="newShopShow=false"></NewShop>

    <v-dialog v-model="editDialog" hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="headline">ごはん屋さん編集</v-card-title>
        <v-card-text v-if="nowShop">
          <v-text-field v-model="nowShop.name" @change="changedShop" label="名前"></v-text-field>
          <v-text-field v-model="nowShop.menus[0].name" @change="changedShop" label="メニュー"></v-text-field>
          <v-text-field v-model="nowShop.menus[0].img" @change="changedShop" label="画像URL"></v-text-field>
          <v-text-field v-model="nowShop.menus[0].price" @change="changedShop" label="値段"></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Shop from "./Shop"
import NewShop from "./NewShop"

  let db = undefined;
  let db_shops = undefined;
  let deChangeShop = undefined;
  /*
  const shop_hl = {
        name: 'ハイライト',
        close_day: '月火水木金土',
        open_time: '11:00-22:30',
        menus: [
          {name: 'カラフルジャンボチキンカツ', price:750,
          img:'https://cdn-ak.f.st-hatena.com/images/fotolife/m/mesitsu_la/20170308/20170308220915.jpg'},
        ],
        tags: [
          "定食", "コスパ", "揚げ物"
        ],
        flavor: "コスパの良い揚げ物屋"
      };
  */
  export default {
    data: () => ({
      shops: [],

      newShopShow: true,

      editDialog: false,
      editCurrent: 0,

      delay: 500,
    }),
    components: {
      Shop, NewShop
    },
    computed: {
      nowShop() {
        return this.shops[this.editCurrent];
      }
    },
    watch: {
    },
    methods: {
      editShop(index) {
        this.editDialog = true;
        this.editCurrent = index;
      },
      addShop(shop) {
        db_shops.add(shop);
        this.editShop(this.shops.length - 1);
      },
      changedShop() {
        deChangeShop = deChangeShop || window.debounce(()=>{
          db_shops.doc(this.nowShop.id).update(this.nowShop);
        }, 500);
        deChangeShop();
      }
    },
    mounted() {
      db = window.firebase.firestore();
      db_shops = db.collection("shops");
      db_shops.onSnapshot(docs=>{
        var source = docs.metadata.hasPendingWrites ? "Local" : "Server";
        docs.forEach((doc) => {
          const data = doc.data();
          const index = this.shops.findIndex(s=>s.id == doc.id);
          if (index == -1) {
            this.shops.push({id:doc.id, ...data});
          } else {
            if(source == "Server") {
              this.$set(this.shops, index, data);
            }
          }
        });
      });
    }
  }
</script>

<style>

</style>
