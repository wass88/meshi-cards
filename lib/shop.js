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
      const sel1 = x=>`#contents-rstdata > div.rstinfo-table > table:nth-child(2) > tbody > tr:nth-child(${x}) > td`;
      const sel2 = x=>`#contents-rstdata > div.rstinfo-table > table:nth-child(4) > tbody > tr:nth-child(${x}) > td`;
      
      const slim = str=>str.split("\n").map(s=>s.trim()).join(" ").trim()
      return ({
        name: slim($(sel1(1)).text()),
        place: slim($(sel1(5)).text().trim().split("\n")[0]),
        open_time: slim($(sel1(7)).text()),
        close_day: slim($(sel1(8)).text()),
        payment: slim($(sel1("n):nth-last-child(1")).text()),
        seats: slim($(sel2(1)).text()),
        url: url,
      });
    })
  }
}
