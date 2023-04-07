<template>
  <v-app>
    <Nav :filters="filters" :show="navShow" @quit="navShow=false"
        style="position: fixed; height: 100vh;"
        @updateFilter="updateFilter" @login="login" :loginState="loginState"></Nav>

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

    <v-content>
      <v-container style="max-width: initial;">
        <div v-if="shops" class="cards">
          <Shop style="margin: 2mm" v-for="i in filteredShops[0]" :key="shops[i].id" :info="shops[i]"
              @click.native="editShop(i)"></Shop>
          <Shop style="margin: 2mm; opacity: 0.5;" v-for="i in filteredShops[1]" :key="shops[i].id" :info="shops[i]"
              @click.native="editShop(i)"></Shop>
        </div>
      </v-container>
    </v-content>
    <NewShop @addShop="addShop" :shops="shops"
            :show="newShopShow" @quit="newShopShow=false"></NewShop>

    <EditShop :shop="nowShop" :show="editDialog" @changedShop="changedShop" @quit="editDialog=false"></EditShop>
  </v-app>
</template>

<script>
import Shop from "./Shop"
import EditShop from "./EditShop"
import NewShop from "./NewShop"
import Nav from "./Nav"

import qs from "qs";

import shop_filter from "./shop_filter.js"

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function IsEditor(uid, callback) {
    const db = window.firebase.firestore();
    const db_users = db.collection("users");
    db_users.doc(uid).get().then(doc => {
        if (doc.exists) {
            callback(doc.data().type=="editor");
        } else {
            callback(false);
        }
    });
}


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

      newShopShow: false,

      editDialog: false,
      editCurrent: 0,
      delay: 500,

      navShow: false,
      location: [35.028857, 135.779329],
      time: 0,

      loginState: {
        state: "init",
      }
    }),
    components: {
      Shop, NewShop, Nav, EditShop
    },
    computed: {
      nowShop() {
        return this.shops[this.editCurrent];
      },
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
          pos: this.location,
        };
        this.shops.forEach((s, i) => {
          const k = this.filters.every(fn => shop_filter.filters(fn)(s, set));
          if(k) {
            select.push(i);
          } else {
            reject.push(i);
          }
        })
        return [shuffle(select), reject];
      },
    },
    methods: {
      editShop(index) {
        if (this.loginState.state === "editor") {
          this.editDialog = true;
          this.editCurrent = index;
        } else {
          console.info("Your are not editor. Need login.")
        }
      },
      addShop(shop) {
        db_shops.add(shop).then(()=>{
          this.editShop(this.shops.length - 1);
        });
      },
      changedShop() {
        deChangeShop = deChangeShop || window.debounce(()=>{
          db_shops.doc(this.nowShop.id).update(this.nowShop).catch(e=>window.alert("Error:" + e));
        }, 500);
        deChangeShop();
      },
      addMenu(){
        this.nowShop.menus.push({name: "", price: 42, img: ""});
      },
      removeMenu() {
        this.nowShop.menus.pop();
      },
      updateFilter(i, s) {
        this.filters[i] = s;
        this.filters = this.filters;
      },
      login() {
        this.loginState.state = "waiting";
        const provider = new window.firebase.auth.GoogleAuthProvider();
        window.firebase.auth()
          .signInWithPopup(provider)
          .then((result) => {
            /** @type {firebase.auth.OAuthCredential} */
            const credential = result.credential;

            // This gives you a Google Access Token. You can use it to access the Google API.
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            IsEditor(user.uid, (editor) => {
              if (editor) {
                this.loginState.state = "editor"
              } else {
                this.loginState.state = "visitor"
              }
            });
            console.log({token, user})
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            const credential = error.credential;
            this.loginState.state = "failed"
            console.error({errorCode, errorMessage, email, credential})
          });
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
            if (source == "Server") {
              this.$set(this.shops, index, data);
            }
          }
        });
      });
      navigator.geolocation.getCurrentPosition(c=>{
        console.log(c);
        this.location = [c.coords.latitude, c.coords.longitude];
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
