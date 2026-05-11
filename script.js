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
  ],
  "fantasy": "Arena contra chefões de bug, com barra de vida, console de reparos e cartas HTML/CSS/JS.",
  "playerVerb": "causar dano no bug",
  "layout": "boss",
  "sceneLabels": [
    "Sintoma",
    "HTML",
    "CSS",
    "JS",
    "A11Y",
    "Mobile"
  ],
  "hud": {
    "status": "Chefão de bug apareceu",
    "primary": "Vida do bug",
    "secondary": "Correção proposta",
    "token": "Combo"
  },
  "mechanic": {
    "title": "Mecânica da rodada",
    "prompt": "A equipe causa dano quando descreve sintoma, causa provável e correção aplicável.",
    "reward": "Bug derrotado"
  },
  "teacherPrompt": "Trate cada resposta como ataque: observação correta, hipótese técnica e correção dão mais dano.",
  "rewardLabel": "Bugs derrotados",
  "exportBase": "registro-arena-debug",
  "csvBase": "placar-arena-debug"
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
  phaseRail: document.querySelector('#phaseRail'),
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
  renderPhaseRail();
  drawScene();
}

function renderPhaseRail() {
  els.phaseRail.innerHTML = PROJECT.missions.map((mission, index) => `
    <span class="${index === state.phaseIndex ? 'active' : ''}">
      ${PROJECT.hud.token} ${index + 1}: ${mission.title}
    </span>
  `).join('');
}

function renderTeams() {
  if (!state.teams.length) {
    els.scoreboard.innerHTML = '<p>Nenhuma equipe ainda. Adicione equipes fictícias ou carregue equipes exemplo.</p>';
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
      <p><strong>Fantasia:</strong> ${PROJECT.fantasy}</p>
      <p><strong>Papel da equipe:</strong> ${PROJECT.teacherPrompt}</p>
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
    '- Fantasia: ' + PROJECT.fantasy,
    '- Verbo de jogo: ' + PROJECT.playerVerb,
    '- Missão atual: ' + activeMission().title,
    '- Recompensa: ' + PROJECT.mechanic.reward,
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
  download(PROJECT.exportBase + '.md', lines.join('\n') + '\n', 'text/markdown');
}

function exportCsv() {
  const rows = ['equipe,pontuacao,ultima_missao', ...state.teams.map((team) => [team.name, team.score, team.notes].map(csvCell).join(','))];
  download(PROJECT.csvBase + '.csv', rows.join('\n') + '\n', 'text/csv');
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
  gradient.addColorStop(0, PROJECT.visual === 'detective' ? '#3b2618' : PROJECT.visual === 'court' ? '#2f1f1a' : '#101827');
  gradient.addColorStop(1, PROJECT.visual === 'islands' ? '#164e63' : PROJECT.visual === 'debug' ? '#1e1b4b' : '#263145');
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

function roundedRect(x, y, width, height, radius = 14) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRounded(x, y, width, height, radius, fill, stroke = null) {
  roundedRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function labelText(text, x, y, size = 18, color = '#fff', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = '900 ' + size + 'px system-ui';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function drawControl() {
  fillRounded(72, 118, 816, 330, 24, 'rgba(15,118,110,0.16)', 'rgba(255,255,255,0.22)');
  fillRounded(118, 160, 360, 210, 18, 'rgba(255,255,255,0.92)', PROJECT.accent);
  labelText('MESA TÁTICA', 298, 190, 18, '#0f172a');
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(150, 230 + i * 24);
    ctx.lineTo(440, 230 + i * 24);
    ctx.stroke();
  }
  const nodes = [['Caso', 180, 278], ['Papéis', 285, 245], ['Ação', 390, 305]];
  nodes.forEach((node, index) => drawNode(node[1], node[2], node[0], index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent));
  fillRounded(540, 150, 270, 230, 18, 'rgba(17,24,39,0.82)', 'rgba(255,255,255,0.22)');
  labelText('RÁDIO DE EVENTOS', 675, 182, 18);
  ctx.strokeStyle = PROJECT.accent2;
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(590 + i * 32, 270, 14 + i * 2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  fillRounded(590, 320, 170, 42, 12, PROJECT.accent2);
  labelText(PROJECT.mechanic.reward, 675, 342, 15);
}

function drawPacket() {
  const labels = ['Origem', 'ARP', 'DNS', 'TCP', 'HTTP', 'Serviço'];
  const active = Math.min(labels.length - 1, state.phaseIndex + 1);
  ctx.strokeStyle = 'rgba(96,165,250,0.25)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(95, 284);
  labels.forEach((label, index) => {
    const x = 95 + index * 155;
    const y = 284 + Math.sin(index * 1.15) * 55;
    ctx.lineTo(x, y);
  });
  ctx.stroke();
  labels.forEach((label, index) => {
    const x = 95 + index * 155;
    const y = 284 + Math.sin(index * 1.15) * 55;
    if (index > 0) {
      ctx.strokeStyle = index <= active ? '#60a5fa' : 'rgba(148,163,184,0.55)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(95 + (index - 1) * 155, 284 + Math.sin((index - 1) * 1.15) * 55);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    drawNode(x, y, label, index === active ? PROJECT.accent2 : PROJECT.accent);
  });
  const px = 95 + active * 155;
  const py = 284 + Math.sin(active * 1.15) * 55;
  fillRounded(px - 30, py - 88, 60, 38, 10, '#f59e0b');
  labelText('PKT', px, py - 68, 15, '#111827');
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(px, py, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawIslands() {
  for (let y = 120; y < 500; y += 34) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 48) ctx.quadraticCurveTo(x + 24, y + 16, x + 48, y);
    ctx.strokeStyle = 'rgba(186,230,253,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  const islands = [[155, 285, 'Base'], [360, 160, 'VLAN A'], [560, 340, 'CIDR'], [760, 210, 'Rota']];
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  islands.forEach((island, index) => {
    if (index === 0) ctx.moveTo(island[0], island[1]);
    else ctx.lineTo(island[0], island[1]);
  });
  ctx.stroke();
  islands.forEach((island, index) => {
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent;
    ctx.beginPath();
    ctx.ellipse(island[0], island[1], 92, 58, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dcfce7';
    ctx.beginPath();
    ctx.ellipse(island[0] - 18, island[1] - 12, 38, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(island[0] + 34, island[1] - 55, 5, 48);
    ctx.fillStyle = index === state.phaseIndex ? '#f97316' : '#eab308';
    ctx.beginPath();
    ctx.moveTo(island[0] + 39, island[1] - 55);
    ctx.lineTo(island[0] + 76, island[1] - 45);
    ctx.lineTo(island[0] + 39, island[1] - 33);
    ctx.fill();
    labelText(island[2], island[0], island[1] + 10, 20);
  });
}

function drawDetective() {
  fillRounded(70, 95, 820, 360, 18, '#7c4a2d', '#f8d6a2');
  ctx.strokeStyle = 'rgba(254,243,199,0.75)';
  ctx.lineWidth = 3;
  const pins = [[170, 170], [340, 250], [515, 155], [690, 285], [790, 170]];
  for (let i = 0; i < pins.length - 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(pins[i][0], pins[i][1]);
    ctx.lineTo(pins[i + 1][0], pins[i + 1][1]);
    ctx.stroke();
  }
  const clues = ['CSV', 'JSON', 'Nulos', 'Duplicados', 'Laudo'];
  clues.forEach((clue, index) => {
    const [x, y] = pins[index];
    fillRounded(x - 62, y - 42, 124, 84, 10, index === state.phaseIndex ? '#fef3c7' : '#fff7ed', PROJECT.accent);
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent;
    ctx.beginPath();
    ctx.arc(x - 42, y - 26, 8, 0, Math.PI * 2);
    ctx.fill();
    labelText(clue, x, y + 4, 18, '#111827');
  });
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(748, 374, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(780, 406);
  ctx.lineTo(828, 454);
  ctx.stroke();
}

function drawCourt() {
  fillRounded(95, 310, 770, 95, 18, '#7c2d12', '#fed7aa');
  fillRounded(330, 105, 300, 115, 18, '#92400e', '#fed7aa');
  labelText('BANCADA DO JUIZ', 480, 150, 20);
  drawNode(480, 240, 'Juiz', PROJECT.accent2);
  [['Fatos', 185, 300], ['Política', 360, 340], ['LGPD', 600, 340], ['Veredito', 775, 300]].forEach((node, index) => {
    drawNode(node[1], node[2], node[0], index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent);
  });
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(480, 270);
  ctx.lineTo(385, 330);
  ctx.moveTo(480, 270);
  ctx.lineTo(575, 330);
  ctx.stroke();
  labelText('EVIDÊNCIAS  |  ARGUMENTOS  |  PREVENÇÃO', 480, 435, 18);
}

function drawDebug() {
  fillRounded(90, 105, 330, 330, 24, 'rgba(79,70,229,0.22)', '#a5b4fc');
  labelText('CHEFÃO BUG', 255, 150, 24);
  ctx.fillStyle = PROJECT.accent2;
  ctx.beginPath();
  ctx.ellipse(255, 285, 96, 115, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(225, 250, 12, 0, Math.PI * 2);
  ctx.arc(285, 250, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(255, 300, 42, 0.15, Math.PI - 0.15);
  ctx.stroke();
  fillRounded(500, 120, 330, 58, 16, '#111827', '#a5b4fc');
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(525, 141, Math.max(40, 250 - state.phaseIndex * 70), 18);
  labelText('VIDA DO BUG', 665, 150, 15);
  const bugs = ['Sintoma', 'HTML', 'CSS', 'JS', 'Mobile'];
  bugs.forEach((bug, index) => {
    const x = 520 + (index % 2) * 170;
    const y = 230 + Math.floor(index / 2) * 86;
    fillRounded(x, y, 140, 58, 12, index === state.phaseIndex ? PROJECT.accent2 : '#eef2ff', PROJECT.accent);
    labelText(bug, x + 70, y + 29, 16, index === state.phaseIndex ? '#fff' : '#111827');
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
