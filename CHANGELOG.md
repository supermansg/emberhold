# Changelog

## 2026-09-10 — Local import of Sites version 10
- Verified that version 10 is the newest saved version and its commit matches the supplied SHA and remote main.
- Imported all 48 tracked source files, including assets, tests and documentation; SHA-256 comparison passed for every file before local documentation additions.
- Preserved the existing root Git index and retained a pristine source checkout with history in .sites-source-import.
- All nine supplied test scripts passed. No build or publication performed.
- Added local project guidance and launch instructions.
- Added a custom ember icon and Windows launch shortcut. Locked dependencies installed; Vite starts successfully.
- npm reported one high-severity dependency advisory; versions were preserved for source fidelity.
