// curl -k https://localhost:8000/
var https = require('https');
var fs = require('fs');
var url = require('url');
var fetch = require('node-fetch');

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, function (request, response) {
  var client_id = '414363225802046';
  // 절대 노출하면 안됨
  var client_secret = '';
  var redirect_uri = 'https://localhost:8000/callback';
  if (request.url === '/') {
    var html = `
    <html>
      <body>
        <a href="https://www.facebook.com/v3.2/dialog/oauth?client_id=${client_id}&redirect_uri=${redirect_uri}&state=1234&response_type=code">Login with Facebook</a>
      </body>
    </html>
    `;
    response.writeHead(200);
    response.end(html);
  } else if(request.url.indexOf('callback') === 1){
    var parsed_url = url.parse(request.url, true);
    var code = parsed_url.query.code;
    var access_token_url = `https://graph.facebook.com/v3.2/oauth/access_token?client_id=${client_id}&redirect_uri=${redirect_uri}&client_secret=${client_secret}&code=${code}`
    fetch(access_token_url)
      .then(function(res){
        return res.json();
      })
      .then(function(body){
        var access_token = body.access_token;
        fetch(`https://graph.facebook.com/v3.2/me/?access_token=${access_token}`)
          .then(function(res){
            return res.json();
          })
          .then(function(body){
            console.log(body);
          });
      })
    response.writeHead(200);
    response.end('hi');
  }

}).listen(8000);