<template>
  <v-dialog :value="show" v-on:input="onQuit" hide-overlay transition="dialog-bottom-transition">
    <v-card v-if="shop">
      <v-card-title class="headline">ごはん屋さん編集
        - <a :href="shop.url" target="_blank" rel="noopener noreferrer">食べログ</a>
        - <a :href="shop.url+'dtlmenu/photo/'" target="_blank" rel="noopener noreferrer">メニュー</a>
        </v-card-title>
        <v-layout row>
          <v-flex><v-card-text>
        <v-form ref="editform"><v-layout row wrap>
          <v-flex xs10><v-text-field v-model="shop.name" @input="changedShop" label="名前"></v-text-field></v-flex>
          <v-flex xs2><v-text-field v-model="shop.genre" @input="changedShop" label="ジャンル"></v-text-field></v-flex>
          <v-flex xs12><v-text-field v-model="shop.menus[0].img" @input="changedShop" label="画像URL"></v-text-field></v-flex>
          <template v-for="(menu, i) in shop.menus">
            <v-flex xs3 :key="'menup'+i"><v-text-field type="number" v-model="menu.price" @input="changedShop" label="税込値段"></v-text-field></v-flex>
            <v-flex xs7 :key="'menun'+i"><v-text-field v-model="menu.name" @input="changedShop" label="メニュー"></v-text-field></v-flex>
            <template v-if="i == shop.menus.length - 1">
              <v-flex xs1 :key="'menua'+i"><v-btn color="success" @click="addMenu" :disabled="menu.name==''" icon flat><v-icon>add_circle</v-icon></v-btn></v-flex>
              <v-flex xs1 :key="'menur'+i"><v-btn color="error" @click="removeMenu" :disabled="i==0" icon flat><v-icon>remove_circle</v-icon></v-btn></v-flex>
            </template>
            <template v-else>
              <v-flex xs2 :key="'menuz'+i"></v-flex>
            </template>
          </template>
          <v-flex xs12><v-text-field v-model="shop.flavor" @input="changedShop" label="フレーバー"
              :messages="shop.open_time + ' | 休: ' + shop.close_day"
          ></v-text-field></v-flex>

          <v-flex xs2><v-text-field @input="changedShop" v-model="startTime" :messages="startTimeErr" label="開始時刻"></v-text-field></v-flex>
          <v-flex xs2><v-text-field @input="changedShop" v-model="endTime" :messages="endTimeErr" label="終了時刻(LO)"></v-text-field></v-flex>
          <v-flex xs2><v-switch v-model="openRest" label="昼休みあり"></v-switch></v-flex>

          <v-flex xs2><v-text-field @input="changedShop" v-model="nightStartTime" label="夜開始時刻" :messages="nightStartTimeErr" :disabled="!openRest"></v-text-field></v-flex>
          <v-flex xs2><v-text-field @input="changedShop" v-model="nightEndTime" label="夜終了時刻(30h法)" :messages="nightEndTimeErr" :disabled="!openRest"></v-text-field></v-flex>
          <v-flex xs2></v-flex>

            <v-flex xs12><v-text-field v-model="shop.f_open_desc" @input="changedShop" 
              label="定休日補足 [木,土: -22:00]など"
              ></v-text-field></v-flex>
            <v-flex xs1 v-for="(day, i) in shop.f_open_day" :key="'day'+i">
              <v-select :label="'月火水木金土日'.split('')[i]+'曜日'"
                        v-model="shop.f_open_day[i]"
                        :items="[{value:-1,text:'不明'},{value:0, text:'休み'},{value:1, text:'営業'},{value:2,text:'補足'}]"
                        @input="changedShop"></v-select></v-flex>
            <v-flex xs5><v-btn @click="allDayOpen">全営業</v-btn></v-flex>
          </v-layout></v-form>
        </v-card-text></v-flex>
          <v-flex>
            <Shop :info="shop" style="margin: 5mm"></Shop>
          </v-flex>
      </v-layout>
          </v-card>
        </v-dialog>

</template>

<script>
import Shop from "./Shop"

  const validTimeSet = (t,i,v,e) => {
          const m = v.match(/(\d?\d):(\d\d)/);
          if (!m) { t[e]="must be like 12:30, 18:12"; return; }
          t.$set(t.shop.f_open_times, i, (0|m[1])*60 + (0|m[2]));
          t[e]="";};
  const validTimeGet = (s,i) => {
          if(!s.shop) return;
          const t = s.shop.f_open_times[i]
          const h = 0|(t/60), m = t%60;
          return h+":"+((m<10)?"0":"")+m; };
    export default {
      data: () => ({
        startTimeErr: "",
        endTimeErr: "",
        nightStartTimeErr: "",
        nightEndTimeErr: "",
      }),
    components: {
      Shop
    },
      props: {
        shop: {
          type: Object,
          default: null
        },
        show: {
          type: Boolean,
          default: false,
        }
      },
      computed: {
        startTime : {set(v){validTimeSet(this, 0,v, "startTimeErr")},
            get(){return validTimeGet(this, 0)}},
        endTime : {set(v){validTimeSet(this, 1,v,"endTimeErr")},
            get(){return validTimeGet(this, 1)}},
        nightStartTime : {set(v){validTimeSet(this, 2,v,"nightStartTimeErr")},
            get(){return validTimeGet(this, 2)}},
        nightEndTime : {set(v){validTimeSet(this, 3,v,"nightEndTimeErr")},
            get(){return validTimeGet(this, 3)}},
        openRest: {set(v){
          if(v) {
            if(this.shop.f_open_times.length <= 2){
              this.shop.f_open_times.push(1234);
              this.shop.f_open_times.push(1434);
            }
          } else {
            if(this.shop.f_open_times.length > 2){
              this.shop.f_open_times.pop();
              this.shop.f_open_times.pop();
            }
          }
        },get() {
          return this.shop.f_open_times.length > 2;
        }},
      },
      methods: {
        onQuit(e) {
          if (!e) this.$emit('quit');
        },
        changedShop() {
          this.$emit('changedShop', this.shop)
        },
        addMenu() {
          this.shop.menus.push({name:'', price:0})
          this.changedShop()
        },
        removeMenu() {
          this.shop.menus.splice(this.shop.menus.length - 1, 1)
          this.changedShop()
        },
        allDayOpen() {
          for (let i = 0; i < 7; i++) {
            this.$set(this.shop.f_open_day, i, 1);
          }
          this.changedShop();
        },
      },

    }
</script>