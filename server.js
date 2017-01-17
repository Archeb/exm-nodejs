var exp=require("express");
var sug = require('superagent');
var chr = require('cheerio');
var querystring = require('querystring'); 
var app=exp();
var server_port = process.env.PORT || 8080
//init server 
app.listen(server_port);

//Routes
app.get('/api/eh_list.php*',eh_list);
app.get('/api/eh_gallery.php*',eh_gallery);
app.get('/api/eh_single.php*',eh_single);
app.get('*',not_found);
app.disable('etag');


//Functions
function eh_list(req,res){
  /* TODO：从Redis获取上一次抓取时间
           如果小于5分钟则直接获取Redis中的   */
  sug.get('http://lofi.e-hentai.org/?'+querystring.stringify(req.query)).end(function(err,sres){
    var $=chr.load(sres.text);
    var list=new Array();
    var i=0;
    $(".it").each(function(){
      var item={};
      item.title=$(this).find(".b").text();
      item.category=$(this).find(":contains('Category')").next("td").text();
      item.tags=$(this).find(":contains('Tags')").next("td").text();
      item.img=$(this).parent().prev(".ii").children("a").children("img").attr("src");
      befurl=$(this).find(".b").attr("href");
      item.url=befurl.substring(befurl.indexOf("lofi.e-hentai.org")+17);
      list[i]=item;
      i++;
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.header("X-Powered-By", "PHP/7.0.12");
    res.header("Server", "nginx/1.11.6");
    var info={"status":"success",
              "result":list}
    res.send(info);
  });
}

function eh_gallery(req,res){
  sug
  .get('http://g.e-hentai.org/'+req.query['url'])
  .set('Cookie','event=1483621486; ipb_member_id=2813113; ipb_pass_hash=ace8120a6440ed2674559da715828c6d; ipb_session_id=39d149e869a0bd2a9075b5f552dad79e; s=6c6175953; uconfig=uh_n-ts_l; lv=1483328309-1483621437')
  .set("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2914.3 Safari/537.36")
  .end(function(err,sres){
    var $=chr.load(sres.text);
    var list={"title":"",
              "tags":"",
              "category":"",
              "imgs":{
              },
              "urls":{
              },
              "pagecount":""
            };
    var i=0;
    list["title"]=$("#gn").text();
    beftag=$("[name='description']").attr("content");
    list["tags"]=beftag.substring(beftag.indexOf("Tags:")+6);
    list["category"]=$("#gdc").children("a").children("img").attr("alt");

    $(".gdtl").each(function(){
      list["imgs"][i]=$(this).children("a").children("img").attr("src");
      befurl=$(this).children("a").attr("href");
      list["urls"][i]=befurl.substring(befurl.indexOf("e-hentai.org")+12);
      i++;
    });
    list["pagecount"]=$(".ptt").children().children("td").last().prev().children("a").text();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("X-Powered-By", "PHP/7.0.12");
    res.header("Server", "nginx/1.11.6");
    var info={"status":"success",
              "result":list}
    res.send(info);
  });
}

function eh_single(req,res){
  sug
  .get('https://exhentai.org/'+req.query['url'])
  .set('Cookie','ipb_member_id=2813113; ipb_pass_hash=ace8120a6440ed2674559da715828c6d; igneous=9de71c7f1; s=6c6175953; uconfig=ts_l; lv=1484544324-1484616003')
  .set("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2914.3 Safari/537.36")
  .end(function(err,sres){
    var $=chr.load(sres.text);
    var prev,next;
    prev=$('#prev').attr('href')
    prev=prev.substring(prev.indexOf("hentai.org")+10);
    next=$('#next').attr('href');
    next=next.substring(next.indexOf("hentai.org")+10);
    bookurl=$('.sb').children('a').attr('href');
    bookurl=bookurl.substring(bookurl.indexOf("hentai.org")+10);
    var resultcont={"prev":prev,
                    "next":next,
                    "bookurl":bookurl,
                    "img": $('#img').attr('src'),
                    "pageinfo":$('#prev').first().next("div").text()
                };
    res.header("Access-Control-Allow-Origin", "*");
    res.header("X-Powered-By", "PHP/7.0.12");
    res.header("Server", "nginx/1.11.6");
    var info={"status":"success",
              "result":resultcont}
    res.send(info);
  });
}



function not_found(req,res){
  var info={"status":"failed",
            "err_info":
              {
                "code":404,
                "desc":"未找到请求的地址"
              }
            };
  res.header("X-Powered-By", "PHP/7.0.12");
  res.header("Server", "nginx/1.11.6");
  res.header("Access-Control-Allow-Origin", "*");
  res.send(info);
}
