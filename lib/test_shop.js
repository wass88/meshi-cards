const {
  parse_time,
  parse_close,
  search_shops,
  fetch_shop,
} = require("./shop.js");

function testParseTime() {
  [
    "11:30～15:30(L.O.15:00)17:00～23:30(L.O.23:00)",
    "7:30～19:00 日曜営業",
    "11:00-15:00 17:00-22:30 日曜営業",
    "12:00～15:00(L.O)17:30～21:00(L.O) 日曜営業",
    "11:00～14:0017:30～21:00 (20:30 LO) 日曜営業",
    "[月～金]　11:00～23:20 [土] 11:00～22:20",
  ].forEach((x) => {
    console.log(x, parse_time(x));
  });
}

function testParseClose() {
  [
    "木曜日",
    "月曜日",
    "日曜日",
    "月曜日（祝日の場合は営業）",
    "無休　（年始を除く）",
    "月曜日終日及び火曜日のランチ　火曜日の夜より営業　その他不定休有り",
    "不定休（ツイッターで要確認！！）",
  ].forEach((x) => {
    console.log(x, parse_close(x));
  });
}

function testShops() {
  const shops = ["ハイライト", "松屋", "あくた川"];
  shops.reduce(
    (pro, name) =>
      pro
        .then((res) =>
          search_shops(name).then((list) => {
            return { res, list };
          })
        )
        .then(({ res, list }) => {
          console.log(list);
          fetch_shop(list[0].url).then((info) => {
            console.log(info);
            return res + [info];
          });
        })
        .then((res) => sleep(1000).then(() => res)),
    Promise.resolve([])
  );
}

search_shops("ハイライト").then((list) => {
  console.log(list);
});
fetch_shop("https://tabelog.com/kyoto/A2601/A260302/26003803/").then((shop) => {
  console.log(shop);
});

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}
