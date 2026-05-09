const PROJECT = {
  "code": "L-06",
  "slug": "web-boss-debug-arena",
  "title": "Arena Chefão Web: Depuração",
  "tagline": "Derrote falhas de interface usando raciocínio em HTML, CSS e JavaScript.",
  "description": "Arena de depuração em que equipes corrigem desafios visuais, acessibilidade, formulários e responsividade em rodadas lúdicas.",
  "discipline": "Tecnologias Web, Design e Lógica de Programação",
  "visual": "debug",
  "accent": "#4f46e5",
  "accent2": "#16a34a",
  "topics": [
    "web-debugging",
    "html",
    "css"
  ],
  "competencies": [
    "depuração",
    "acessibilidade",
    "design responsivo",
    "raciocínio de interface web"
  ],
  "guide": {
    "objective": "Transformar falhas comuns de interface web em desafios rápidos e cooperativos.",
    "prep": "Explique que cada rodada exige observar, formular hipótese e propor correção.",
    "conduct": "Peça que a equipe diga qual sintoma viu, qual causa suspeita e qual ajuste faria.",
    "closing": "Conecte as respostas a boas práticas de acessibilidade e responsividade."
  },
  "missions": [
    {
      "id": "visual",
      "title": "Corrigir o Bug Visual",
      "duration": 6,
      "points": 10,
      "story": "Um card aparece quebrado no projetor porque espaçamento e hierarquia visual desabaram.",
      "challenge": "Identificar se o bug provável é margem, display ou tamanho de fonte.",
      "hint": "Pergunte o que mudou: posição, espaçamento ou texto.",
      "deliverable": "Tipo de bug e nota de correção.",
      "criterion": "Pontue observação do sintoma e hipótese de correção."
    },
    {
      "id": "acessibilidade",
      "title": "Liberar a Acessibilidade",
      "duration": 8,
      "points": 15,
      "story": "Uma pessoa usuária não entende um controle porque o rótulo está ausente.",
      "challenge": "Escolher a melhoria em HTML que torna o controle mais claro.",
      "hint": "Rótulos, texto alternativo, contraste e foco importam.",
      "deliverable": "Correção de acessibilidade.",
      "criterion": "Pontue clareza, inclusão e justificativa técnica."
    },
    {
      "id": "responsivo",
      "title": "Vencer o Chefão do Celular",
      "duration": 9,
      "points": 20,
      "story": "O layout estoura em tela pequena antes do chefão final ser derrotado.",
      "challenge": "Propor correção com media query, grid ou flexbox.",
      "hint": "Layouts de uma coluna costumam salvar a versão mobile.",
      "deliverable": "Plano de correção responsiva.",
      "criterion": "Pontue solução aplicável e cuidado com leitura em celular."
    }
  ]
};
const RUBRICA = [
  {
    "label": "Qualidade da evidência",
    "points": 10,
    "description": "Usa pistas, cálculos ou termos técnicos para justificar a resposta."
  },
  {
    "label": "Colaboração da equipe",
    "points": 5,
    "description": "Distribui papéis e mantém o grupo focado na missão."
  },
  {
    "label": "Comunicação técnica",
    "points": 5,
    "description": "Apresenta o raciocínio com clareza, respeito e vocabulário adequado."
  },
  {
    "label": "Ideia de melhoria",
    "points": 5,
    "description": "Propõe um próximo passo realista depois da missão."
  }
];

const storageKey = 'aulas-ludicas:' + PROJECT.slug;
const demoNames = ['Equipe Açaí', 'Equipe Ver-o-Peso', 'Equipe Marajó'];
const state = loadState();
let timerId = null;
let remainingSeconds = PROJECT.missions[0].duration * 60;

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const els = {
  phaseTitle: document.querySelector('#phaseTitle'),
  phaseStory: document.querySelector('#phaseStory'),
  phaseChallenge: document.querySelector('#phaseChallenge'),
  phaseHint: document.querySelector('#phaseHint'),
  phaseDeliverable: document.querySelector('#phaseDeliverable'),
  phaseCriterion: document.querySelector('#phaseCriterion'),
  timerValue: document.querySelector('#timerValue'),
  timerLabel: document.querySelector('#timerLabel'),
  teamName: document.querySelector('#teamName'),
  scoreboard: document.querySelector('#scoreboard'),
  rubricList: document.querySelector('#rubricList'),
  missionCards: document.querySelector('#missionCards'),
};

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }
  return { teams: [], phaseIndex: 0, log: [] };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function activeMission() {
  return PROJECT.missions[state.phaseIndex];
}

function formatTime(seconds) {
  const value = Math.max(0, seconds);
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const secs = String(value % 60).padStart(2, '0');
  return minutes + ':' + secs;
}

function formatDate(value = new Date()) {
  return value.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function resetTimerToMission() {
  remainingSeconds = activeMission().duration * 60;
  renderTimer('pronto');
}

function renderTimer(label = 'em andamento') {
  els.timerValue.textContent = formatTime(remainingSeconds);
  els.timerLabel.textContent = label;
}

function renderMission() {
  const mission = activeMission();
  els.phaseTitle.textContent = mission.title;
  els.phaseStory.textContent = mission.story;
  els.phaseChallenge.textContent = mission.challenge;
  els.phaseHint.textContent = mission.hint;
  els.phaseDeliverable.textContent = mission.deliverable;
  els.phaseCriterion.textContent = mission.criterion;
  drawScene();
}

function renderTeams() {
  if (!state.teams.length) {
    els.scoreboard.innerHTML = '<p>Nenhuma equipe ainda. Adicione equipes fictícias ou carregue equipes demo.</p>';
    return;
  }
  els.scoreboard.innerHTML = state.teams.map((team, index) => `
    <article class="team-row">
      <div>
        <strong>${team.name}</strong>
        <p>Registro: ${team.notes || 'pronto'}</p>
      </div>
      <div>
        <div class="team-score">${team.score}</div>
        <div class="score-actions">
          <button type="button" data-score="${index}" data-delta="5">+5</button>
          <button type="button" data-score="${index}" data-delta="10">+10</button>
          <button type="button" data-score="${index}" data-delta="-5">-5</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderRubric() {
  els.rubricList.innerHTML = RUBRICA.map((item) => `
    <article class="rubric-item">
      <strong>${item.label} (+${item.points})</strong>
      <p>${item.description}</p>
    </article>
  `).join('');
}

function renderCards() {
  els.missionCards.innerHTML = PROJECT.missions.map((mission, index) => `
    <article class="mission-print-card">
      <strong>${PROJECT.code}.${index + 1} - ${mission.title}</strong>
      <p>${mission.story}</p>
      <p><strong>Desafio:</strong> ${mission.challenge}</p>
      <p><strong>Pista do professor:</strong> ${mission.hint}</p>
      <p><strong>Evidência esperada:</strong> ${mission.deliverable}</p>
      <p><strong>Critério:</strong> ${mission.criterion}</p>
      <p><strong>Tempo:</strong> ${mission.duration} min | <strong>Pontos:</strong> ${mission.points}</p>
    </article>
  `).join('');
}

function renderAll() {
  renderMission();
  renderTeams();
  renderRubric();
  renderCards();
  renderTimer(timerId ? 'em andamento' : 'pronto');
}

function addTeam(name) {
  const clean = name.trim();
  if (!clean) return;
  state.teams.push({ name: clean, score: 0, notes: activeMission().title });
  state.log.push({ acao: 'equipe adicionada', nome: clean, fase: activeMission().title, quando: formatDate() });
  saveState();
  renderTeams();
}

function changeScore(index, delta) {
  const team = state.teams[index];
  if (!team) return;
  team.score = Math.max(0, team.score + Number(delta));
  team.notes = activeMission().title;
  state.log.push({ acao: 'pontuação', equipe: team.name, delta: Number(delta), fase: activeMission().title, quando: formatDate() });
  saveState();
  renderTeams();
}

function nextPhase(step) {
  state.phaseIndex = Math.min(PROJECT.missions.length - 1, Math.max(0, state.phaseIndex + step));
  state.log.push({ acao: 'fase', fase: activeMission().title, quando: formatDate() });
  saveState();
  resetTimerToMission();
  renderMission();
}

function startTimer() {
  if (timerId) return;
  renderTimer('em andamento');
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    renderTimer(remainingSeconds <= 0 ? 'tempo encerrado' : 'em andamento');
    if (remainingSeconds <= 0) {
      window.clearInterval(timerId);
      timerId = null;
      state.log.push({ acao: 'tempo encerrado', fase: activeMission().title, quando: formatDate() });
      saveState();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  renderTimer('pausado');
}

function resetTimer() {
  pauseTimer();
  resetTimerToMission();
}

function exportMarkdown() {
  const lines = [
    '# Relatório de aula - ' + PROJECT.title,
    '',
    '- Projeto: ' + PROJECT.title,
    '- Missão atual: ' + activeMission().title,
    '- Gerado em: ' + formatDate(),
    '- Política de dados: Sem login, sem servidor, sem APIs externas e com dados salvos apenas no localStorage do navegador.',
    '',
    '## Roteiro do professor',
    '- Objetivo: ' + PROJECT.guide.objective,
    '- Preparação: ' + PROJECT.guide.prep,
    '- Condução: ' + PROJECT.guide.conduct,
    '- Fechamento: ' + PROJECT.guide.closing,
    '',
    '## Equipes',
    ...(state.teams.length ? state.teams.map((team) => '- ' + team.name + ': ' + team.score + ' pontos') : ['- Nenhuma equipe registrada.']),
    '',
    '## Registro da aula',
    ...(state.log.length ? state.log.map((item) => '- ' + item.quando + ' | ' + item.acao + ' | ' + (item.equipe || item.nome || item.fase || 'turma')) : ['- Sem eventos registrados.']),
  ];
  download('relatorio-aula.md', lines.join('\n') + '\n', 'text/markdown');
}

function exportCsv() {
  const rows = ['equipe,pontuacao,ultima_missao', ...state.teams.map((team) => [team.name, team.score, team.notes].map(csvCell).join(','))];
  download('placar-equipes.csv', rows.join('\n') + '\n', 'text/csv');
}

function csvCell(value) {
  return '"' + String(value).replaceAll('"', '""') + '"';
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function drawScene() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#111827');
  gradient.addColorStop(1, '#263145');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let i = 0; i < 28; i += 1) {
    ctx.beginPath();
    ctx.arc((i * 97) % width, (i * 53) % height, 2 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }
  if (PROJECT.visual === 'packet') drawPacket();
  else if (PROJECT.visual === 'islands') drawIslands();
  else if (PROJECT.visual === 'detective') drawDetective();
  else if (PROJECT.visual === 'court') drawCourt();
  else if (PROJECT.visual === 'debug') drawDebug();
  else drawControl();
  drawMissionProgress();
}

function drawNode(x, y, label, fill = PROJECT.accent) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '700 18px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
}

function drawControl() {
  const nodes = [['Abertura', 170, 210], ['Equipes', 360, 130], ['Missão', 560, 230], ['Síntese', 770, 155], ['Relatório', 720, 370]];
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  nodes.forEach((node, index) => {
    if (index === 0) ctx.moveTo(node[1], node[2]);
    else ctx.lineTo(node[1], node[2]);
  });
  ctx.stroke();
  nodes.forEach((node, index) => drawNode(node[1], node[2], node[0], index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent));
}

function drawPacket() {
  const labels = ['ARP', 'DNS', 'TCP', 'HTTP', 'OK'];
  labels.forEach((label, index) => {
    const x = 120 + index * 180;
    const y = 260 + Math.sin(index) * 45;
    if (index > 0) {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - 180, 260 + Math.sin(index - 1) * 45);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    drawNode(x, y, label, index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent);
  });
}

function drawIslands() {
  const islands = [[180, 250, 'Base'], [410, 150, 'VLAN'], [610, 310, 'CIDR'], [790, 190, 'Rota']];
  islands.forEach((island, index) => {
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent;
    ctx.beginPath();
    ctx.ellipse(island[0], island[1], 85, 52, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '800 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(island[2], island[0], island[1] + 6);
  });
}

function drawDetective() {
  const clues = ['CSV', 'JSON', 'Nulos', 'Duplicados', 'Síntese'];
  clues.forEach((clue, index) => {
    const x = 140 + index * 170;
    const y = 180 + (index % 2) * 150;
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : '#f8fafc';
    ctx.fillRect(x - 64, y - 36, 128, 72);
    ctx.strokeStyle = PROJECT.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 64, y - 36, 128, 72);
    ctx.fillStyle = '#111827';
    ctx.font = '800 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(clue, x, y + 4);
  });
}

function drawCourt() {
  drawNode(480, 130, 'Juiz', PROJECT.accent2);
  [['Evidência', 220, 320], ['Política', 480, 350], ['Veredito', 740, 320]].forEach((node, index) => {
    drawNode(node[1], node[2], node[0], index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent);
  });
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  ctx.strokeRect(110, 70, 740, 390);
}

function drawDebug() {
  const bugs = ['HTML', 'CSS', 'JS', 'A11Y', 'Celular'];
  bugs.forEach((bug, index) => {
    const x = 150 + index * 165;
    const y = 270;
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent;
    ctx.fillRect(x - 56, y - 52, 112, 104);
    ctx.fillStyle = '#fff';
    ctx.font = '900 19px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(bug, x, y + 6);
  });
}

function drawMissionProgress() {
  const mission = activeMission();
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.fillRect(28, 28, 430, 72);
  ctx.fillStyle = '#111827';
  ctx.font = '900 22px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(mission.title, 46, 58);
  ctx.font = '700 14px system-ui';
  ctx.fillText('Fase ' + (state.phaseIndex + 1) + '/' + PROJECT.missions.length + ' | +' + mission.points + ' pontos', 46, 84);
}

document.querySelector('#addTeam').addEventListener('click', () => {
  addTeam(els.teamName.value);
  els.teamName.value = '';
});
els.teamName.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTeam(els.teamName.value);
    els.teamName.value = '';
  }
});
document.querySelector('#demoTeams').addEventListener('click', () => {
  if (!state.teams.length) demoNames.forEach(addTeam);
});
document.querySelector('#clearTeams').addEventListener('click', () => {
  state.teams = [];
  state.log.push({ acao: 'equipes removidas', quando: formatDate() });
  saveState();
  renderTeams();
});
document.querySelector('#scoreboard').addEventListener('click', (event) => {
  const button = event.target.closest('[data-score]');
  if (button) changeScore(Number(button.dataset.score), Number(button.dataset.delta));
});
document.querySelector('#prevPhase').addEventListener('click', () => nextPhase(-1));
document.querySelector('#nextPhase').addEventListener('click', () => nextPhase(1));
document.querySelector('#startTimer').addEventListener('click', startTimer);
document.querySelector('#pauseTimer').addEventListener('click', pauseTimer);
document.querySelector('#resetTimer').addEventListener('click', resetTimer);
document.querySelector('#toggleProjector').addEventListener('click', (event) => {
  const active = document.body.classList.toggle('projector');
  event.currentTarget.textContent = active ? 'Modo normal' : 'Modo projetor';
});
document.querySelector('#exportMarkdown').addEventListener('click', exportMarkdown);
document.querySelector('#exportCsv').addEventListener('click', exportCsv);
document.querySelector('#printCards').addEventListener('click', () => window.print());

resetTimerToMission();
renderAll();
