// EXPRESS LIBRARY - FRAMEWORK USING TO CREATE WEB APPLICATIONS WITH NODE
let express = require('express');
let sanitizeHTML = require('sanitize-html');

// let mongodb = require('mongodb').MongoClient;
// destructuring - desconstruindo, em vez de usar código acima, vamos desconstruir pra usar somente os pacotes/objetos que queremos do mongodb, ñ queremos usar o próprio pacote mongodb, queremos oq tem dentro dele.
let {MongoClient, ObjectId} = require('mongodb'); // nome da variável é o próprio nome do pacote

let app = express();
let db

// usar a pasta PUBLIC do projeto, todos arquivos dentro acessíveis no root do servidor, script no html abaixo
app.use(express.static('PUBLIC'));

async function go(){
    // nova instancia
  let client = new MongoClient('mongodb+srv://admin:admin@cluster0.6arhq.mongodb.net/TodoApp?retryWrites=true&w=majority'); // no mongodb nuvem clicar em connect no seu cluster > connect to app > modificar a string adicionando sua senha e nome do banco de dados antes do ?
  await client.connect(); //conectar no bd
  // problema do código acima, temos que esperar ele ser concluído para as linhas abaixo serem executas, o programa para aqui. Ñ sabemos qnt tempo vai demorar. 
  // Solução é usar await mas await só funciona em ansync functions no JS
  db = client.db(); // torna nosso bd disponível
  // qdo nossa aplicação realmente for rodar e for referenciar o db vai estar apontando para o bd

  app.listen(process.env.PORT || 5000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });
    // '0.0.0.0', function() {
    //   console.log('Listening to port:  ' + port);
    // });
  }
go();


// dizer ao express para adicionar todos valores de formuláriose e posts no objeto body q vive no objeto request(req), por padrão o express ñ faz isso
app.use(express.urlencoded({extended:false}));
// dizer ao express para fazer mesma coisa de cima mas para asynchronous requests, vai adicionar os dados do AXIOS(asynchronous requests) no obj body
app.use(express.json());

app.use(passwordProtected); // express vai usar essa função como 1º função em tds requisições app.get("/", passwordProtected, function(req, res){

// adicionando segurança pedindo login
function passwordProtected(req, res, next){
  // 1º Pede pro browser inserir usuario/senha pra autenticar, 2º autent basica realm=nome do app'
  res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"');
  console.log(req.headers.authorization); // mostra usuário e senha digitados, um código
  if(req.headers.authorization == 'Basic amF2YXNjcmlwdDpmdWxsc3RhY2s='){ // acessar usuario/senha que digitaram
    next(); // dizer ao express pra chamar a próx função
  }else{
    res.status(401).send("Authentication required"); // 401 = unauthorizaed
  }
}

// express aceita múltiplas funções, em vez só de 2 argumentos("/url", function(req,res))

// se receber uma requisição get para a página home
app.get("/", function(req, res){
  // queremos primeiro ler os dados do bd e depois mostrar o conteúdo
  
  // find serve para encontrar todos documentos na coleção mas os dados vem em formato de sistema mongodb (só é útil para mongodb)
  // toArray vai converter para um array javascript super fácil de lidar
  db.collection('items').find().toArray(function(err, items){
    // toArray recebe uma funcao q é executada qdo a ação find for completada
    // 1º parm é para erros, 2ºpar é um array javascript de todos items do banco de dados
   // console.log(items);
  res.send(`
      <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App!!!</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App!!!</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="input" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="list-item" class="list-group pb-5">

        </ul>
        
      </div>

      <!--
      - o browser tem um objeto chamado JSON e método chamado stringify (converte dados javascript/json numa string de texto). Queremos enviar nosso array de objetos do banco de dados(items) db.collection('items').find().toArray(function(err, items)
      -->
      <script>
        let items = ${JSON.stringify(items)}    
      </script>

      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script type="text/javascript" src="/browser.js"></script>
    </body>
    </html>
  `);
  });

});

// qdo o brownser enviar um post request para esta url 
app.post('/create-item-browser', function(req, res){
  // criar um documento no banco de dados MONGODB
  // o método collection vai selecionar uma coleção chamada items no banco de dados, insertOne serve pra criar um documento/objeto no bd
  db.collection('items').insertOne({text: req.body.item}, function(){
    res.redirect("/");
  })  
  // console.log(req.body.item); // pegar dado que está no input do formulário
});

// REQUISIÇÃO ASSÍNCRONA PELO AXIOS, O DE CIMA É PELO BROWSER AO ENVIAR FORMULÁRIO(ruim pois precisa dar refresh na pág, demora mais)
app.post("/create-item", function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}});
  db.collection('items').insertOne({text: safeText}, (err, info) => {
    // javascript object notation - enviar um objeto javascript q representa o documento mongodb q foi criado no cód acima
    // precisou adicionar parametros err,info na funcao acima
    res.json({_id: info.insertedId, text: safeText}) // retornar um objeto javascript para o browser com os nomes  _id contendo o id que o mongodb acabou de criar para o item(insertedId) e text contendo o valor do input do browser
  })
})

app.post("/update-item", function(req, res){
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}});
  // receber os dados do axios no browser.js, basta usar req.body.nomeDoCampo
  // atualizar banco de dados, 1ºparm: qual documento queremos atualizar, 2ºparam: oq queremos atualizar nesse documento, 3º param: funcao apos alterar cm sucesso
  db.collection('items').findOneAndUpdate({_id: new ObjectId(req.body.id)},{$set: {text: safeText}},function(){
    res.send("success");
  });
});

app.post("/delete-item", function(req, res){
  db.collection('items').deleteOne({_id: new ObjectId(req.body.id)}, function(){
    res.send("sucess");
  })
})