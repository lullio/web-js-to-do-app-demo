let express = require('express');
// let mongodb = require('mongodb').MongoClient;
// destructuring - desconstruindo, em vez de usar código acima, vamos desconstruir pra usar somente os pacotes/objetos que queremos do mongodb, ñ queremos usar o próprio pacote mongodb, queremos oq tem dentro dele.
let {MongoClient, ObjectId} = require('mongodb'); // nome da variável é o próprio nome do pacote

let app = express();
let db

// usar a pasta PUBLIC do projeto, todos arquivos dentro acessíveis no root do servidor
app.use(express.static('PUBLIC'));

async function go(){
    // nova instancia
  let client = new MongoClient('mongodb+srv://admin:admin@cluster0.6arhq.mongodb.net/TodoApp?retryWrites=true&w=majority'); // no mongodb nuvem clicar em connect no seu cluster > connect to app > modificar a string adicionando sua senha e nome do banco de dados antes do ?
  await client.connect(); //conectar no bd
  // problema do código acima, temos que esperar ele ser concluído para as linhas abaixo serem executas, o programa para aqui. Ñ sabemos qnt tempo vai demorar. 
  // Solução é usar await mas await só funciona em ansync functions no JS
  db = client.db(); // torna nosso bd disponível
  // qdo nossa aplicação realmente for rodar e for referenciar o db vai estar apontando para o bd
  app.listen(5000, '0.0.0.0', function() {
      console.log('Listening to port:  ' + 5000);
      });
  }
go();

// dizer ao express para adicionar todos valores de formuláriose e posts no objeto body q vive no objeto request(req), por padrão o express ñ faz isso
app.use(express.urlencoded({extended:false}));
// dizer ao express para fazer mesma coisa de cima mas para asynchronous requests, vai adicionar os dados do AXIOS(asynchronous requests) no obj body
app.use(express.json());

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
          <form action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul class="list-group pb-5">
          ${items.map(function(item){
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${item.text}</span>
            <div>
              <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
              <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
          </li>`
          }).join('')}
        </ul>
        
      </div>
      <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
      <script type="text/javascript" src="/browser.js"></script>
    </body>
    </html>
  `);
  });

});

// qdo o brownser enviar um post request para esta url 
app.post('/create-item', function(req, res){

  // criar um documento no banco de dados MONGODB
  // o método collection vai selecionar uma coleção chamada items no banco de dados, insertOne serve pra criar um documento/objeto no bd
  db.collection('items').insertOne({text: req.body.item}, function(){
    res.redirect("/");
  })  
  // console.log(req.body.item); // pegar dado que está no input do formulário
});

app.post("/update-item", function(req, res){
  // receber os dados do axios no browser.js, basta usar req.body.nomeDoCampo
  // atualizar banco de dados, 1ºparm: qual documento queremos atualizar, 2ºparam: oq queremos atualizar nesse documento, 3º param: funcao apos alterar cm sucesso
  db.collection('items').findOneAndUpdate({_id: new ObjectId(req.body.id)},{$set: {text: req.body.text}},function(){
    res.send("success");
  });
});

app.post("/delete-item", function(req, res){
  db.collection('items').deleteOne({_id: new ObjectId(req.body.id)}, function(){
    res.send("sucess");
  })
})