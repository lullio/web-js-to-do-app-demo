// CREATE-ITEM
let input = document.getElementById("input");

// criar html, lista
// como vai saber oq eh ${item._id}? , o node precisa enviar um json lá no app.post(create-item)
function htmlItemTemplate(item){
   return  `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
   <span class="item-text">${item.text}</span>
   <div>
     <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
     <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
   </div>
 </li>`
}

document.getElementById("create-form").addEventListener("submit", function(e){
   e.preventDefault();
   // após enviar os dados(.post()), vai executar a função q tá no then() e nosso node está enviando dados como response/reposta para cá, axios torna fácil acessar esses dados basta colocar um parametro na func
   axios.post("/create-item", {text: input.value}).then( (response) => {
      document.getElementById("list-item").insertAdjacentHTML("beforeend", htmlItemTemplate(response.data)); // acessar o obj javascript q representa o novo doc adicionado no banco de dados, q o server.js ta mandando pra ca
   }).catch( (e) => {
      console.log(e);
   })

})


//DELETE-ITEM
document.addEventListener("click", function(e){
   if(e.target.classList.contains("delete-me")){ 
      // e.target = botao delete-me
      // window.confirm(janela de confirmação - se clicar no ok retorna true)
      if(confirm("Deseja realmente deletar?")){
         axios.post("/delete-item", {id: e.target.getAttribute()}).then( ()=> {
            e.target.parentElement.parentElement.remove();
         }).catch( (err) => {
            console.log(err);
         })
      }else{
         alert("cancelado com sucesso!");
      }
   }
})


// UPDATE-ITEM
// observar quando o botão Edit de classe edit-me for clicado
document.addEventListener("click", function(e){
   // e.target acessar o html que foi clicado
   if(e.target.classList.contains("edit-me")){ // e de event tem tds infos do evento click
      let userInput = prompt("novo texto: ", e.target.parentElement.parentElement.querySelector('.item-text').innerHTML); // 2º param: texto padrão do input, é o text q tá no span
      // podemos dizer para o navegador enviar uma REQUISIÇÃO/REQUEST PARA NOSSO SERVIDOR(NODE) SEM ENVIAR UM FORMULÁRIO OU VISITAR UMA NOVA URL(envia um requisição pro servidor voando/behind the scenes). FAZER ISSO COM 1º FETCH(recurso do navegador) ou 2º AXIOS


      if(userInput){ // resolver problema ao clicar no botão cancelar ainda envia dado(enquanto userInput for true, ou seja, tiver algum valor
         // enviar dados para o nosso NODE SERVER - POST REQUEST para o node usando AXIOS(https://github.com/axios/axios)
         // axios.post retorna uma promessa(bom qdo n sabemos qto tempo uma ação vai levar)
         // axios.post(1º: url, 2º:js object/dado pra enviar).then(função pra rodar apos o dado ter sido enviado com sucesso).catch(funcao caso de erro)
         // estamos enviando para o nosso server, o input do usuário e o id do botão editar que representa o id do dado no bd
         axios.post('/update-item', {text: userInput, id: e.target.getAttribute('data-id')}).then(function(){
            // aqui vai ser rodado quando a requisição post do axios for completada e sabemos q o node ñ envia uma resposta/response se a ação no banco de dados ñ for completada
            
            // e.target = pegar o elemento que acionou o evento(botão), ir dois pais acima(span) que tem a classe item-text, trocar o texto do element para userInput
            // https://developer.mozilla.org/pt-BR/docs/Web/API/Event/target
            e.target.parentElement.parentElement.querySelector('.item-text').innerHTML = userInput;

         }).catch(function(){
            console.log("error");
         })
      }
   }
});