# Hero mastery and tactical runs

This release includes CLOSE-COMBAT.md and CONTENT-AUTHORING.md plus:

- Two early available defense positions, each upgraded to rank 3 through earned run choices. Turret: 16 damage/rank every 1.4 seconds. Frost pillar: 6 damage/rank every 1.8 seconds, 35% slow for two seconds. Models track targets and react to firing; Canvas has corresponding markers.
- Gunner + frost unlockable SHATTER adds 30% projectile damage only against slowed targets. Existing fire + electric combination remains. Early choices guarantee a defense offer and first recruitment remains available. Later choices prioritize available combinations/gadgets.
- Permanent hero records by stable content ID. Every present hero receives team kill XP as participation score. Combat time advances only during active simulation with living enemies. Settlement gives score plus floor(seconds/8), capped by score; no score means no idle XP. Settlement is idempotent per run. Records persist on the existing device-local save, not an account.
- Training contributes 30 mastery XP per personal training rank, including migrated legacy training. Level thresholds begin at 80 and rise by 40; max level 20. Each gained level adds 3% starting damage. Level 2 unlocks that archetype's gadget as an earned run choice; level 4 permits three gadget ranks per run. Gadgets reset each run, unlocks persist.
- Hero collection grid, individual identity with equipment, progress, cumulative combat minutes and score, explicit gadget gates, and permanent training. Results show each participating hero's earned XP and level gains.
- Touch/keyboard/button rotatable 3D identity models reuse the battle renderer/context with a separate lit scene. Unsupported WebGL retains an explicit portrait fallback. No photo-generated model is promised; content adapters are documented.

Verification: all six Node suites pass. verify-mastery covers migration, ownership isolation, genuine combat bonuses, pause safety, no idle XP, exact-once settlement, gadget gating, stations and actual Three.js scene/turntable matrices. No GPU rendering, touch-device or mobile performance validation is claimed. Earlier cloud-browser work established a WebGL-unavailable environment; this release needs real-device visual feedback.

Still backlog, not shipped by this release: actual additional world campaigns/ice/alien scenery, cross-device accounts, automatic photo-to-3D conversion, advanced endless progression and telemetry-based difficulty tuning. Current registry supports authored new map visuals/enemy pools without adding public worlds automatically.
