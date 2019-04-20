<template>
  <div class="card">
    <div class="header">
      <div class="cost">
        <span v-if="info.menus[0]"> {{info.menus[0].price / 10}} </span>
      </div>
      <div class="name">
      {{ info.name }}
      </div>
    </div>
    <div class="image" :style="{backgroundImage:
       'url('+(info.menus[0]?info.menus[0].img:'')+')'}"> </div>
    <div class="content">
      {{ info.menus[0]?(info.menus[0].name + '' + info.menus[0].price):'??' }}
    </div>
    <div class="flavor">
      {{ info.flavor }}
    </div>
    <div class="footer">
      {{ info.open }}
    </div>
  </div>
</template>

<style>
.card {
  position: relative;
  box-sizing: border-box;
  width: 63mm;
  height: 88mm;
  border: 3mm black solid;
  border-radius: 3mm;
  font-family: 'Kosugi Maru', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 4mm;
}
.header {
  font-size: 6mm;
}
.cost {
  border-radius: 50%;
  width: 12mm;
  height: 12mm;
  display: inline;
  border: 6px solid black;
  position: absolute;
  top: -2mm;
  left: -2mm;
}
.cost > span {
  font-size: 7mm;
  margin-left: 4px;
}
.name {
  margin-left: 42px;
  text-align: center;
}
.image {
  height: 30mm;
  background-size: cover;
}
.content {
  flex-grow: 1;
}
</style>

<script>
export default {
  props : [
    "info"
  ],
  data() {
    return({

    });
  },
};
</script>