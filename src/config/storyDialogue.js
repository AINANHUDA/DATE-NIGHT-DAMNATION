// Story configuration: [speaker, subtitle, optional cinematic event].
// Keep voice IDs and src/audio/voiceLines.json in sync.
export const NAMES = {
  "ainan": "AINAN",
  "jennifer": "JENNIFER",
  "maliha": "MALIHA",
  "mini-maliha": "MINI MALIHA"
};
export const SCENES = {
  "prologue": {
    "number": "PROLOGUE",
    "title": "A perfectly normal date",
    "bg": "prologue-bg",
    "next": "ChaseScene",
    "lines": [
      [
        "jennifer",
        "Finally, a quiet night. No homework, no drama, no weird side quests."
      ],
      [
        "ainan",
        "I actually got us a table. Just the two of us, zero interruptions."
      ],
      [
        "jennifer",
        "Did you seriously bring bananas instead of flowers?"
      ],
      [
        "ainan",
        "Flowers die. Potassium is forever."
      ],
      [
        "jennifer",
        "That has to be the worst line you've ever used on me."
      ],
      [
        "ainan",
        "And yet, you're still smiling. Clearly it works."
      ],
      [
        "maliha",
        "Aww, look at you two. Honestly, it's making me sick.",
        "entry"
      ],
      [
        "ainan",
        "Wait—who invited the final boss to date night?"
      ],
      [
        "maliha",
        "You really think this is your story? You're just side characters in mine."
      ],
      [
        "jennifer",
        "Ainan, please, just don't provoke her."
      ],
      [
        "ainan",
        "Look, I'm sorry, but that whole villain monologue felt pretty half-baked."
      ],
      [
        "maliha",
        "Alright, you're done. Deal with my guards—Jennifer's coming with me!",
        "kidnap"
      ],
      [
        "jennifer",
        "AINAN!",
        "escape"
      ],
      [
        "ainan",
        "Unbelievable. Dinner's getting cold, my girlfriend got kidnapped, and now I have to clean this up.",
        "resolve"
      ],
      [
        "ainan",
        "Hang tight, Jennifer. I'm coming."
      ]
    ]
  },
  "mini": {
    "number": "CHAPTER III",
    "title": "The clone with a grudge",
    "bg": "arena-bg",
    "next": "BossBattleScene",
    "lines": [
      [
        "mini-maliha",
        "Hold it right there. You've been tearing through my entire clone network."
      ],
      [
        "ainan",
        "Network? I thought you were just a knockoff version of Maliha."
      ],
      [
        "mini-maliha",
        "I was born from the cosmic dust of her very first spell! I control gravity itself!"
      ],
      [
        "ainan",
        "So you're basically a failed science experiment that learned how to talk?"
      ],
      [
        "mini-maliha",
        "Did you seriously just call my origin story a science experiment?!",
        "miniPower"
      ],
      [
        "ainan",
        "You could've just had a normal life. Opened a coffee shop. Sold little decorative planets."
      ],
      [
        "mini-maliha",
        "I'm going to launch you into another dimension!"
      ],
      [
        "ainan",
        "Just make sure it has decent Wi-Fi."
      ]
    ]
  },
  "final": {
    "number": "CHAPTER IV",
    "title": "The queen of chaos",
    "bg": "prologue-bg",
    "next": "BossBattleScene",
    "lines": [
      [
        "maliha",
        "Well, look who actually beat my little masterpiece.",
        "cageReveal"
      ],
      [
        "jennifer",
        "Ainan! Over here! Please tell me you actually have a plan."
      ],
      [
        "ainan",
        "Of course I do. Step one: stall for time. Step two: improvise."
      ],
      [
        "maliha",
        "Shut up! You wrecked my clones, took my bananas, and completely ruined my plans!"
      ],
      [
        "ainan",
        "Honestly, the whole dungeon setup isn't doing you any favors either. One star."
      ],
      [
        "maliha",
        "You absolute menace! I'm going to wipe you off the map!",
        "finalPower"
      ],
      [
        "jennifer",
        "Can you two stop arguing and get me out of here?!"
      ],
      [
        "ainan",
        "Let her go. We're ending this right now."
      ],
      [
        "maliha",
        "Alright then, hero. Let's see what you've got."
      ]
    ]
  },
  "ending": {
    "number": "EPILOGUE",
    "title": "The date continues",
    "bg": "ending-bg",
    "next": "TitleScene",
    "lines": [
      [
        "maliha",
        "I can't believe I just lost to a guy obsessed with bananas.",
        "endingDown"
      ],
      [
        "jennifer",
        "You actually came back for me."
      ],
      [
        "ainan",
        "Well yeah, I already put my card down for dinner.",
        "release"
      ],
      [
        "jennifer",
        "You're impossible."
      ],
      [
        "ainan",
        "Plus, I picked up way too many bananas on the way here."
      ],
      [
        "jennifer",
        "Next time, we're just ordering takeout."
      ],
      [
        "ainan",
        "Deal. No more adventures. Probably."
      ]
    ]
  }
};
