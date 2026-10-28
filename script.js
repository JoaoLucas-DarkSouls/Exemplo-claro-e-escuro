(function () {
  "use strict";
 
  /* Inicio, Dados*/
  const ME = {
    nome: "Joao Lucas Dias",
    cargo: "Cursando curso técnico COTEMIG",
    email: "joaolucas.dias131@gmail.com",
    github: "https://github.com/JoaoLucas-DarkSouls"
  };
 
  /* Habilidades, Conjuntos */
  const PROJECTS = [
    {
      titulo: "Calculadores Simples",
      descricao: "Sistema em Python com if e else.",
      tecnologia: "Python"
    },
    {
      titulo: "Sistema de Claro e Escuro",
      descricao: "Sistema em JavaScript basico de tema escuro e claro.",
      tecnologia: "JavaScript"
    },
    {
      titulo: "Portifólio",
      descricao: "Meu Portifólio",
      tecnologia: ""
    }
  ];
 
  // nivel = quantidade de blocos preenchidos na barra
  const SKILLS = [
    { nome: "C#",                      nivel: 7  },
    { nome: "Lógica de programação",   nivel: 12 },
    { nome: "HTML / CSS",              nivel: 14 },
    { nome: "Python",                  nivel: 13 }
  ];
 
  /* HTML */
  const renderProject = p => `
    <div class='proj raised'>
      <div class='g'></div>
      <div>
        <b>${p.titulo}</b><br>${p.descricao}<br><small>${p.tecnologia}</small>
      </div>
    </div>`;
 
  const renderSkill = s => `
    <p>${s.nome}</p>
    <div class='bar sunk'>${"<i></i>".repeat(s.nivel)}</div>`;
 
  /* Janelas */
  const WINS = [
    {
      id: "sobre",
      ico: "🖥️",
      nome: "Meu Computador",
      w: 380,
      html: `
        <h1>Olá, eu sou ${ME.nome}!</h1>
        <p><b>${ME.cargo}</b></p>
        <p>Bem-vindo(a) ao meu portfólio retrô. Aqui você encontra meus projetos, habilidades e formas de contato. Abra os ícones da área de trabalho para explorar.</p>
        <h2>Sobre mim</h2>
        <p>Apaixonado(a) por tecnologia, estudando programação com muita paciência e foco.</p>`
    },
    {
      id: "proj",
      ico: "📁",
      nome: "Meus Projetos",
      w: 460,
      html: `<h1>Meus Projetos</h1>${PROJECTS.map(renderProject).join("")}`
    },
    {
      id: "skills",
      ico: "⚙️",
      nome: "Habilidades",
      w: 340,
      html: `<h1>Habilidades</h1>${SKILLS.map(renderSkill).join("")}`
    },
    {
      id: "contato",
      ico: "✉️",
      nome: "Contato",
      w: 340,
      html: `
        <h1>Fale comigo</h1>
        <p><a href='mailto:${ME.email}'>${ME.email}</a></p>
        <p><a href='${ME.github}' target='_blank'>GitHub</a></p>
        <p style='margin-top:14px'>
          <button class='btn pbtn' onclick="alert('Brincadeirinha, use o email para comunicar comigo :D')">Enviar mensagem</button>
        </p>`
    },
    {
      id: "lixo",
      ico: "🗑️",
      nome: "Lixeira",
      w: 300,
      html: `
        <h1>Lixeira</h1>
        <p>Aqui tem nada, como eu não quero que seja minha vida no futuro</p>`
    }
  ];
 
  /* Config */
  const TASKBAR_HEIGHT = 34;
  const WIN_OFFSET_X = 110, WIN_STEP_X = 34;
  const WIN_OFFSET_Y = 30,  WIN_STEP_Y = 30;
  const CLOCK_INTERVAL = 15000;
  const BOOT_STEP_DELAY = 600;
  const BOOT_MESSAGES = [
    "Iniciando Portifólio 98...",
    "Carregando portfólio...",
    "Pronto!"
  ];
 
  /* DOM */
  const desk      = document.getElementById("desk");
  const tasks     = document.getElementById("tasks");
  const startBtn  = document.getElementById("start");
  const startMenu = document.getElementById("smenu");
  const startList = document.getElementById("sl");
  const clockEl   = document.getElementById("clock");
  const bootEl    = document.getElementById("boot");
  const bootText  = document.getElementById("bt");
 
  let zIndex = 10;
  const windows = {}; // id -> { win, taskBtn, maximized, saved, data }
  let dragState = null;
 
  /* Controle de janelas, aberturas e etc */
  function unfocusAll() {
    Object.values(windows).forEach(({ win, taskBtn }) => {
      win.classList.add("inactive");
      taskBtn.classList.remove("on");
    });
  }
 
  function focusWindow(id) {
    unfocusAll();
    const { win, taskBtn } = windows[id];
    win.classList.remove("inactive");
    win.style.zIndex = ++zIndex;
    taskBtn.classList.add("on");
  }
 
  function openWindow(id) {
    const { win, taskBtn } = windows[id];
    win.classList.add("open");
    taskBtn.style.display = "";
    focusWindow(id);
  }
 
  function minimizeWindow(id) {
    windows[id].win.classList.remove("open");
    unfocusAll();
  }
 
  function closeWindow(id) {
    const { win, taskBtn } = windows[id];
    win.classList.remove("open");
    taskBtn.style.display = "none";
  }
 
  function toggleMaximize(id) {
    const state = windows[id];
    const { win } = state;
    state.maximized = !state.maximized;
 
    if (state.maximized) {
      state.saved = [win.style.left, win.style.top, win.style.width];
      win.style.left = 0;
      win.style.top = 0;
      win.style.width = "100%";
      win.style.height = `calc(100% - ${TASKBAR_HEIGHT}px)`;
    } else {
      [win.style.left, win.style.top, win.style.width] = state.saved;
      win.style.height = "";
    }
  }
 
  /* Registrar as janelas, Salvar elas */
  const getPoint = e => (e.touches ? e.touches[0] : e);
 
  function startDrag(e, id) {
    if (e.target.tagName === "BUTTON" || windows[id].maximized) return;
    const p = getPoint(e);
    const win = windows[id].win;
    dragState = {
      win,
      startX: p.clientX,
      startY: p.clientY,
      originX: win.offsetLeft,
      originY: win.offsetTop
    };
  }
 
  function moveDrag(e) {
    if (!dragState) return;
    const p = getPoint(e);
    const { win, startX, startY, originX, originY } = dragState;
    win.style.left = originX + p.clientX - startX + "px";
    win.style.top = Math.max(0, originY + p.clientY - startY) + "px";
  }
 
  const endDrag = () => { dragState = null; };
 
  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("touchmove", moveDrag, { passive: true });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
 
  /* Elementos */
  function createIcon(d) {
    const icon = document.createElement("div");
    icon.className = "icon";
    icon.innerHTML = `<div class='g'>${d.ico}</div><span>${d.nome}</span>`;
 
    // Clique seleciona; duplo clique (ou toque em ícone já selecionado) abre
    icon.onclick = () => {
      document.querySelectorAll(".icon").forEach(i => i.classList.remove("sel"));
      icon.classList.add("sel");
    };
    icon.ondblclick = () => openWindow(d.id);
    icon.ontouchend = () => {
      if (icon.classList.contains("sel")) openWindow(d.id);
    };
 
    desk.appendChild(icon);
  }
 
  function createWindow(d, i) {
    const win = document.createElement("div");
    win.className = "win raised";
    win.style.width = d.w + "px";
    win.style.left = WIN_OFFSET_X + i * WIN_STEP_X + "px";
    win.style.top = WIN_OFFSET_Y + i * WIN_STEP_Y + "px";
    win.innerHTML = `
      <div class='tb'>
        <span>${d.ico}</span>
        <span class='t'>${d.nome}</span>
        <button class='btn' data-a='min'>_</button>
        <button class='btn' data-a='max'>□</button>
        <button class='btn' data-a='x'>✕</button>
      </div>
      <div class='menu'>
        <span><u>A</u>rquivo</span>
        <span><u>E</u>xibir</span>
        <span>Aj<u>u</u>da</span>
      </div>
      <div class='body sunk'>${d.html}</div>
      <div class='status'><div>${d.nome}</div><div>Meu Portfólio</div></div>`;
    document.body.appendChild(win);
    return win;
  }
 
  function createTaskButton(d) {
    const btn = document.createElement("button");
    btn.className = "btn pbtn tk";
    btn.style.display = "none";
    btn.textContent = `${d.ico} ${d.nome}`;
    tasks.appendChild(btn);
    return btn;
  }
 
  function createStartMenuItem(d) {
    const li = document.createElement("li");
    li.innerHTML = `${d.ico} ${d.nome}`;
    li.onclick = () => {
      openWindow(d.id);
      startMenu.classList.remove("open");
    };
    startList.appendChild(li);
  }
 
  function setupWindowEvents(d, win, taskBtn) {
    const titleBar = win.querySelector(".tb");
 
    win.onmousedown = () => focusWindow(d.id);
 
    // Botões da barra de título (minimizar / maximizar / fechar)
    titleBar.addEventListener("click", e => {
      const action = e.target.dataset.a;
      if (action === "x")   closeWindow(d.id);
      if (action === "min") minimizeWindow(d.id);
      if (action === "max") toggleMaximize(d.id);
    });
 
    // Arrastar pela barra de título
    titleBar.addEventListener("mousedown", e => startDrag(e, d.id));
    titleBar.addEventListener("touchstart", e => startDrag(e, d.id), { passive: true });
 
    // Botão da barra de tarefas: alterna entre minimizar e abrir
    taskBtn.onclick = () => {
      const visible = win.classList.contains("open") && !win.classList.contains("inactive");
      visible ? minimizeWindow(d.id) : openWindow(d.id);
    };
  }
 
  function buildDesktop() {
    WINS.forEach((d, i) => {
      createIcon(d);
      const win = createWindow(d, i);
      const taskBtn = createTaskButton(d);
      windows[d.id] = { win, taskBtn, maximized: false, saved: null, data: d };
      setupWindowEvents(d, win, taskBtn);
      createStartMenuItem(d);
    });
  }
 
  /* Menu */
  function setupStartMenu() {
    startList.appendChild(document.createElement("hr"));
 
    const shutdown = document.createElement("li");
    shutdown.innerHTML = "⏻ Desligar...";
    shutdown.onclick = () => {
      startMenu.classList.remove("open");
      alert("Não vá, fique :D");
    };
    startList.appendChild(shutdown);
 
    startBtn.onclick = e => {
      e.stopPropagation();
      startMenu.classList.toggle("open");
    };
 
    // Clicar fora fecha o menu
    document.addEventListener("mousedown", e => {
      if (!startMenu.contains(e.target) && e.target.id !== "start") {
        startMenu.classList.remove("open");
      }
    });
  }
 
  /* Relogio, tempo real*/
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${hh}:${mm}`;
  }
 
  function startClock() {
    updateClock();
    setInterval(updateClock, CLOCK_INTERVAL);
  }
 
  /* boot */
  function runBootScreen() {
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step < BOOT_MESSAGES.length) {
        bootText.innerHTML += "<br>" + BOOT_MESSAGES[step];
        return;
      }
      clearInterval(timer);
      bootEl.style.opacity = 0;
      setTimeout(() => {
        bootEl.remove();
        openWindow("sobre");
      }, BOOT_STEP_DELAY);
    }, BOOT_STEP_DELAY);
  }
 
  /* Inicializaçao*/
  buildDesktop();
  setupStartMenu();
  startClock();
  runBootScreen();
})();
