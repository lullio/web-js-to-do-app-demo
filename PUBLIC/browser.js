// observar quando o botão Edit de classe edit-me for clicado

document.addEventListener("click", function(e){
   if(e.target.classList.contains("edit-me")){
      let userInput = prompt("novo texto: ");
   }
});