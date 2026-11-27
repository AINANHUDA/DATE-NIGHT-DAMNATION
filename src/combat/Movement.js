/** MONKEY MIND III | MODULE
 * Walk/run speed, acceleration, gravity, jump and dash tuning (pixels and seconds).
 * Customization map: docs/CUSTOMIZATION.md
 */
export const MOTION = Object.freeze({walk:115,run:215,accel:720,brake:1080,runDelay:0.24,gravity:1450,jump:580,doubleJump:510,dash:490,dashMs:220,dashCooldown:720});
export function approach(current,target,amount){return current<target?Math.min(target,current+amount):Math.max(target,current-amount);}
export function drive(f,axis,dt,now,{guard=false,attacking=false}={}){
 if(axis){f.moveTime=(f.moveAxis===axis?f.moveTime||0:0)+dt;f.moveAxis=axis;}else{f.moveTime=0;f.moveAxis=0;}
 const target=now<(f.dashUntil||0)?f.dashDir*MOTION.dash:guard?0:axis*(f.moveTime>=MOTION.runDelay?MOTION.run:MOTION.walk)*(attacking?.48:1);
 f.vx=approach(f.vx,target,(target===0||Math.sign(target)!==Math.sign(f.vx)?MOTION.brake:MOTION.accel)*dt);
}
export function locomotion(f,grounded,guard=false){return !grounded?(f.jumps>1?'doublejump':'jump'):guard?'crouch':Math.abs(f.vx)>170?'run':Math.abs(f.vx)>12?'walk':'idle';}
