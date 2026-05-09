const PROJECT = {
  "code": "L-06",
  "slug": "web-boss-debug-arena",
  "title": "Web Boss Debug Arena",
  "tagline": "Defeat interface bugs with HTML, CSS and JavaScript reasoning.",
  "description": "Debug arena where teams fix visual, accessibility, form and responsive design challenges in playful rounds.",
  "discipline": "Web Technologies, Design, and Programming Logic",
  "disciplinePt": "Tecnologias Web, Design e Logica de Programacao",
  "visual": "debug",
  "accent": "#4f46e5",
  "accent2": "#16a34a",
  "topics": [
    "web-debugging",
    "html",
    "css"
  ],
  "competencies": [
    "debugging",
    "accessibility",
    "responsive design",
    "frontend reasoning"
  ],
  "missions": [
    {
      "id": "visual",
      "title": "Patch The Visual Bug",
      "duration": 6,
      "points": 10,
      "story": "A card looks broken on the projector because spacing and hierarchy collapsed.",
      "challenge": "Identify whether the likely bug is margin, display, or font sizing.",
      "hint": "Ask what changed: position, spacing, or text.",
      "deliverable": "Bug type and fix note."
    },
    {
      "id": "access",
      "title": "Unlock Accessibility",
      "duration": 8,
      "points": 15,
      "story": "A user cannot understand a control because the label is missing.",
      "challenge": "Choose the HTML improvement that makes the control clearer.",
      "hint": "Labels, alt text, contrast, and focus state all matter.",
      "deliverable": "Accessibility patch."
    },
    {
      "id": "responsive",
      "title": "Beat The Mobile Boss",
      "duration": 9,
      "points": 20,
      "story": "The layout overflows on a small screen before the final boss is defeated.",
      "challenge": "Propose a media-query or grid/flex fix.",
      "hint": "One-column mobile layouts often save the day.",
      "deliverable": "Responsive fix plan."
    }
  ]
};
const RUBRIC = [
  { label: 'Evidence quality', points: 10, description: 'Uses clues, calculations or technical terms to justify the answer.' },
  { label: 'Team collaboration', points: 5, description: 'Distributes roles and keeps the group focused.' },
  { label: 'Communication', points: 5, description: 'Presents the reasoning clearly and respectfully.' },
  { label: 'Improvement idea', points: 5, description: 'Suggests a next step after the mission.' },
];

const storageKey = 'playful-classroom:' + PROJECT.slug;
const demoNames = ['Equipe Delta', 'Equipe Nexus', 'Equipe Pixel'];
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

function resetTimerToMission() {
  remainingSeconds = activeMission().duration * 60;
  renderTimer('ready');
}

function renderTimer(label = 'running') {
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
  drawScene();
}

function renderTeams() {
  if (!state.teams.length) {
    els.scoreboard.innerHTML = '<p>No teams yet. Add fictional teams or load demo teams.</p>';
    return;
  }
  els.scoreboard.innerHTML = state.teams.map((team, index) => `
    <article class="team-row">
      <div>
        <strong>${team.name}</strong>
        <p>Evidence notes: ${team.notes || 'ready'}</p>
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
  els.rubricList.innerHTML = RUBRIC.map((item) => `
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
      <p><strong>Challenge:</strong> ${mission.challenge}</p>
      <p><strong>Deliverable:</strong> ${mission.deliverable}</p>
      <p><strong>Time:</strong> ${mission.duration} min | <strong>Points:</strong> ${mission.points}</p>
    </article>
  `).join('');
}

function renderAll() {
  renderMission();
  renderTeams();
  renderRubric();
  renderCards();
  renderTimer(timerId ? 'running' : 'ready');
}

function addTeam(name) {
  const clean = name.trim();
  if (!clean) return;
  state.teams.push({ name: clean, score: 0, notes: activeMission().title });
  state.log.push({ action: 'team-added', name: clean, phase: activeMission().title, at: new Date().toISOString() });
  saveState();
  renderTeams();
}

function changeScore(index, delta) {
  const team = state.teams[index];
  if (!team) return;
  team.score = Math.max(0, team.score + Number(delta));
  team.notes = activeMission().title;
  state.log.push({ action: 'score', team: team.name, delta: Number(delta), phase: activeMission().title, at: new Date().toISOString() });
  saveState();
  renderTeams();
}

function nextPhase(step) {
  state.phaseIndex = Math.min(PROJECT.missions.length - 1, Math.max(0, state.phaseIndex + step));
  state.log.push({ action: 'phase', phase: activeMission().title, at: new Date().toISOString() });
  saveState();
  resetTimerToMission();
  renderMission();
}

function startTimer() {
  if (timerId) return;
  renderTimer('running');
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    renderTimer(remainingSeconds <= 0 ? 'time' : 'running');
    if (remainingSeconds <= 0) {
      window.clearInterval(timerId);
      timerId = null;
      state.log.push({ action: 'timer-ended', phase: activeMission().title, at: new Date().toISOString() });
      saveState();
    }
  }, 1000);
}

function pauseTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  renderTimer('paused');
}

function resetTimer() {
  pauseTimer();
  resetTimerToMission();
}

function exportMarkdown() {
  const lines = [
    '# ' + PROJECT.title,
    '',
    'Mission: ' + activeMission().title,
    'Generated: ' + new Date().toISOString(),
    '',
    '## Teams',
    ...state.teams.map((team) => '- ' + team.name + ': ' + team.score + ' points'),
    '',
    '## Log',
    ...state.log.map((item) => '- ' + item.at + ' | ' + item.action + ' | ' + (item.team || item.name || item.phase || 'classroom')),
  ];
  download(PROJECT.slug + '-class-report.md', lines.join('\n') + '\n', 'text/markdown');
}

function exportCsv() {
  const rows = ['team,score,last_note', ...state.teams.map((team) => [team.name, team.score, team.notes].map(csvCell).join(','))];
  download(PROJECT.slug + '-scoreboard.csv', rows.join('\n') + '\n', 'text/csv');
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
  const nodes = [['Brief', 170, 210], ['Teams', 360, 130], ['Mission', 560, 230], ['Debrief', 770, 155], ['Report', 720, 370]];
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
  const islands = [[180, 250, 'Base'], [410, 150, 'VLAN'], [610, 310, 'CIDR'], [790, 190, 'Route']];
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
  const clues = ['CSV', 'JSON', 'Nulls', 'Dupes', 'Story'];
  clues.forEach((clue, index) => {
    const x = 140 + index * 170;
    const y = 180 + (index % 2) * 150;
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : '#f8fafc';
    ctx.fillRect(x - 56, y - 36, 112, 72);
    ctx.strokeStyle = PROJECT.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 56, y - 36, 112, 72);
    ctx.fillStyle = '#111827';
    ctx.font = '800 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(clue, x, y + 4);
  });
}

function drawCourt() {
  drawNode(480, 130, 'Judge', PROJECT.accent2);
  [['Evidence', 220, 320], ['Policy', 480, 350], ['Verdict', 740, 320]].forEach((node, index) => {
    drawNode(node[1], node[2], node[0], index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent);
  });
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  ctx.strokeRect(110, 70, 740, 390);
}

function drawDebug() {
  const bugs = ['HTML', 'CSS', 'JS', 'A11Y', 'Mobile'];
  bugs.forEach((bug, index) => {
    const x = 150 + index * 165;
    const y = 270;
    ctx.fillStyle = index === state.phaseIndex ? PROJECT.accent2 : PROJECT.accent;
    ctx.fillRect(x - 52, y - 52, 104, 104);
    ctx.fillStyle = '#fff';
    ctx.font = '900 19px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(bug, x, y + 6);
  });
}

function drawMissionProgress() {
  const mission = activeMission();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(28, 28, 360, 68);
  ctx.fillStyle = '#111827';
  ctx.font = '900 22px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(mission.title, 46, 58);
  ctx.font = '700 14px system-ui';
  ctx.fillText('Phase ' + (state.phaseIndex + 1) + '/' + PROJECT.missions.length + ' | +' + mission.points + ' points', 46, 82);
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
  state.log.push({ action: 'teams-cleared', at: new Date().toISOString() });
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
  event.currentTarget.textContent = active ? 'Normal mode' : 'Projector mode';
});
document.querySelector('#exportMarkdown').addEventListener('click', exportMarkdown);
document.querySelector('#exportCsv').addEventListener('click', exportCsv);
document.querySelector('#printCards').addEventListener('click', () => window.print());

resetTimerToMission();
renderAll();
