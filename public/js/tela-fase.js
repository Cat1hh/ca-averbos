const fases = document.querySelectorAll(".fase");

// progresso salvo
let progresso = localStorage.getItem("fase") || 1;

fases.forEach(fase => {
  let numero = parseInt(fase.dataset.fase);

  if (numero <= progresso) {
    fase.classList.remove("locked");
    fase.textContent = numero;

    fase.addEventListener("click", () => {
      window.location.href = "/fases/fase" + numero + ".html";
    });
  }
});