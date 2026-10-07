import * as T from './vendor/three.module.js';
import {premiumActor,add,bake} from './premium-actors.js';
export function enemyVariant(type){
 const a=premiumActor(false),d=a.userData,equipment=new T.Group();
 if(type===1){d.body.scale.set(.8,1.05,.85);d.limbs[1].add(equipment);const blade=add(equipment,'cone','#b7bba2',0,-.43,.47,.08,.55,.045);blade.rotation.x=Math.PI/2;add(equipment,'round','#76573b',0,-.43,.22,.12,.12,.3);}
 else{d.body.scale.set(1.15,1,.98);d.limbs[1].add(equipment);add(equipment,'round','#535e59',-.13,-.3,.24,.57,.77,.16);add(equipment,'round','#829aaa',-.13,-.3,.335,.44,.63,.05);add(equipment,'sphere','#38474c',-.13,-.3,.39,.13,.13,.07);}
 bake(equipment,'m4-enemy-kit-'+type);d.visualClass=type===1?'runner':'armored';return a;
}
