<template>
  <v-container>
    <Shop :info="shops[0]"></Shop>
  </v-container>
</template>

<script>
import Shop from "./Shop"
  const shop_hl = {
        name: 'ハイライト',
        open_day: '月火水木金土',
        open_time: '11:00-22:30',
        menus: [
          {name: 'カラフルジャンボチキンカツ', price:'750',
          img:'https://cdn-ak.f.st-hatena.com/images/fotolife/m/mesitsu_la/20170308/20170308220915.jpg'},
        ],
        tags: [
          "定食", "コスパ", "揚げ物"
        ],
        flavor: "コスパの良い揚げ物屋"
      };
  export default {
    data: () => ({
      shops: [shop_hl]
    }),
    components: {
      Shop
    }
  }
</script>

<style>

</style>
