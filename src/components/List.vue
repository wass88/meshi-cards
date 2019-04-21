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
          <v-layout row wrap>
            <v-flex xs12><v-text-field v-model="nowShop.name" @change="changedShop" label="名前"></v-text-field></v-flex>
            <v-flex xs12><v-text-field v-model="nowShop.menus[0].img" @change="changedShop" label="画像URL"></v-text-field></v-flex>
            <template v-for="(menu, i) in nowShop.menus">
              <v-flex xs3 :key="'menup'+i"><v-text-field v-model="menu.price" @change="changedShop" label="値段"></v-text-field></v-flex>
              <v-flex xs7 :key="'menun'+i"><v-text-field v-model="menu.name" @change="changedShop" label="メニュー"></v-text-field></v-flex>
              <template v-if="i == nowShop.menus.length - 1">
                <v-flex xs1 :key="'menua'+i"><v-btn color="success" @click="addMenu" :disabled="menu.name==''">追加</v-btn></v-flex>
                <v-flex xs1 :key="'menur'+i"><v-btn color="error" @click="removeMenu" :disabled="i==0">削除</v-btn></v-flex>
              </template>
              <template v-else>
                <v-flex xs2 :key="'menuz'+i"></v-flex>
              </template>
            </template>
            <v-flex xs12><v-text-field v-model="nowShop.flavor" @change="changedShop" label="フレーバー"></v-text-field></v-flex>

            <v-flex xs12><v-text-field v-model="nowShop.f_open_desc" @change="changedShop" label="定休日補足"></v-text-field></v-flex>

            <v-flex xs3><v-text-field @change="changedShop" v-model="startTime" label="開始時刻"></v-text-field></v-flex>
            <v-flex xs3><v-text-field @change="changedShop" v-model="endTime" label="終了時刻"></v-text-field></v-flex>
            <v-flex xs3><v-switch v-model="openRest" label="休みあり"></v-switch></v-flex>

            <v-flex xs3><v-text-field @change="changedShop" v-model="nightStartTime" label="夜開始時刻"></v-text-field></v-flex>
            <v-flex xs3><v-text-field @change="changedShop" v-model="nightEndTime" label="夜終了時刻"></v-text-field></v-flex>


            <v-flex xs1 v-for="(day, i) in openTimeDay" :key="'day'+i">
              <v-select :label="'月火水木金土日'.split('')[i]+'曜日'"
                        v-model="openTimeDay[i]" :items="[0,1,2,3]" @change="changedShop"></v-select></v-flex>
          </v-layout>
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

      openRest: false,
      startTime: 0, endTime: 0, nightStartTime: 0, nightEndTime:0,
      openTimeDay: [1,1,1,1,1,1,1]
    }),
    components: {
      Shop, NewShop
    },
    computed: {
      nowShop() {
        return this.shops[this.editCurrent];
      },
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
      },
      addMenu(){
        this.nowShop.menus.push({name: "", price: 42, img: ""});
      },
      removeMenu() {
        this.nowShop.menus.pop();
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
