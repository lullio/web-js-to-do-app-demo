// observar quando o botão Edit de classe edit-me for clicado
document.addEventListener("click", function(e){
   if(e.target.classList.contains("edit-me")){ // e de event tem tds infos do evento click
      let userInput = prompt("novo texto: ");
      // podemos dizer para o navegador enviar uma REQUISIÇÃO/REQUEST PARA NOSSO SERVIDOR(NODE) SEM ENVIAR UM FORMULÁRIO OU VISITAR UMA NOVA URL(envia um requisição pro servidor voando/behind the scenes). FAZER ISSO COM 1º FETCH(recurso do navegador) ou 2º AXIOS

      // enviar dados para o nosso NODE SERVER/POST REQUEST para o node usando AXIOS(https://github.com/axios/axios)
      // axios.post retorna uma promessa(bom qdo n sabemos qto tempo uma ação vai levar)
      // axios.post(1º: url, 2º:js object/dado pra enviar).then(função pra rodar apos o dado ter sido enviado com sucesso).catch(funcao caso de erro)
      axios.post('/update-item', {text: userInput}).then(function(){
         // do something
      }).catch(function(){
         console.log("error");
      })
   }
});