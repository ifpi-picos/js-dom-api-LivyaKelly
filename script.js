// Livya Kelly
// Criar botões interativos e usar API

document.addEventListener("DOMContentLoaded", function () {
  const novaTarefaInput = document.getElementById("nova-tarefa");
  const listaTarefas = document.getElementById("item-tarefas");
  const lembreteTextarea = document.getElementById("lembrete");

  // Carregar tarefas do Local Storage
  function carregarTarefas() {
    const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
    listaTarefas.innerHTML = "";
    tarefas.forEach((tarefa, index) => {
      adicionarTarefaDOM(tarefa.texto, tarefa.concluida, index);
    });
  }

  function salvarTarefas() {
    const tarefas = [];
    document.querySelectorAll("#item-tarefas li").forEach((li) => {
      tarefas.push({
        texto: li.querySelector("span").textContent,
        concluida: li.querySelector("input").checked,
      });
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }

  function adicionarTarefaDOM(texto, concluida = false, index) {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = concluida;
    checkbox.onchange = function () {
      salvarTarefas();
    };

    document.getElementById('nova-tarefa').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previne a ação padrão do Enter
            document.querySelector('.input-1 button').click(); 
        }
    });

    let selectedItem = null;

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedItem) {
            selectedItem.remove(); // Remove o item selecionado
            salvarTarefas(); // Salva o estado atual das tarefas no localStorage
            selectedItem = null; // Reseta o item selecionado
        }
    });

    const span = document.createElement("span");
    span.textContent = texto;
    if (concluida) {
      span.style.textDecoration = "line-through";
    }

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.onclick = function () {
      li.remove();
      salvarTarefas();
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(removeBtn);
    listaTarefas.appendChild(li);
  }

  document.querySelector(".input-1 button").onclick = function () {
    const texto = novaTarefaInput.value.trim();
    if (texto) {
      adicionarTarefaDOM(texto);
      novaTarefaInput.value = "";
      salvarTarefas();
    }
  };

  // Função para salvar lembretes 
  document.querySelector(".btn-lembrete").onclick = function () {
    localStorage.setItem("lembrete", lembreteTextarea.value);
  };

  // Carregar lembretes e tarefas ao carregar a página
  function carregarLembretes() {
    const lembrete = localStorage.getItem("lembrete");
    if (lembrete) {
      lembreteTextarea.value = lembrete;
      alert(lembrete);
    }
  }

  carregarTarefas();
  carregarLembretes();
});

// API do google

function authenticate() {
  return gapi.auth2
    .getAuthInstance()
    .signIn({ scope: "https://www.googleapis.com/auth/tasks" })
    .then(
      function () {
        console.log("Sign-in successful");
      },
      function (err) {
        console.error("Error signing in", err);
      }
    );
}

function loadClient() {
  gapi.client.setApiKey("b0c3RHVuc1FqcU9kT0ZSMg");
  return gapi.client
    .load("https://tasks.googleapis.com/$discovery/rest?version=v1")
    .then(
      function () {
        console.log("GAPI client loaded for API");
      },
      function (err) {
        console.error("Error loading GAPI client for API", err);
      }
    );
}

gapi.load("client:auth2", function () {
  gapi.auth2.init({ client_id: "YOUR_CLIENT_ID" });
});
