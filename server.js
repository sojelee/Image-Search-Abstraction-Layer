var express       = require('express');
var ejs           = require('ejs');
require('dotenv').config();
var imageSearch   = require('node-google-image-search');
var mongodb       = require('mongodb');
var urldb         = "mongodb://joselee:joselee@ds255787.mlab.com:55787/image-search-al";
var app           = express();


app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
  res.render('index')
});

app.get('/api/imagesearch/:searchkey*',(req,res)=>{

   const { searchkey } = req.params;
   const { offSet }    = req.query;
   const time          = new Date();

     mongodb.MongoClient.connect(urldb, (err, database) => {
         if(err) throw err;
         const mydb = database.db('image-search-al');
         const cln = mydb.collection('searchdocs');
         cln.insert({searText:searchkey,when:time},(err,docs)=>{
              if(err) throw err
              database.close();
         });
      });
	
    const results = imageSearch(searchkey, (results)=>{
       res.render('searchresults',{res:results});
     }, 0, offSet || 5);

});

app.get('/recentsearch',(req,res)=>{
    
          mongodb.MongoClient.connect(urldb, (err, database) => {
          if(err) throw err;
          const mydb1 = database.db('image-search-al');
          const cln1 = mydb1.collection('searchdocs');
                  cln1.find({}).sort( { when: -1 } ).toArray((err,docs)=>{
                      if(err) throw err;
                     res.render('recentsearch',{res:docs});
                     database.close();
          });
       }); 
})


var listener = app.listen((process.env.PORT || 8989), () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
