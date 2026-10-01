# Hero fidelity and tactical power release

Baseline: public Sites version 7, source 78becd26b31c651f70999a0a5ec8b01edbe70205. Existing public deployment authorization in the conversation applies to this requested upgrade. No service migration, authentication or player-save change.

Changes:
- Shared model-derived portraits, detailed readable hero identity cues, expressive enemy faces and armour, clothing/hair motion with reduced-motion support. Original reference artwork remains a fallback. See ASSET-PIPELINE.md for limits and storage decisions.
- 192 instanced border plants and 48 small flowers outside the combat lane. Plants follow simulated wind and stop swaying with reduced-motion preference.
- A manually activated power for the starting/leading hero, charged by kills: 8 for first use then 14. Charge caps, carries across waves and cannot be spent during pause/choices, with no enemies, or before enemies enter the field. Each hero has a distinct power. Existing auto combat remains intact if unused.
- Gunner: three double-damage projectile bursts across up to three visible targets with selected target first. Fire: double-damage projectile, double splash radius and burn. Electric: double damage to selected target plus up to four nearby enemies within 230 logical units. Frost: one base hit and 85% slow for five seconds on all visible enemies. Projectiles still apply damage on arrival. Powers use current run damage and team multiplier. No new currency and no fake critical numbers.

Verification: seven executable suites pass, covering prior progression/combat plus four manual powers, real damage, pause and charge gates, empty-field safety, detailed scene matrices, reduced motion and portrait capture state restoration. Actual CPU scene mesh counts: hero rigs 47/41/41/52, enemy rigs 19/20/22/22, excluding later scene effects/status bars. These are not FPS measurements. Automatic-combat baseline outcomes remain unchanged when powers are not used.

Known QA limits: no current browser/GPU pixel, touch-device or mobile performance verification. The retained cloud browser was previously WebGL-unavailable. Portrait capture is tested with a renderer contract fixture, not actual GPU pixel readback. Real-device visual review remains necessary. Additional ice/alien worlds remain a separate backlog item.
