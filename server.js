var express = require('express');
var url     = require('url');
var ejs     = require('ejs');
var mongodb = require('mongodb');
var urldb   ="mongodb://joselee:joselee@ds251197.mlab.com:51197/url-short-api";
var app     = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
  res.render('index')
});

app.get('/decode/:query(*)',(req,res)=>{
    var qry = url.parse(req.params.query,true);
    var urlcode = qry.path.split('/')[1];
    mongodb.MongoClient.connect(urldb, function(err, database) {
    if(err) throw err;
    var mydb1 = database.db('url-short-api');
    var cln1 = mydb1.collection('urlmaps');
    cln1.find({code:urlcode}).toArray((err,docs)=>{
        if(err) throw err;
        docs.forEach(function (item){
        res.redirect(item.original);
    });
        database.close();
        
    });
 }); 

});

app.get('/new/:query(*)',(req,res)=>{
  var qry = url.parse(req.params.query,true);

  if(typeof(qry.host)==="string"){
    var dbrecordobject = generateMap(req.params.query);
   
  mongodb.MongoClient.connect(urldb, function(err, database) {
  if(err) throw err;
    var mydb = database.db('url-short-api');
    var cln = mydb.collection('urlmaps');
    cln.insert(dbrecordobject,(err,docs)=>{
        if(err) throw err
        res.render('results',{original:docs.ops[0].original,little:docs.ops[0].shortenedurl});
        database.close();
    });
 });
}else{
    res.render('invalid');
  }
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

var getRandom=() =>{
var a = Math.floor(Math.random() * 5) + 10;
var b = Math.floor(Math.random() * 5);
var c = Math.floor(Math.random() * 10)+ 15;
return a+''+b+''+c;

}

var generateMap=(givenurl)=>{
  var coded = getRandom();
  var shorturl="foo.com/"+coded;
  return {original:givenurl,code:coded,shortenedurl:shorturl};
}

