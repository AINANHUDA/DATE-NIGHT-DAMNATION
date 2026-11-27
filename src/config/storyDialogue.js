/** MONKEY MIND III | MODULE
 * Story chapter names, speaker IDs, backgrounds, dialogue, cinematic event cues and next scene.
 * Customization map: docs/CUSTOMIZATION.md
 */
export const NAMES={ainan:'AINAN',jennifer:'JENNIFER',maliha:'MALIHA','mini-maliha':'MINI MALIHA'};
export const SCENES={
 prologue:{number:'PROLOGUE',title:'A perfectly normal date',bg:'prologue-bg',next:'ChaseScene',lines:[
  ['jennifer','Finally. A quiet evening. No homework, no drama, no weird quests.'],
  ['ainan','I even made a reservation. For two people and absolutely zero villains.'],
  ['jennifer','You brought bananas instead of flowers?'],
  ['ainan','Romance is temporary. Potassium is forever.'],
  ['jennifer','That might be the worst pickup line I have ever heard.'],
  ['ainan','And yet you are still here. Incredible marketing strategy.'],
  ['maliha','Awww. Cute. Disgusting, but cute.','entry'],
  ['ainan','Who invited the final boss to our date?'],
  ['maliha','You two think you are the main characters? The plot belongs to ME.'],
  ['jennifer','Ainan, please do not make this worse.'],
  ['ainan','Sorry, but that villain speech has serious budget-cut energy.'],
  ['maliha','THAT IS IT. Enjoy my little army. Jennifer is coming with me!','kidnap'],
  ['jennifer','AINAN!','escape'],
  ['ainan','Great. My dinner is cold, my girlfriend is gone, and now I have a quest.','resolve'],
  ['ainan','Hold on, Jennifer. I am coming.'] ]},
 mini:{number:'CHAPTER III',title:'The clone with a grudge',bg:'arena-bg',next:'BossBattleScene',lines:[
  ['mini-maliha','Stop right there. You have been ruining my entire clone network.'],
  ['ainan','Network? I thought you were just the discounted version of Maliha.'],
  ['mini-maliha','I was forged from the cosmic dust of her first failed spell. I carry the power of gravity itself!'],
  ['ainan','So basically a failed group project that became sentient?'],
  ['mini-maliha','You did NOT just call my origin story a group project.','miniPower'],
  ['ainan','You could have had a normal life. Opened a cafe. Sold tiny planets.'],
  ['mini-maliha','I am about to launch you into another dimension.'],
  ['ainan','Make it somewhere with good Wi-Fi.'] ]},
 final:{number:'CHAPTER IV',title:'The queen of chaos',bg:'prologue-bg',next:'BossBattleScene',lines:[
  ['maliha','Well, well. You defeated my little masterpiece.','cageReveal'],
  ['jennifer','Ainan! I am here. Please tell me you have a plan.'],
  ['ainan','Of course. Step one: insult the villain. Step two: improvise.'],
  ['maliha','Shut up! You destroyed my clones, stole my bananas, and ruined my entire evil aesthetic.'],
  ['ainan','Your prison decor is also questionable. One star.'],
  ['maliha','You absolute walking disaster! I am going to turn you into cosmic soup.','finalPower'],
  ['jennifer','Can you both stop arguing and get me out of this cage?'],
  ['ainan','Let her go. This ends now.'],
  ['maliha','Come on then, hero. Show me what you have got.'] ]},
 ending:{number:'EPILOGUE',title:'The date continues',bg:'ending-bg',next:'TitleScene',lines:[
  ['maliha','Unbelievable. Defeated by a banana enthusiast.','endingDown'],
  ['jennifer','You actually came back for me.'],
  ['ainan','Obviously. I had already paid for dinner.','release'],
  ['jennifer','You are impossible.'],
  ['ainan','Also, I collected an irresponsible amount of bananas.'],
  ['jennifer','Next date, we stay home.'],
  ['ainan','Deal. No side quests. Probably.'] ]}
};
