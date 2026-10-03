# M4 audio

`dist/audio.js` exports `Soundscape`; `audio-cues.js` contains local layered synthesis recipes. No sampled assets, runtime dependency or shared gameplay randomness is used. The melodic soundtrack is a temporary procedural fantasy phrase, **not final authored music**. Device listening and final mix approval remain human QA.

Integration:

- `unlock()` on user interaction creates one context, six SFX sub-buses, four spatial ambience sources and one looping score source. Repeated calls preserve the context.
- `getSettings()` returns a copy of `{master,music,sfx}`; `setGain(bus, value)` clamps to 0–1 and persists under `emberhold-audio-gains`. Defaults are 0.55 / 0.38 / 0.8. `toggle()` preserves existing `emberhold-sound` on/off storage.
- `update({state,boss,intensity,rain,paused})` accepts partial updates. `playing` raises the music/ambience bed; calm, lobby, intermission and terminal/menu states use restrained music. Boss mode smoothly changes level and loop tempo. Intensity/rain adjust fire and rain ambience. Identical targets do not generate new automation each frame.
- `active(boolean)` remains compatible: true means playing, false means lobby/calm.
- `play(kind,pan)` preserves all old cues. Additional identities include `nature`, `impact-nature`, `break-nature` and reserved `boss`. Resolve nature from the actual actor/archetype in the integration layer. Pan is clamped to ±0.75.
- `dispose()` stops/disconnects all sources and nodes, removes the visibility listener and closes the context exactly once. Disposal is terminal.

There are at most 28 transient voice sources. Ordinary cues can use 22, leaving six reserved for priority cues (boss, ready, win/lose, level, recruit, shield, boom). At the hard ceiling, a priority layer may replace an ordinary voice; it cannot evict another priority voice. Natural endings and forced stops use the same idempotent cleanup. Four ambient loops and one musical loop are fixed persistent sources, outside the transient count.

Pausing or hiding the tab clears transient voices and suspends the audio context. Visibility restores the prior state. No JS timers, frame-based music scheduling or stale delayed cues survive pause. Upgrade/inspection menus can retain music by passing `paused:false`; explicit pause and tab visibility are suspension boundaries. Muting ramps the master to silence; controls stay independently persisted.

Verification: `node verify-audio.mjs` preserves the previous layering/pan/gating/engine-event checks. `node verify-m4-audio.mjs` checks persisted independent gains, state/ambience targets, redundant automation prevention, ordinary/reserved/hard voice caps, pause and visibility, terminal idempotent disposal and a throwing `Math.random` guard. Mock audio tests validate graph/lifecycle behavior, not speaker quality.

Briar attack cues are routed using the actual firing team member. Its impact/death events currently carry only the frost archetype, so they retain frost audio; the nature impact/break recipes are extension points, not claimed live routing. A future presentation-only event identity field can resolve this without guessing at simultaneous hits.

Async suspend/resume is serialized and reconciled against the latest desired state after each completion; a rapid pause/resume race has a dedicated regression.
