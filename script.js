document.addEventListener("DOMContentLoaded", function () {
const novaTarefaInput = document.getElementById("nova-tarefa");
const listaTarefas = document.getElementById("item-tarefas");
const TODOIST_API_KEY = 'ccb5c67eb4ba4b4257843f0c4c0335b3a33ad151';

  function todoistGET(url, callback) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error('Erro ao buscar dados do Todoist:', error));
  }

  function todoistPOST(url, data, callback) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => callback(data))
    .catch(error => console.error('Erro ao enviar dados para o Todoist:', error));
  }

  function todoistDELETE(url, callback) {
    fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    })
    .then(response => {
      if (response.ok) {
        callback(true);
      } else {
        throw new Error('Falha ao deletar tarefa');
      }
    })
    .catch(error => {
      console.error('Erro ao deletar tarefa do Todoist:', error);
      callback(false);
    });
  }

  document.getElementById('form-tarefas').addEventListener('submit', function(event) {
    event.preventDefault();
    adicionarTarefa(); 
  });

  function salvarTarefasLocalStorage() {
    const tarefas = [];
    listaTarefas.querySelectorAll("li").forEach(li => {
      const id = li.getAttribute("data-task-id");
      const texto = li.querySelector("span").textContent;
      const concluida = li.querySelector("input[type='checkbox']").checked;
      tarefas.push({ id, texto, concluida });
    });
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }

  function carregarTarefasLocalStorage() {
    const tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
    tarefas.forEach(tarefa => {
      adicionarTarefaDOM(tarefa.texto, tarefa.concluida, tarefa.id);
    });
  }

  function carregarTarefas() {
    todoistGET('https://api.todoist.com/rest/v2/tasks', (tarefas) => {
      listaTarefas.innerHTML = "";
      tarefas.forEach((tarefa) => {
        adicionarTarefaDOM(tarefa.content, false, tarefa.id);
      });
      salvarTarefasLocalStorage(); 
    });
  }

  function adicionarTarefaDOM(texto, concluida, id, data) {
    const li = document.createElement("li");
    li.setAttribute('data-task-id', id);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = concluida;
    checkbox.onchange = function () {
      atualizarTarefaConcluida(id, this.checked);
    };
      
    const span = document.createElement("span");
    span.textContent = texto;

    const partesData = data.split("-"); 
      
    const dataFormatada = new Date(partesData[0], partesData[1] - 1, partesData[2]).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const spanData = document.createElement("span");
    spanData.textContent = ` ${dataFormatada}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.onclick = function () {
      deletarTarefa(id);
    };

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(spanData);
    li.appendChild(removeBtn);
    listaTarefas.appendChild(li);
  }

  document.querySelector(".input-1 button").onclick = function () {
    const texto = novaTarefaInput.value.trim();
    const dataTarefa = document.getElementById("data-tarefa").value; 
    if (texto && dataTarefa) {
      todoistPOST('https://api.todoist.com/rest/v2/tasks', { content: texto }, (tarefa) => {
        adicionarTarefaDOM(texto, false, tarefa.id, dataTarefa);
        novaTarefaInput.value = "";
        salvarTarefasLocalStorage(); 
      });
    }
  };

  function atualizarTarefaConcluida(taskId, concluida) {
    const url = concluida ? 
    `https://api.todoist.com/rest/v2/tasks/${taskId}/close` :
    `https://api.todoist.com/rest/v2/tasks/${taskId}/reopen`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TODOIST_API_KEY}`
      }
    })
    .then(response => {
      if (response.ok) {
        console.log('Tarefa atualizada com sucesso.');
        carregarTarefas(); 
      } else {
        throw new Error('Falha ao atualizar tarefa');
      }
    })
    .catch(error => {
      console.error('Erro ao atualizar tarefa:', error);
    });
  }

  function deletarTarefa(taskId) {
    todoistDELETE(`https://api.todoist.com/rest/v2/tasks/${taskId}`, (success) => {
      if (success) {
        document.querySelector(`[data-task-id="${taskId}"]`).remove();
        salvarTarefasLocalStorage(); 
      }
    });
  }

  function salvarLembretes() {
    const lembrete = document.getElementById("lembrete").value;
    localStorage.setItem("lembretes", lembrete); 
  }

  document.getElementById("lembrete").addEventListener("input", salvarLembretes);

  function carregarLembretes() {
    const lembrete = localStorage.getItem("lembretes"); 
    if (lembrete) {
      document.getElementById("lembrete").value = lembrete; 
    }
    alert(lembrete);
  }

    carregarLembretes(); 
    carregarTarefasLocalStorage();
    carregarTarefas(); 
});
