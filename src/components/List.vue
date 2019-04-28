<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline">
        <span>飯カードα</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
      <v-btn flat @click="newShopShow=true">カード作成</v-btn>
      <v-btn flat @click="navShow=true">フィルタ</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <Nav :filters="filters" :show="navShow" @quit="navShow=false"
         @updateFilter="updateFilter"></Nav>

    <v-content>
      <v-container>
        <div v-if="shops" class="cards">
          <Shop style="margin: 2mm" v-for="i in filteredShops[0]" :key="shops[i].id" :info="shops[i]"
              @click.native="editShop(i)"></Shop>
          <Shop style="margin: 2mm; opacity: 0.5;" v-for="i in filteredShops[1]" :key="shops[i].id" :info="shops[i]"
              @click.native="editShop(i)"></Shop>
        </div>
        <NewShop @addShop="addShop" :shops="shops"
                :show="newShopShow" @quit="newShopShow=false"></NewShop>

        <v-dialog v-model="editDialog" hide-overlay transition="dialog-bottom-transition">
          <v-card v-if="nowShop">
            <v-card-title class="headline">ごはん屋さん編集
              - <a :href="nowShop.url" target="_blank" rel="noopener noreferrer">食べログ</a>
              - <a :href="nowShop.url+'dtlmenu/photo/'" target="_blank" rel="noopener noreferrer">メニュー</a>
              </v-card-title>
            <v-card-text>
              <v-form ref="editform"><v-layout row wrap>
                <v-flex xs10><v-text-field v-model="nowShop.name" @change="changedShop" label="名前"></v-text-field></v-flex>
                <v-flex xs2><v-text-field v-model="nowShop.genre" @change="changedShop" label="ジャンル"></v-text-field></v-flex>
                <v-flex xs12><v-text-field v-model="nowShop.menus[0].img" @change="changedShop" label="画像URL"></v-text-field></v-flex>
                <template v-for="(menu, i) in nowShop.menus">
                  <v-flex xs3 :key="'menup'+i"><v-text-field type="number" v-model="menu.price" @change="changedShop" label="税込値段"></v-text-field></v-flex>
                  <v-flex xs7 :key="'menun'+i"><v-text-field v-model="menu.name" @change="changedShop" label="メニュー"></v-text-field></v-flex>
                  <template v-if="i == nowShop.menus.length - 1">
                    <v-flex xs1 :key="'menua'+i"><v-btn color="success" @click="addMenu" :disabled="menu.name==''">追加</v-btn></v-flex>
                    <v-flex xs1 :key="'menur'+i"><v-btn color="error" @click="removeMenu" :disabled="i==0">削除</v-btn></v-flex>
                  </template>
                  <template v-else>
                    <v-flex xs2 :key="'menuz'+i"></v-flex>
                  </template>
                </template>
                <v-flex xs12><v-text-field v-model="nowShop.flavor" @change="changedShop" label="フレーバー"
                    :messages="nowShop.open_time + ' | 休: ' + nowShop.close_day"
                ></v-text-field></v-flex>

                <v-flex xs2><v-text-field @change="changedShop" v-model="startTime" :messages="startTimeErr" label="開始時刻"></v-text-field></v-flex>
                <v-flex xs2><v-text-field @change="changedShop" v-model="endTime" :messages="endTimeErr" label="終了時刻(LO)"></v-text-field></v-flex>
                <v-flex xs2><v-switch v-model="openRest" label="昼休みあり"></v-switch></v-flex>

                <v-flex xs2><v-text-field @change="changedShop" v-model="nightStartTime" label="夜開始時刻" :messages="nightStartTimeErr" :disabled="!openRest"></v-text-field></v-flex>
                <v-flex xs2><v-text-field @change="changedShop" v-model="nightEndTime" label="夜終了時刻(30h法)" :messages="nightEndTimeErr" :disabled="!openRest"></v-text-field></v-flex>
                <v-flex xs2></v-flex>

                <v-flex xs12><v-text-field v-model="nowShop.f_open_desc" @change="changedShop" 
                  label="定休日補足 [木,土: -22:00]など"
                  ></v-text-field></v-flex>
                <v-flex xs1 v-for="(day, i) in nowShop.f_open_day" :key="'day'+i">
                  <v-select :label="'月火水木金土日'.split('')[i]+'曜日'"
                            v-model="nowShop.f_open_day[i]"
                            :items="[{value:-1,text:'不明'},{value:0, text:'休み'},{value:1, text:'営業'},{value:2,text:'補足'}]"
                            @change="changedShop"></v-select></v-flex>
                <v-flex xs5><v-btn @click="allDayOpen">全営業</v-btn></v-flex>
              </v-layout></v-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Shop from "./Shop"
import NewShop from "./NewShop"
import Nav from "./Nav"

import qs from "qs";

import shop_filter from "./shop_filter.js"

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
  const validTimeSet = (t,i,v,e) => {
          const m = v.match(/(\d?\d):(\d\d)/);
          if (!m) { t[e]="must be like 12:30, 18:12"; return; }
          console.log(m[1], m[2], (0|m[1])*60 + (0|m[2]));
          t.$set(t.nowShop.f_open_times, i, (0|m[1])*60 + (0|m[2]));
          t[e]="";};
  const validTimeGet = (s,i) => {
          if(!s.nowShop) return;
          const t = s.nowShop.f_open_times[i]
          const h = 0|(t/60), m = t%60;
          return h+":"+((m<10)?"0":"")+m; };

  export default {
    data: () => ({
      shops: [],

      newShopShow: false,

      editDialog: false,
      editCurrent: 0,
      delay: 500,

      openTimeDay: [1,1,1,1,1,1,1],
      startTimeErr: "",
      endTimeErr: "",
      nightStartTimeErr: "",
      nightEndTimeErr: "",

      navShow: false,
      time: 0,
    }),
    components: {
      Shop, NewShop, Nav
    },
    computed: {
      nowShop() {
        return this.shops[this.editCurrent];
      },
      openRest: {set(v){
        if(v) {
          if(this.nowShop.f_open_times.length <= 2){
            this.nowShop.f_open_times.push(1234);
            this.nowShop.f_open_times.push(1434);
          }
        } else {
          if(this.nowShop.f_open_times.length > 2){
            this.nowShop.f_open_times.pop();
            this.nowShop.f_open_times.pop();
          }
        }
      },get() {
        return this.nowShop.f_open_times.length > 2;
      }},
      startTime : {set(v){validTimeSet(this, 0,v, "startTimeErr")},
          get(){return validTimeGet(this, 0)}},
      endTime : {set(v){validTimeSet(this, 1,v,"endTimeErr")},
          get(){return validTimeGet(this, 1)}},
      nightStartTime : {set(v){validTimeSet(this, 2,v,"nightStartTimeErr")},
          get(){return validTimeGet(this, 2)}},
      nightEndTime : {set(v){validTimeSet(this, 3,v,"nightEndTimeErr")},
          get(){return validTimeGet(this, 3)}},
      query: {
        get(){
          return qs.parse(window.location.search.substr(1));},
        set(s){
          const q  = qs.stringify(s);
          var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + q;
          window.history.pushState({path:newurl},'',newurl);
        },
      },
      filters: { get() {
        if (this.query.filter)
          return this.query.filter;
        else
          return ["","",""] ;
        }, set(s) { 
          this.$set(this.query, "filter", s);
          this.query=this.query;
          this.time+=1;
        }
      },
      filteredShops() {
        this.time + 1; //TODO:
        const select = [];
        const reject = [];
        const date = new Date();
        const set = {
          now: date.getHours()*60+date.getMinutes(),
          week: (date.getDay()-1+7)%7,
          pos: [35.028857, 135.779329],
        };
        this.shops.forEach((s, i) => {
          const k = this.filters.every(fn => shop_filter.filters(fn)(s, set));
          if(k) {
            select.push(i);
          } else {
            reject.push(i);
          }
        })
        return [select, reject];
      },
    },
    methods: {
      editShop(index) {
        this.editDialog = true;
        this.editCurrent = index;
      },
      addShop(shop) {
        db_shops.add(shop).then(()=>{
          this.editShop(this.shops.length - 1);
        });
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
      },
      allDayOpen() {
        for (let i = 0; i < 7; i++) {
          this.$set(this.nowShop.f_open_day, i, 1);
        }
        this.changedShop();
      },
      updateFilter(i, s) {
        this.filters[i] = s;
        this.filters = this.filters;
      },
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
.cards{
  display: flex;
  flex-wrap: wrap;
}

</style>
