// Add authored render adapters here; asset loading must finish before registration.
// These factories are application code, never strings or user-uploaded scripts.
import {LivingWorld} from './environment.js';
const worldFactories=new Map([['forest',scene=>new LivingWorld(scene)]]);
const heroFactories=new Map(),enemyFactories=new Map();
function register(table,id,factory){if(!/^[a-z][a-z0-9-]*$/.test(id)||table.has(id)||typeof factory!=='function')throw new Error('Invalid or duplicate visual adapter: '+id);table.set(id,factory);}
export const registerWorldVisual=(id,factory)=>register(worldFactories,id,factory);
export const registerHeroVisual=(id,factory)=>register(heroFactories,id,factory);
export const registerEnemyVisual=(id,factory)=>register(enemyFactories,id,factory);
export function createWorldVisual(id,scene){const factory=worldFactories.get(id);if(!factory)throw new Error('Missing world visual adapter: '+id);const world=factory(scene);if(!world||!['update','reset','dispose'].every(k=>typeof world[k]==='function'))throw new Error('World adapter requires update, reset, dispose');return world;}
export function createActorVisual(kind,definition,fallback){const table=kind==='hero'?heroFactories:enemyFactories,factory=definition.visual?table.get(definition.visual):null;if(definition.visual&&!factory)throw new Error('Missing actor visual adapter: '+definition.visual);const actor=factory?factory(definition):fallback();if(!actor?.isObject3D||!actor.userData.body||!actor.userData.torso||!Array.isArray(actor.userData.limbs))throw new Error('Actor adapter requires body, torso and limbs');return actor;}
