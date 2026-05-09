import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
required = [
    "index.html",
    "styles.css",
    "script.js",
    "data/missions.json",
    "data/rubric.json",
    "README.md",
    "LICENSE",
]
for name in required:
    assert (ROOT / name).exists(), f"Arquivo obrigatório ausente: {name}"

missions = json.loads((ROOT / "data" / "missions.json").read_text(encoding="utf-8"))
rubric = json.loads((ROOT / "data" / "rubric.json").read_text(encoding="utf-8"))
assert len(missions["missions"]) >= 3
assert len(rubric["rubric"]) >= 4

html = (ROOT / "index.html").read_text(encoding="utf-8")
script = (ROOT / "script.js").read_text(encoding="utf-8")
readme = (ROOT / "README.md").read_text(encoding="utf-8")
for token in ["pt-BR", "gameCanvas", "teamName", "addTeam", "startTimer", "toggleProjector", "exportMarkdown", "missionCards"]:
    assert token in html, f"Token de interface ausente: {token}"
for token in ["localStorage", "drawScene", "exportCsv", "changeScore", "nextPhase"]:
    assert token in script, f"Comportamento ausente: {token}"
for part in ["Não é sistema oficial", "missões sintéticas", "localStorage"]:
    assert part in readme, f"Nota de privacidade ausente: {part}"
for marker in ["fet" + "ch(", "XML" + "HttpRequest", "Web" + "Socket", "send" + "Beacon"]:
    assert marker not in script, f"Chamada externa inesperada: {marker}"
print("smoke estático PT-BR ok")
