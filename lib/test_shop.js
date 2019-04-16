const {search_shops, fetch_shop} = require("./shop.js");

const shops = ["ハイライト", "松屋", "あくた川"];
shops.reduce((pro, name)=>
  pro.then(res =>
    search_shops(name).then(list=>{return {res, list};})).then(({res, list}) =>
    fetch_shop(list[0].url).then(info=>{
      console.log(info);
      return res+[info];
    })).then(res =>
    sleep(1000).then(()=>res))
  , Promise.resolve([]))

//search_shops("ハイライト").then(list=>{
//  console.log(list)
//});
//fetch_shop("https://tabelog.com/kyoto/A2601/A260302/26003803/").then(shop=>{
//  console.log(shop)
//})

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}