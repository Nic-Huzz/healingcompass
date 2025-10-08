// src/lib/templates/protectiveMirrorTemplate.js
// Map of protective archetype descriptions
const protectiveProfiles = {
  "Perfectionist": `Ah, the Perfectionist. This archetype developed to protect you from criticism and failure. 
It whispers: "If I can just get it perfect, then I’ll be safe from judgment." 
But perfectionism often becomes procrastination in disguise — keeping you stuck in endless prep mode. 
Exhausting, isn’t it?`,

  "People Pleaser": `Ah, the People Pleaser. This archetype learned that keeping everyone happy meant staying safe from conflict and rejection. 
It says: "If I’m helpful and agreeable, people will like me and I’ll be safe." 
But people-pleasing often leads to burnout and losing yourself in others’ needs. Sound familiar?`,

  "Controller": `Ah, the Controller. This archetype believes: "If I can manage everything, I can prevent bad outcomes." 
But it’s exhausting trying to control every variable, and often it creates the very chaos you’re trying to prevent. Does this resonate?`,

  "Performer": `Ah, the Performer. This archetype learned that being admired meant safety from rejection. 
It says: "If I’m impressive enough, people will value me and I’ll be safe." 
But performance mode is exhausting — creating a fear of being seen as "not enough" when you’re not performing. Ring any bells?`,

  "Ghost": `Ah, the Ghost. This archetype learned that staying invisible meant avoiding pain and rejection. 
It whispers: "If I don’t show up fully, I can’t be hurt." 
But hiding keeps you from the very connection and opportunities you crave — creating the isolation you’re trying to avoid. Does this feel true?`
}

/**
 * Render the Protective Mirror text based on the selected archetype.
 * @param {string} key - The protective archetype (e.g., "Perfectionist")
 * @returns {string} - Fully formatted mirror text
 */
export function renderProtectiveMirror(key) {
  const d = protectiveProfiles[key]
  if (!d) {
    return "We couldn’t find that archetype. Please try again."
  }

  return d
}
