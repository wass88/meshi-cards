/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
const {search_shops, fetch_shop} = require("./shop.js");

exports.tabelog_shop = (req, res) => {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
  const type = req.query.type;
  if (type == "search_shops") {
    const name = req.query.name
    search_shops(name).then(
      list => res.json({"status": "ok", "list": list}),
      err => res.json({"status": "ng", "error": err})
    )
  } else if (type == "fetch_shop") {
    const url = req.query.url;
    fetch_shop(url).then(
      info => res.json({"status": "ok", "info": info}),
      err => res.json({"status": "ng", "error": err})
    )
  } else {
    res.json({"status": "ng", "error": "type is invalied"})
  }
};