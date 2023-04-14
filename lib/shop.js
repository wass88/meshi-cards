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
  const rp = require("request-promise");
  const cheerio = require("cheerio");

  const options = {
    transform: (body) => {
      return cheerio.load(body);
    },
  };
  return rp.get(url, options);
}
function parse_close(str) {
  const dn = ["月", "火", "水", "木", "金", "土", "日"];
  const res = [1, 1, 1, 1, 1, 1, 1];
  dn.forEach((d, i) => {
    if (str.match(d + "曜日")) {
      res[i] = 0;
    }
  });
  return res;
}
function parse_time(str) {
  let m = str.match(
    /(\d?\d:\d\d)[~-～](\d?\d:\d\d)[^日月火水木金土]*[^日月火水木金土12](\d?\d:\d\d)[~-～](\d?\d:\d\d)/
  );
  const pt = (t) => {
    const k = t.length == 4 ? "0" + t : t;
    return (0 | k.substring(0, 2)) * 60 + (0 | k.substring(3, 5));
  };
  if (m) {
    return [pt(m[1]), pt(m[2]), pt(m[3]), pt(m[4])];
  }
  m = str.match(/(\d?\d:\d\d)[~-～](\d?\d:\d\d)/);
  if (m) {
    return [pt(m[1]), pt(m[2])];
  }
  return [0, 0];
}

module.exports = {
  parse_time,
  parse_close,
  search_shops(name) {
    const es = encodeURIComponent(name);
    const url = `https://tabelog.com/kyoto/A2601/A260302/R6479/rstLst/?sw=${es}&sk=${es}&LstRange=SD&svd=20190415&svt=1900&svps=2`;
    return fetch_page(url).then(($) => {
      const sel_list = `div.flexible-rstlst-main h3 a`;
      const list = $(sel_list);
      const res = [];
      const max_cond = 5;
      for (let i = 0; i < list.length && i < max_cond; i++) {
        const cel = list.eq(i);
        res.push({ name: cel.text(), url: cel.attr("href") });
      }
      return res;
    });
  },
  fetch_shop(url) {
    return fetch_page(url).then(($) => {
      const sel1s = `#contents-rstdata > div.rstinfo-table > table:nth-child(2) > tbody > tr`;
      const sel2s = `#contents-rstdata > div.rstinfo-table > table:nth-child(4) > tbody > tr`;
      const data = {};
      [sel1s, sel2s].forEach((s) => {
        $(s).map((i, x) => {
          const name = $(x)
            .find(`th`)
            .text();
          const val = $(x).find(`td`);
          data[name] = val;
        });
      });

      const d = (n) =>
        data[n]
          ? data[n]
          : {
              text() {
                return "??";
              },
              attr(x) {
                return "??";
              },
            };
      const nm = d("住所")
        .find("img")
        .attr("data-original");
      const res = nm
        ? nm.match(/center=(\d+\.\d+),(\d+\.\d+)/)
        : [0, "??", "??"];
      const x = res[1];
      const y = res[2];

      const slim = (str) =>
        str
          .split("\n")
          .map((s) => s.trim())
          .join(" ")
          .trim();
      const open_time = slim(d("営業時間").text());
      const close_day = slim(d("定休日").text());
      return {
        name: slim(d("店名").text()),
        place: slim(
          d("住所")
            .text()
            .trim()
            .split("\n")[0]
        ),
        open_time: open_time,
        close_day: close_day,
        payment: slim(d("支払い方法").text()),
        seats: slim(d("席数").text()),
        location: [x, y],
        url: url,
        f_open_times: parse_time(open_time),
        f_open_day: parse_close(close_day),
      };
    });
  },
};
