<template>
  <div class="card">
    <div class="cost">
      <div v-if="info.menus[0]"> 
        <div class="cost100"> {{dig100}} </div>
        <div class="costdot" v-if="dig100<10"> . </div>
        <div class="cost10" v-if="dig100<10"> {{dig10}} </div>
      </div>
    </div>
    <div class="header">
      <div class="name">
        <div class="namestr" 
        :style="{fontSize: `${autoSize(info.name, 6, 45)}mm`}">
        {{ info.name }}</div>
      </div>
    </div>
    <div class="image_cell">
      <div class="image" :style="{backgroundImage:
        'url('+(info.menus[0]?info.menus[0].img:'')+')'}"> </div>
      <div class="map">
        <div class="pos" :style="{top: `${posY}`, left:`${posX}`}"> </div>
      </div>
    </div>
    <div class="content">
      <div class="menu" v-for="(menu, i) in info.menus" :key="i">
        <div class="price"> {{menu.price}}</div>
        <div class="dash"> ー </div>
        <div class="name"> {{menu.name}}</div>
      </div>
    </div>
    <div class="flavor">
      {{ info.flavor }}
    </div>
    <div class="footer">
      {{ times_str }} {{ this.info.f_open_desc }}
      <div class="dayline">
        <div class="dayinfo" v-for="(day, i) in dayinfo" :key="i">
          <div v-if="day.full" class="day day_full">{{day.day}}</div>
          <div v-else>
            <div class="day day_1">{{day.day1}}</div>
            <div class="slash">／</div>
            <div class="day day_2">{{day.day2}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props : [
    "info"
  ],
  data() {
    return({

    });
  },
  methods: {
    autoSize(cont, max, width) {
      // TODO: 正しい横幅へ
      const tmpwidth = Array.from(cont).map(c=>c.charCodeAt(0)<100?0.2:1).reduce((p,x)=>p+x)
      return Math.min(max, width / tmpwidth);
    }
  },
  computed: {
    dig100() { return 0|(((0|this.info.menus[0].price)+9)/100); },
    dig10() { return (0|(((0|this.info.menus[0].price)+9)/10))%10; },
    posX() { return `${this.pos[0]}mm`; },
    posY() { return `${this.pos[1]}mm`; },
    pos() {
      const x = parseFloat(this.info.location[1]);
      const y = parseFloat(this.info.location[0]);
      const centerX = 135.779248;
      const centerY = 35.028813;
      const radius = 35.047047 - centerY;
      const map_size = 20;
      return [
        (x - centerX) / (2 * radius) * map_size + map_size / 2 - 1,
        (y - centerY) / (2 * radius) * map_size + map_size / 2
      ]
    },
    times_info() {
      const f_open_times = [12*60, 15*60, 17*60, 22*60];
      const n_times = f_open_times.length / 2;
      const times = Array.from(new Array(n_times)).map(
        (_,i) => [f_open_times[2*i], f_open_times[2*i+1]]);
      return times;
    },
    times_str() {
      const t2s = t=>`${0|t/60}:${t%60<10?'0':''}${t%60}`;
      const ts = this.times_info.map(t=>`${t2s(t[0])}-${t2s(t[1])}`)
      let res = ts[0];
      if (ts[1]) {
        if (this.times_info[0][1] <= this.times_info[1][0]){
          res += "/" + ts[1];
        }
      }
      if (ts[2]) res += "S" + ts[2];
      return res;
    },
    days_info() {
      const close = 0;
      const open = 1;
      const unst = 3;
      const f_open_day = [1+4*1, 1+4*1, 1, 4*1, 4*1, 3, -1, -1];
      const res = [];
      for (let i = 0; i < 7; i++) {
        const d = f_open_day[i];
        const day = { undef: true }
        if (d != -1)  {
          day.undef = false;
          day.open_times = [];
          let k = d;
          for(let i = 0; i < this.times_info.length; i++){
            let c = k % 4;
            if (c == open) {
              day.open_times.push({timeid:i, unstable:false});
            } else if (c == unst) {
              day.open_times.push({timeid:i, unstable:true});
            }
            k = 0|(k / 4);
          }
          day.open_times.sort((a, b)=>this.times_info[a.timeid] - this.times_info[b.timeid]);
        }
        res.push(day);
      }
      return res;
    },
    dayinfo() {
      return this.days_info.map(d => {
        if (d.undef) return {full: true, day:"?"};
        console.log(d, this.times_info)
        const ts = d.open_times;
        const type = t=>t.unstable?"*":ts[0].timeid>=2?"S":"O"
        if (ts.length == 0) { // 休み
          return {full: true, day: "X"} 
        } else if (ts.length == 1) {
          const op = this.times_info[ts[0].timeid];
          const midtime = 16*60+10;
          console.log(this.times_info, ts[0], ts[0].timeid, op);
          if (op[0] < midtime && midtime < op[1]) { // 通し営業
            return {full: true, day: type(ts[0])}
          } else if (op[1] < midtime) { // ランチのみ
            return {full: false, day1: type(ts[0]), day2: "X"} 
          } else { // ディナーのみ
            return {full: false, day1: "X", day2: type(ts[0])} 
          }
        } else {
          return {full: false, day1: type(ts[0]), day2: type(ts[1])}
        } 
      });
      return [
        {full: true, day:"?"},
        {full: true, day:"O"},
        {full: true, day:"X"},
        {full: true, day:"S"},
        {full: false, day1:"?", day2:"X"},
        {full: false, day1:"?", day2:"X"},
        {full: false, day1:"?", day2:"X"},
      ]
    }
  }
};
</script>

<style>
.card {
  position: relative;
  box-sizing: border-box;
  width: 63mm;
  height: 88mm;
  border: 3mm black solid;
  border-radius: 3mm;
  font-family: 'Noto Sans JP', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 4mm;
  background-color: hsl(50, 100%, 14%);
}
.header {
  /*font-size: 6mm;*/
  color: #eee;
  height: 8mm;
}
.cost {
  border-radius: 50%;
  width: 12mm;
  height: 12mm;
  display: inline;
  border: 6px solid black;
  background-color: #eee;
  position: absolute;
  top: -2mm;
  left: -2mm;
}
.cost > div {
  font-size: 7mm;
  margin-left: 4px;
  color: #111;
}
.cost .cost100 {
  margin-top: -1mm;
}
.cost .costdot {
  margin-top: -10mm;
  margin-left: 3mm;
}
.cost .cost10 {
  margin-top: -9mm;
  margin-left: 4mm;
  font-size: 5mm;
}
.header .name {
  margin-left: 39px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 8mm;
}
.name_str{

}
.image_cell {
  height: 30mm;
}
.image {
  border-top: solid 1mm black;
  border-bottom: solid 1mm black;
  height: 30mm;
  background-size: cover;
}
.map {
  height:20mm;
  width:20mm;
  bottom:20mm;
  right:-37mm;
  background-size: cover;
  background-image: url("../../public/map.svg");
  position: relative;
}
.pos {
  position: absolute;
  background-image: url("../../public/pos.svg");
  height: 3mm;
  width: 3mm;
}

.content {
  flex-grow: 1;
  background-color: hsl(50, 100%, 86%);
  font-size: 3mm;
  padding: 3mm;
}
.content .price {
  display: table-cell;
  font-weight: bold;
}
.content .dash {
  display: table-cell;
  padding: 0 2mm;
  color: #8a8a8a;
}
.content .name {
  display: table-cell;
}
.flavor{
  background-color: hsl(50, 100%, 86%);
  font-size: 3mm;
  padding-left: 3mm;
  padding-bottom: 3mm;
}

.footer {
  color: #eee;
}
.dayline {
  height: 5mm;
  display: flex;
  flex-direction: row;
}

.dayinfo {
  width: 6mm;
  border-right: 0.3mm #eee solid;
}

.dayinfo .day_full {
  margin-top: -0.7mm;
  margin-left: 1.5mm;
}

.dayinfo .day_1 {
  margin-top: -1.1mm;
  margin-left: 0.3mm;
  font-size: 3.5mm;
}

.dayinfo .day_2 {
  margin-top: -4.5mm;
  margin-left: 2.6mm;
  font-size: 3.5mm;
}

.dayinfo .slash {
  margin-top: -4.5mm;
  margin-left: 0.6mm;
}

</style>