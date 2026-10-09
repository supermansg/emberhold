// Illustrations describe actual option categories, never invented rarity or effects.
export function upgradeTheme(o){
 const id=o.id||'';
 if(id.startsWith('speed'))return 'tempo';
 if(id==='station-frost')return 'ice';
 if(id==='station-turret')return 'mechanical';
 if(id==='wall'||id==='house')return 'defense';
 if(id==='team'||id.startsWith('recruit'))return 'team';
 if(/briar/.test(id))return 'nature';
 if(/prism/.test(id))return 'crystal';
 if(/slow|shatter|frost|aurora/.test(id))return 'ice';
 if(/chain|electric/.test(id))return 'electric';
 if(/burn|fire|cinder|combo/.test(id))return 'fire';
 return 'mechanical';
}
const ART={
 fire:'<path d="M77 100C48 76 97 64 100 25C122 43 108 52 129 62C136 48 149 33 148 17C178 61 190 92 153 109Z"/><path class="art-light" d="M106 99Q91 78 122 60Q119 82 140 78Q156 104 124 112Z"/>',
 electric:'<path d="M133 12L90 68H118L99 118L158 52H130L156 12Z"/><path class="art-line" d="M105 68L68 54L51 78M145 69L181 85L199 53M103 96L76 110"/><circle cx="51" cy="78" r="7"/><circle cx="199" cy="53" r="7"/>',
 ice:'<path d="M91 106L79 52L104 16L125 50L114 105ZM126 109L131 62L159 36L169 78L149 113ZM63 104L50 75L64 61L81 102Z"/><path class="art-light" d="M104 22L103 98L84 54ZM157 44L145 104L137 65Z"/>',
 crystal:'<path d="M120 12L163 52L144 103L119 118L80 71L89 37Z"/><path class="art-light" d="M120 12L117 70L163 52L144 103L117 70L89 37Z"/><path class="art-line" d="M57 36L69 54M176 82L191 99M64 103L74 87"/>',
 nature:'<path d="M114 105C68 100 60 56 64 31C104 30 130 57 114 105ZM125 90C117 46 155 25 184 30C185 65 158 96 125 90Z"/><path class="art-line art-light" d="M119 117L119 83L164 45M118 94L79 49"/>',
 mechanical:'<path d="M54 74L146 24L169 33L181 59L94 110L62 101Z"/><path class="art-light" d="M62 77L147 31L159 36L80 88Z"/><path class="art-line" d="M94 110L89 86L169 40M36 79L54 69M40 111L60 99M166 13L174 2M191 39L214 36"/>',
 defense:'<path d="M75 24L120 12L166 24L164 78Q150 107 120 120Q89 103 76 78Z"/><path class="art-dark" d="M88 34L120 25L153 34L150 73Q140 93 120 104Q99 92 90 72Z"/><path d="M102 72V49H113V60H127V49H138V85H102Z"/>',
 tempo:'<path class="art-line" d="M162 35A46 46 0 1 0 168 87M151 17L169 37L142 42"/><path d="M116 38H126V69L148 81L142 92L116 75Z"/><path class="art-line" d="M43 49H64M38 69H61M46 91H66"/>',
 team:'<path d="M62 104L71 67L83 57L96 67L104 104ZM136 104L143 67L157 57L170 67L180 104ZM92 110L101 58L120 46L140 58L150 110Z"/><circle cx="83" cy="44" r="12"/><circle cx="157" cy="44" r="12"/><circle class="art-light" cx="120" cy="29" r="16"/>'
};
export function upgradeIllustration(option){
 const theme=upgradeTheme(option),icon=String(option.icon||'✦').replace(/[&<>"']/g,'');
 return `<span class="upgrade-art art-${theme}" aria-hidden="true"><svg viewBox="0 0 240 130" focusable="false"><path class="art-rays" d="M120 70L23 13M120 70L63 0M120 70L176 0M120 70L219 18M120 70L240 93M120 70L12 108"/><ellipse class="art-orbit" cx="120" cy="112" rx="79" ry="10"/><g class="art-subject">${ART[theme]}</g><text class="art-icon" x="215" y="120" text-anchor="middle">${icon}</text></svg></span>`;
}
