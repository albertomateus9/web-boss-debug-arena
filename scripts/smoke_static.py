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
    assert (ROOT / name).exists(), f"Missing {name}"

missions = json.loads((ROOT / "data" / "missions.json").read_text(encoding="utf-8"))
rubric = json.loads((ROOT / "data" / "rubric.json").read_text(encoding="utf-8"))
assert len(missions["missions"]) >= 3
assert len(rubric["rubric"]) >= 4

html = (ROOT / "index.html").read_text(encoding="utf-8")
script = (ROOT / "script.js").read_text(encoding="utf-8")
readme = (ROOT / "README.md").read_text(encoding="utf-8")
for token in ["gameCanvas", "teamName", "addTeam", "startTimer", "toggleProjector", "exportMarkdown", "missionCards"]:
    assert token in html, f"Missing UI token {token}"
for token in ["localStorage", "drawScene", "exportCsv", "changeScore", "nextPhase"]:
    assert token in script, f"Missing behavior token {token}"
for part in ["not an official", "synthetic", "localStorage"]:
    assert part in readme, f"Missing privacy note {part}"
for marker in ["fet" + "ch(", "XML" + "HttpRequest", "Web" + "Socket", "send" + "Beacon"]:
    assert marker not in script, f"Unexpected network marker {marker}"
print("static classroom game smoke ok")
