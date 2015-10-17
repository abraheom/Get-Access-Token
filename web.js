var express   = require('express')
  , graph     = require('fbgraph')
  , app       = express();
  app.listen(process.env.PORT || 8080);

// this should really be in a config file!
var conf = {
    client_id:      ''
  , client_secret:  ''
  , scope:          'publish_actions, read_mailbox'
  , redirect_uri:   'http://fb-getaccesstoken.herokuapp.com/auth/facebook'
};
app.get("/",function(req,res){
  res.redirect("/auth/facebook");
});
app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('Acceso denegado');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token
  graph.authorize({
      "client_id":      conf.client_id
    , "redirect_uri":   conf.redirect_uri
    , "client_secret":  conf.client_secret
    , "code":           req.query.code
  }, function (err, facebookRes) {
    graph.get("me", function(err, datosUser) {
      console.log("__________________________________");
      console.log(datosUser);
      console.log("AccessToken:"+graph.getAccessToken());
      console.log("__________________________________");
      //res.send(datosUser.email+"<br>"+graph.getAccessToken());
      saveAccessToken(graph.getAccessToken());
      var miUrl="http://google.com";
      res.send(graph.getAccessToken());
    });
  });
});

//Mongoose/////////////////////////////////////////////////////////////////////////////////
var mongoose = require('mongoose');
mongoose.connect('mongodb://<user>:<password>@<server>:<port>/<database>');
var getDatos = mongoose.model('accessTokens',{codigo:String,timestamp: Number});
function saveAccessToken(cod){
  var timestamp = Number(new Date());
  var insert = new getDatos({codigo:cod,timestamp:timestamp});
  insert.save()
}
