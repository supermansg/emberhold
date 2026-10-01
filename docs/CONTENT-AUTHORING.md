# Content authoring contract v1

Current extension points are authored JavaScript ES modules, not a public upload/admin tool. Never execute uploaded scripts or infer stats silently from an image. No claim of automatic photo-to-3D conversion.

## Hero identity

Register an entry in dist/content.js using registerHero. Stable id and archetype are separate: a custom hero can use a supported attack style without impersonating another hero id. Required: id, name, role, desc, weapon, special, color, symbol, damage, interval, range, archetype (gunner/fire/electric/frost), rig (0..3). Gunner also needs mag/reload. Optional local portrait (assets/*.webp/png/jpg), radius, burn, chain (1..6), slow (up to .9), specialCooldown, visual adapter id. Immutable validated definitions feed starter selection, recruitment, combat, identity panels and portraits. Keep ids stable and append definitions; legacy hero order is retained. Up to four recruited defenders remains a deliberate gameplay limit.

Example authored definition (illustration only, not registered in production):
```js
registerHero({id:'custom-guardian',name:'שומר חדש',role:'מגן המצודה',desc:'מתקפות ברק מדויקות.',weapon:'רובה סלילים',special:'ברק בין שלוש מטרות',archetype:'electric',rig:2,color:'#ad88ff',symbol:'ϟ',damage:24,interval:1,range:590,chain:3,portrait:'assets/custom-guardian.webp'});
```

No trainingKey by default: a new hero does not inherit another hero's personal purchases. Existing training keys remain for the original four. Adding a new permanent training track needs a versioned save migration and SHOP entry; registration alone does not create one. Combat cooldown/damage and supported ability parameters are configurable. A genuinely new attack mechanic needs engine behavior work and tests; metadata is not a new mechanic.

Photo workflow: agree identity, weapon, silhouette and specialty; create a portrait/reference sheet from the supplied image; prepare a compatible rig or authored actor adapter; package local assets; register definition; verify recruitment, attacks, readable silhouette, target picking and performance. A flat portrait is distinct from the animated combat model.

## Enemies and maps

registerEnemy accepts stable id, name, hp, speed, damage, color, rig and optional visual adapter. registerMap accepts stable id, name, renderer adapter id and four enemy ids for normal/runner/armored/boss slots. Engine uses the selected map's definitions. Default Game({map:'forest'}) preserves current balance. Existing wave scheduling, reward bands and enemy AI remain the compatibility contract; new behaviors/reward economies require explicit implementation. No new world selection/unlock is shipped in this release.

## Visual adapters

Use dist/content-renderers.js: registerHeroVisual, registerEnemyVisual, registerWorldVisual. Factories are trusted source functions, never uploaded strings. Actor factory returns Object3D with userData.body, torso, limbs; optional mastery/powerRig follow the current rig contract. Provide userData.dispose() for resources owned by a custom actor; reset/death calls it. Existing actor loop supplies movement, health, effects and attack animation. Load required assets before factory registration; asynchronous GLB loading is not yet implemented.

World factory receives scene and returns update(time,game,date,reducedMotion), reset(), dispose(). Registered maps select renderer by id. Forest implements this contract and releases its owned lights/materials/geometries/instance buffers when replaced. The shared fort/road/battle coordinates still belong to BattleView; a new biome adapter owns its scenery around this shared arena, rather than replacing the combat engine. Ensure terrain continuity and remove old resources when switching. Ice/alien scenery needs its own authored adapter and assets.

## QA

Run all package test commands. verify-content.mjs registers a fifth test hero, validates identity/archetype isolation, tests projectile damage, duplicate ability option ids, training isolation, starter eligibility, alternate enemy stats via a custom map, visual factory resolution and invalid content rejection. Test entries run only in a separate Node process and are not part of public content. Every authored custom asset must exist before shipping.

## Acquisition requirement
Only gunner/fire/electric/frost are free initial IDs. Every future hero ID is locked by default and must be acquired through collection cards. Set rarity rare/epic/legendary; defaults use 8/16/24 cards to unlock. Starter/recruit filters and Game.addHero enforce ownership. Definition registration alone no longer grants access. Tests must grant fixture ownership explicitly.
