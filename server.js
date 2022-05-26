let express = require('express');

let app = express();

// se receber uma requisição get para a página home
app.get("/", function(req, res){
   res.send(`
   <h1 class="header-1">WELCOME TO OUR APP</h1>
   `);
});

app.listen(3000);
