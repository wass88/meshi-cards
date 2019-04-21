/*
const shop_hl = {
    name: 'ハイライト',
    open: '月火水木金土 11:00-22:30',
    menus: [
        {name: 'カラフルジャンボチキンカツ', price:'750',
        img:'https://cdn-ak.f.st-hatena.com/images/fotolife/m/mesitsu_la/20170308/20170308220915.jpg'},
    ],
    tags: [
        "定食", "コスパ", "揚げ物"
    ],
    flavor: "コスパの良い揚げ物屋"
};
*/
function fetch_page(url) {
  const rp = require('request-promise');
  const cheerio = require('cheerio');

  const options = {
    transform: (body) => {
      return cheerio.load(body);
    }
  };
  return rp.get(url, options)
}
module.exports = {
  search_shops(name) {
    const es = encodeURIComponent(name);
    const url = `https://tabelog.com/kyoto/A2601/A260302/R6479/rstLst/?sw=${es}&sk=${es}&LstRange=SD&svd=20190415&svt=1900&svps=2`;
    return fetch_page(url).then(($) => {
      const sel_list = `#column-main > ul:nth-child(6) > li`;
      const sel = x=>`#column-main > ul:nth-child(6) > li:nth-child(${x}) > div.list-rst__wrap.js-open-new-window > div.list-rst__header > div > div > div > a`;
      const len = $(sel_list).length;
      const res = [];
      const max_cond = 5;
      for (let i = 0; i < max_cond && i < len; i++) {
        const cel = $(sel(i+1));
        res.push({name: cel.text(), url: cel.attr('href')});
      }
      return res;
    });
  },
  fetch_shop(url) {
    return fetch_page(url).then(($) => {
      const sel1s = `#contents-rstdata > div.rstinfo-table > table:nth-child(2) > tbody > tr`;
      const sel2s = `#contents-rstdata > div.rstinfo-table > table:nth-child(4) > tbody > tr`;
      const data = {};
      [sel1s, sel2s].forEach(s=>{
        $(s).map((i, x) => {
          const name = $(x).find(`th`).text();
          const val = $(x).find(`td`);
          data[name] = val;
        })
      })

      const d = n => data[n] ? data[n] : {text(){return "??";}, attr(x){return "??";}}; 
      const nm = d("住所").find("img").attr("data-original");
      const res = nm ? nm.match(/center=(\d+\.\d+),(\d+\.\d+)/) : [0, "??", "??"];
      const x = res[1];
      const y = res[2];

      const slim = str=>str.split("\n").map(s=>s.trim()).join(" ").trim()
      return ({
        name: slim(d("店名").text()),
        place: slim(d("住所").text().trim().split("\n")[0]),
        open_time: slim(d("営業時間").text()),
        close_day: slim(d("定休日").text()),
        payment: slim(d("支払い方法").text()),
        seats: slim(d("席数").text()),
        location: [x, y],
        url: url,
      });
    })
  }
}
