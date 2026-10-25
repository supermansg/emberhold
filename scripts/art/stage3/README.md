# Brass Stage 3 authored skeletal successor

Generate with `node scripts/art/stage3/brass-rig.mjs`; verify with `node verify-stage3-animation.mjs`.

Source: existing project-authored `dist/assets/models/brass.glb` (original retained byte-for-byte). No external art, paid generation, install or Blender export used. Initial environment discovery found no Blender PATH command, standard installation or executable under ArtCraft Launcher/Downloads. This is a reproducible Three.js offline authoring pipeline, not a claimed Blender production run.

The versioned successor retains copper hair/beard, goggles, paired barrels and armor. Adds dark teal shoulder cape, brass trim, chest pressure jewel and cartridge rack. Complete vertex attributes are indexed and geometry is consolidated into four PBR classes with per-vertex colors (metal, matte leather/skin, copper hair, lens enamel). No downloaded textures. 16,594 triangles, seven deform bones, four skin primitives, 1,018,512 bytes. Armor uses rigid single-bone skinning to retain plate shape; this is not a soft-body anatomical weight pass. No LOD exports yet.

Animation clips (seconds): idle 2.4, anticipation 0.10, release 0.08, recovery 0.18, reload 1.2, impact 0.32, death 0.85. Runtime samples release/recovery from simulation attackAnim, reload from cooldown ratio, anticipation from final cooldown. No clip event can cause gameplay damage. Impact/death are asset-preview/future states because current heroes have no health/death. Simulation-time sampling freezes at pause and follows speed changes. Reduced motion holds the idle rest phase. Idle and reload endpoints return to the rest pose.

Named bones: Body, Head, Weapon, LegL, ArmL, LegR, ArmR. Named sockets: Muzzle, HeadSocket, HandL, HandR. Existing renderer emits projectile/muzzle effects at the socket world position. Each actor receives its own skeleton and bone palette; immutable geometry/materials are shared. Instance disposal releases bone textures and mixer bindings; cache release refuses live instances.

Evidence: `qa-artifacts/stage3-brass/idle.png` and `release.png`, rendered in local Chrome WebGL with matching camera/light. The structural and lifecycle checks pass; owner creative approval and physical-device animation/performance acceptance remain separate.
