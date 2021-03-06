function isOpen(shop, now, week) {
  const t = shop.f_open_times;
  const days = shop.f_open_day;
  const today = days[week] != 0;
  const tomorrow = days[(week -1+6)%7] != 0;
  
  return (today && (
                    t[0] <= now && now < t[1] ||
            t[2] && t[2] <= now && now < t[3])) ||
         (tomorrow && (
                    t[1] >= 24*60 && now < t[1] - 24*60 ||
            t[3] && t[3] >= 24*60 && now < t[3] - 24*60));
}
function dis(shop, pos) {
  const shop_pos = shop.location;
  const R = 6356.752314 * 1000 * 2 * Math.PI;
  const xR = R * Math.cos(pos[0]/180*Math.PI)
  const y = Math.abs(shop_pos[0] - pos[0]) / 360 * R;
  const x = Math.abs(shop_pos[1] - pos[1]) / 360 * xR;
  return x + y;
}
export default {
  filters : (name) => {
    const defs = {
      "": (_shop, _conf) => true,
      "after15m": (shop, conf) => isOpen(shop, conf.now + 15, conf.week),
      "today": (shop, conf) => shop.f_open_day[conf.week] != 0,
      "in400m": (shop, conf) => dis(shop, conf.pos) <= 400,
      "in800m": (shop, conf) => dis(shop, conf.pos) <= 800,
      "in1200m": (shop, conf) => dis(shop, conf.pos) <= 1200,
    }
    const res = defs[name];
    if(res) return res;
    const m1 = name.match(/^genre(.+)$/);
    if(m1){
      const name = m1[1];
      return (shop, _conf) => shop.genre.trim() === name.trim();
    }
    const m2 = name.match(/^in(\d+)m$/);
    if(m2){
      const d = 0|m2[1];
      return (shop, conf) =>  dis(shop, conf.pos) <= d;
    }
    throw "Missing Filter";
  }
};