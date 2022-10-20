const { default: axios } = require("axios");
var express = require("express");
var router = express.Router();
const cheerio = require("cheerio");
const { dbName, dbUrl, mongodb, MongoClient } = require("../Configdb");
const client = new MongoClient(dbUrl);


router.get('/', function(req, res, next) {
  res.send(' Welcome to WebScrapping.  Server Running Perfectly');
});
// router.post("/flip", async (req, res) => {
//   await client.connect();
//   try {
//     const fetchData = await axios.get(
//       `https://www.flipkart.com/search?q=iphone&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`
//     );
//     const db = await client.db(dbName);
//     const $ = cheerio.load(fetchData.data);
//     const productsArray = $("._1YokD2 ._1AtVbE ").toArray();
//     console.log(productsArray);
//     let results = productsArray
//       .map((n) => {
//         let temp = cheerio.load(n);
//         return {
//           name: temp("._4rR01T").text(),
//           pageURL: temp("._1fQZEK").attr("href"),
//         };
//       })
//       .filter((n) => n.name && n.name != "");
//     results.length = 12;
//     await db.collection("Flip").insertMany(results);
//     res.send({
//       statusCode: 200,
//       results,
//     });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       statusCode: 400,
//     });
//   } finally {
//     client.close();
//   }
// });
// router.post("/snap", async (req, res) => {
//   client.connect();
//   try {
//     const fetchData = await axios.get(
//       `https://www.snapdeal.com/products/electronics-headphones?sort=plrty#bcrumbSearch:samsung%20android%20phone`
//     );
//     const db = await client.db(dbName);
//     const $ = cheerio.load(fetchData.data);
//     const productsArray = $(".product-desc-rating").toArray();
//     // console.log(productsArray);
//     let results = productsArray
//     .map((n) => {
//       let temp = cheerio.load(n);
//       return {
//         name: temp(".product-title").text(),
//         pageURL: temp(".dp-widget-link").attr("href"),
//       };
//     })
//     results.length = 12;
//     await db.collection("snap").insertMany(results);
//     res.send({
//       statusCode: 200,
//       link: results
//     });
//   } catch (error) {
//     console.log("error");
//     res.send({
//       statusCode: 400,
//     });
//   } finally {
//     client.close();
//   }
// });

// router.post("/postdata", async (req, res) => {
setInterval(async () => {
  await client.connect();
  try {
    const db = client.db(dbName);
    let Flip_urlData = await db.collection("Flip").find().limit(12).toArray();
    let Snap_urlData = await db.collection("snap").find().limit(12).toArray();
    let Result = [];
    for (let e of Flip_urlData) {
      let temp = await axios.get(`https://www.flipkart.com${e.pageURL}`);
      const $ = cheerio.load(temp.data);
      const Name_String = $('h1[class="yhB1nd"]').text();
      const Image_url = $(".CXW8mj img").attr("src");
      const Rating = $('div[class="_3LWZlK"]').text().slice(0, 3);
      const Final_Price = $('div[class="_30jeq3 _16Jk6d"]').text();
      const Price = $('div[class="_3I9_wc _2p6lqe"]').text();
      let final_Data = {
        Name_String,
        Image_url,
        Rating,
        Final_Price,
        Price,
      };
      Result.push(final_Data);
    }
    for (let e of Snap_urlData) {
      let temp = await axios.get(`${e.pageURL}`);
      const $ = cheerio.load(temp.data);
      const Name_String = $('h1[class="pdp-e-i-head"]').text().slice(7);
      const Image_url = $('img[class="cloudzoom"]').attr("src");
      const Rating = $('span[class="avrg-rating"]').text();
      const Final_Price = $('span[class="payBlkBig"]').text();
      const Price = $('div[class="pdpCutPrice "]').text().slice(16,24);
      let final_Data = {
        Name_String,
        Image_url,
        Rating,
        Final_Price,
        Price
      };
      Result.push(final_Data);
    }
    for (let e of Result) {
      await db.collection("scrapeddata").updateOne({Name_String:`${e.Name_String}`}, {$set:{Final_Price:`${e.Final_Price}`}});
    }    
    // await db.collection("scrapeddata").insertMany(Result);
    // res.send({
    //   statusCode: 200,
    //   Result
    // });
    console.log("data updated successfully");
  } catch (error) {
    console.log(error);
    // res.send({
    //   statusCode: 400,
    // });
  } finally {
    client.close();
  }  
} ,43200000);

router.get("/getdata", async (req, res) => {
  client.connect();  
  try {    
    const db = client.db(dbName);
    let results = await db.collection("scrapeddata").find().toArray();
    res.send({
      statusCode: 200,
      results
    });
  } catch (e) {
    res.send({
      statusCode: 400,
      message: "server error"
    });    
  }
  finally{
    client.close();
  }
})


module.exports = router;
