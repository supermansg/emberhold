// Presentation consumes existing option metadata. No rarity, stats, or upgrade effects invented.
export function upgradeIllustration(option){
 const icon=String(option.icon||'✦').replace(/[&<>"']/g,'');
 return `<span class="upgrade-art" aria-hidden="true"><svg viewBox="0 0 240 130" focusable="false"><path class="art-rays" d="M120 70L23 13M120 70L63 0M120 70L176 0M120 70L219 18M120 70L240 93M120 70L12 108"/><ellipse class="art-orbit" cx="120" cy="108" rx="79" ry="12"/><path class="art-shard" d="M35 78L46 55L50 87ZM185 92L199 58L204 85ZM73 104L78 88L83 107Z"/><path class="art-frame" d="M120 18L159 60L120 101L81 60Z"/><text x="120" y="77" text-anchor="middle">${icon}</text></svg></span>`;
}
