// Run-local progression only; career XP/save structure are unchanged.
export const RUN_XP_CURVE=Object.freeze({base:18,linear:7,bend:2,exponent:1.65});
export function runXpRequirement(level,curve=RUN_XP_CURVE){
 if(!Number.isSafeInteger(level)||level<1)throw new RangeError('Run level must be a positive safe integer');
 const {base,linear,bend,exponent}=curve;
 if(![base,linear,bend,exponent].every(Number.isFinite)||base<1||linear<1||bend<0||exponent<1||exponent>3)throw new RangeError('Invalid XP curve');
 const n=level-1;return Math.min(Number.MAX_SAFE_INTEGER,Math.round(base+linear*n+bend*n**exponent));
}
