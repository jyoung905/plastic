import { clamp, createId, includesBannedTerm, isoNow, slugifyTag } from "@/lib/core";
import { applyVisualCheck } from "@/lib/visualCheck";
import type { Character, ContentItem, Project } from "@/lib/types";

type Bucket = "lifestyle" | "gym" | "fashion" | "story";

interface Template {
  bucket: Bucket;
  format: string;
  topic: string;
  hook: string;
  scriptLead: string;
  scriptMoment: string;
  caption: string;
  coverTitle: string;
  scene: string;
  hashtags: string[];
  placement: string;
}

const TEMPLATE_LIBRARY: Record<Bucket, Template[]> = {
  lifestyle: [
    {
      bucket: "lifestyle",
      format: "photo dump",
      topic: "coffee run before a packed day",
      hook: "POV: the coffee run decides your whole mood.",
      scriptLead: "Open on a quick street clip, coffee order, and bag drop.",
      scriptMoment: "Layer a calm voiceover about how a small ritual resets the whole day.",
      caption: "Reset the pace before the day gets loud.",
      coverTitle: "Coffee Run Reset",
      scene: "downtown coffee shop, tote bag, soft morning light, candid vertical framing",
      hashtags: ["#CoffeeRun", "#LifestyleTok", "#MorningRoutine", "#SoftLuxury"],
      placement: "Upper third, left side, high contrast white text, 2 lines max, away from face.",
    },
    {
      bucket: "lifestyle",
      format: "day in the life",
      topic: "Toronto errands and quiet luxury details",
      hook: "A very normal day that somehow still looks expensive.",
      scriptLead: "Start with keys, elevator mirror, and a quick city street transition.",
      scriptMoment: "Move through coffee, one errand, one outfit detail, and a calm evening check-in.",
      caption: "Errands, but make the frame feel intentional.",
      coverTitle: "Toronto Errand Day",
      scene: "Toronto condo elevator, espresso cup, neutral outfit, polished but candid camera-roll style",
      hashtags: ["#TorontoLife", "#DayInTheLife", "#LifestyleCreator", "#SoftLuxury"],
      placement: "Right side placement in upper third, contrast note with soft shadow, 2 lines max, away from face.",
    },
    {
      bucket: "lifestyle",
      format: "Sunday reset",
      topic: "Sunday reset with laundry, meal prep, and skincare",
      hook: "My Sunday reset is less glamorous than it looks.",
      scriptLead: "Show the apartment slightly messy before the reset starts.",
      scriptMoment: "Cut between candles, laundry folds, fridge restock, and a tidy close.",
      caption: "The calm always comes from the little systems.",
      coverTitle: "Sunday Reset",
      scene: "clean apartment, folded knitwear, matcha, neutral decor, soft indoor daylight",
      hashtags: ["#SundayReset", "#RoutineTok", "#HomeRoutine", "#CreatorLife"],
      placement: "Lower third above UI, clean contrast note, 2 lines max, away from face.",
    },
    {
      bucket: "lifestyle",
      format: "casual elevator selfie",
      topic: "casual elevator selfie before dinner",
      hook: "The elevator mirror keeps getting invited to dinner.",
      scriptLead: "Open on a quiet mirror clip with bag, coat, and one jewelry detail.",
      scriptMoment: "Pair it with short captions about leaving the house feeling put together.",
      caption: "No full production, just good lighting and a better jacket.",
      coverTitle: "Before Dinner Mood",
      scene: "condo elevator mirror, tailored coat, sleek hair, low-key luxury details, vertical phone capture",
      hashtags: ["#ElevatorSelfie", "#OutfitMood", "#LifestyleTok", "#NightOutReady"],
      placement: "Upper third, side placement, contrast note with outline, 1-2 lines, away from face.",
    },
    {
      bucket: "lifestyle",
      format: "vacation throwback",
      topic: "vacation throwback with a calm reflective caption",
      hook: "Throwback to when my only task was finding iced coffee.",
      scriptLead: "Use clips of a hotel balcony, coffee, and a walking shot.",
      scriptMoment: "Keep the text reflective and light instead of aspirational overload.",
      caption: "A soft reminder that slower days are still productive for the brain.",
      coverTitle: "Vacation Throwback",
      scene: "hotel balcony, linen set, sunglasses, travel tote, warm daylight, aspirational but grounded",
      hashtags: ["#VacationThrowback", "#TravelLifestyle", "#SoftLuxury", "#CreatorMood"],
      placement: "Upper third, left side, contrast note included, 2 lines max, away from face.",
    },
  ],
  gym: [
    {
      bucket: "gym",
      format: "gym mirror",
      topic: "gym mirror confidence check before training",
      hook: "Not every gym day feels strong, but this one did.",
      scriptLead: "Start on a mirror clip before the first set.",
      scriptMoment: "Add a short voiceover about showing up even when the energy is average.",
      caption: "Confidence comes from repeating the routine, not waiting for the perfect mood.",
      coverTitle: "Gym Mirror Check",
      scene: "clean gym mirror, matching athletic set, water bottle, adult creator energy, non-sexualized framing",
      hashtags: ["#GymMirror", "#WellnessRoutine", "#ConfidenceTok", "#HealthyHabits"],
      placement: "Right side in upper third, contrast note with drop shadow, 2 lines max, away from face.",
    },
    {
      bucket: "gym",
      format: "post-work reset",
      topic: "post-work treadmill and stretch reset",
      hook: "The walk after work fixes more than the meeting ever broke.",
      scriptLead: "Open with laptop closing, then transition straight into treadmill and stretch clips.",
      scriptMoment: "Keep the pacing calm and make the reset feel realistic for weekdays.",
      caption: "Not a dramatic transformation. Just a strong reset before the night starts.",
      coverTitle: "After Work Reset",
      scene: "modern gym cardio area, black set, hair clipped back, practical wellness framing",
      hashtags: ["#PostWorkReset", "#WellnessTok", "#GymRoutine", "#RoutineReset"],
      placement: "Lower third above UI, strong contrast note, 2 lines max, side placement away from face.",
    },
    {
      bucket: "gym",
      format: "wellness montage",
      topic: "hydration, supplements, and simple gym prep",
      hook: "Tiny prep habits make the routine feel easy.",
      scriptLead: "Start with filling a water bottle, grabbing shoes, and one quick mirror check.",
      scriptMoment: "The voiceover should position wellness as consistency, not perfection.",
      caption: "The routine gets easier when the setup is already done.",
      coverTitle: "Prep For Gym",
      scene: "kitchen counter, supplements, sneakers by the door, neutral athleticwear, clean composition",
      hashtags: ["#GymPrep", "#WellnessRoutine", "#HealthyLifestyle", "#HabitStacking"],
      placement: "Upper third, left side, contrast note included, 2 lines max, away from face.",
    },
    {
      bucket: "gym",
      format: "locker room recap",
      topic: "safe locker room recap after a quick session",
      hook: "Quick workout, clearer head, back to real life.",
      scriptLead: "Keep the footage to face-level mirror clips, gym bag, and sneakers only.",
      scriptMoment: "Write the caption like a check-in, not a transformation speech.",
      caption: "Short session, solid reset, no overthinking.",
      coverTitle: "Workout Recap",
      scene: "clean locker room mirror, zipped hoodie, gym bag, face-level framing, safe mainstream styling",
      hashtags: ["#WorkoutRecap", "#GymLife", "#WellnessCheck", "#RoutineTok"],
      placement: "Side placement in upper third, contrast note with outline, 2 lines max, away from face.",
    },
  ],
  fashion: [
    {
      bucket: "fashion",
      format: "outfit check",
      topic: "office-day outfit check with polished details",
      hook: "Office outfit, but still built for content.",
      scriptLead: "Show the full look, then cut to shoes, bag, and watch.",
      scriptMoment: "Frame the caption around feeling composed instead of trying too hard.",
      caption: "A reliable office uniform saves more time than any productivity app.",
      coverTitle: "Office Outfit Check",
      scene: "office lobby, structured blazer, neutral trousers, polished bag, modern workwear styling",
      hashtags: ["#OfficeStyle", "#OutfitCheck", "#SoftLuxury", "#Workwear"],
      placement: "Upper third, right side, contrast note with shadow, 2 lines max, away from face.",
    },
    {
      bucket: "fashion",
      format: "GRWM",
      topic: "GRWM for a polished weekday meeting",
      hook: "Get ready with me for a meeting I plan to win quietly.",
      scriptLead: "Move quickly through skincare, jewelry, blazer, and coffee.",
      scriptMoment: "The voiceover should feel calm, confident, and a little playful.",
      caption: "Quiet confidence, clean tailoring, and enough coffee to stay kind.",
      coverTitle: "Weekday GRWM",
      scene: "bathroom vanity, blazer on hanger, gold jewelry, iced coffee, soft bathroom lighting",
      hashtags: ["#GRWM", "#WorkdayStyle", "#LifestyleCreator", "#RoutineTok"],
      placement: "Upper third, left side, clear contrast note, 2 lines max, away from face.",
    },
    {
      bucket: "fashion",
      format: "soft luxury errand",
      topic: "soft luxury errand run with neutral staples",
      hook: "Running one errand like it is a full editorial.",
      scriptLead: "Capture the walk, bag swing, coffee pickup, and receipt drop.",
      scriptMoment: "Keep the joke self-aware so it stays light and mainstream.",
      caption: "A trench coat can make one small errand feel suspiciously important.",
      coverTitle: "Errand Outfit",
      scene: "city sidewalk, trench coat, sneakers, structured tote, muted tones, candid city movement",
      hashtags: ["#SoftLuxury", "#ErrandLook", "#CityStyle", "#CreatorMood"],
      placement: "Lower third above UI, contrast note with soft shadow, 2 lines max, side placement away from face.",
    },
    {
      bucket: "fashion",
      format: "office day",
      topic: "office desk setup and outfit pairing",
      hook: "The desk, the blazer, the coffee. Same formula, still works.",
      scriptLead: "Show an office arrival, desk detail, then one clean mirror cut.",
      scriptMoment: "The script should tie productivity and personal style together.",
      caption: "When the desk setup and outfit are both clean, the day usually follows.",
      coverTitle: "Office Day Energy",
      scene: "modern office desk, laptop, espresso, blazer, leather notebook, daylight through glass windows",
      hashtags: ["#OfficeDay", "#ProductiveStyle", "#SoftLuxury", "#CreatorRoutine"],
      placement: "Upper third, side placement, contrast note included, 1-2 lines, away from face.",
    },
  ],
  story: [
    {
      bucket: "story",
      format: "mini storytime",
      topic: "mini storytime about romanticizing a boring Tuesday",
      hook: "Storytime: the most average Tuesday taught me a branding lesson.",
      scriptLead: "Open with a talking-head clip and a quick subtitle that sets the scene.",
      scriptMoment: "Tell a short story about turning a plain day into useful content instead of waiting for excitement.",
      caption: "Romanticizing a boring day is a skill, not a personality flaw.",
      coverTitle: "Average Tuesday Lesson",
      scene: "talking-head at home, coffee mug, cozy chair, candid apartment background",
      hashtags: ["#Storytime", "#CreatorMindset", "#LifestyleTok", "#DailyPerspective"],
      placement: "Upper third, left side, contrast note with outline, 2 lines max, away from face.",
    },
    {
      bucket: "story",
      format: "confidence quote",
      topic: "confidence reminder after an off week",
      hook: "A confidence reminder for anyone rebuilding the routine this week.",
      scriptLead: "Use text-led clips of walking, laptop closing, and a calm mirror look.",
      scriptMoment: "Keep the words concise and grounded so it lands as a real reminder, not a lecture.",
      caption: "Confidence is usually just proof that you kept your word to yourself a few days in a row.",
      coverTitle: "Confidence Reminder",
      scene: "city walk, blazer over activewear, clean natural light, intentional but realistic lifestyle framing",
      hashtags: ["#ConfidenceTok", "#MindsetShift", "#CreatorMood", "#RoutineReset"],
      placement: "Lower third above UI, contrast note included, 2 lines max, away from face.",
    },
    {
      bucket: "story",
      format: "POV caption",
      topic: "relatable dating and lifestyle joke kept light and non-explicit",
      hook: "POV: your calendar is organized but your dating life is freestyle.",
      scriptLead: "Build this one from quick clips instead of a long talk-to-camera.",
      scriptMoment: "Let the joke sit in the caption and keep the visuals chic and everyday.",
      caption: "Structured in every category except the one that keeps texting \"you up?\" at 9:14.",
      coverTitle: "POV: Organized-ish",
      scene: "city evening walk, phone in hand, blazer and denim, reflective elevator clip, mainstream lifestyle mood",
      hashtags: ["#POV", "#LifestyleHumor", "#DatingJoke", "#CityGirlRoutine"],
      placement: "Right side in upper third, contrast note with shadow, 2 lines max, away from face.",
    },
    {
      bucket: "story",
      format: "caption-led montage",
      topic: "productivity reality check with aesthetic visuals",
      hook: "Pretty routines still need realistic expectations.",
      scriptLead: "Open on a laptop, checklist, and one calm coffee shot.",
      scriptMoment: "Use short text overlays about consistency beating intensity on most weeks.",
      caption: "The routine got better when I stopped asking it to also be cinematic every day.",
      coverTitle: "Routine Reality",
      scene: "desk, planner, coffee, window light, understated city apartment styling",
      hashtags: ["#ProductivityRoutine", "#CreatorSystems", "#RoutineTok", "#SoftLifestyle"],
      placement: "Upper third, left side, strong contrast note, 2 lines max, away from face.",
    },
  ],
};

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function buildBucketPlan(count: number) {
  const lifestyleCount = Math.round(count * 0.4);
  const gymCount = Math.round(count * 0.25);
  const fashionCount = Math.round(count * 0.2);
  const storyCount = Math.max(count - lifestyleCount - gymCount - fashionCount, 0);

  return shuffle([
    ...Array.from({ length: lifestyleCount }, () => "lifestyle" as const),
    ...Array.from({ length: gymCount }, () => "gym" as const),
    ...Array.from({ length: fashionCount }, () => "fashion" as const),
    ...Array.from({ length: storyCount }, () => "story" as const),
  ]).slice(0, count);
}

function getModeDirection(character: Character) {
  switch (character.mode) {
    case "strict_bella":
      return `Use Bella as a fictional adult lifestyle creator anchor. Keep broad consistency in brunette hair, polished soft-luxury wardrobe, grounded confidence, and candid camera-roll realism. Never imply a real-person clone.`;
    case "bella_inspired":
      return `Keep a Bella-inspired adult lifestyle vibe with room for outfit, setting, and styling variation. Preserve the polished, aspirational, adult tone without referencing any real person.`;
    case "open_cast":
      return `Allow broader adult casting while preserving the project's overall lifestyle, fashion, and wellness tone. Keep the visuals cohesive and mainstream.`;
    default:
      return `Keep the character adult, fictional, and consistent with the project's tone.`;
  }
}

function pickTemplate(bucket: Bucket, usedTopics: Set<string>, bannedTopics: string[]) {
  const candidates = shuffle(TEMPLATE_LIBRARY[bucket]).filter((template) => {
    if (usedTopics.has(template.topic)) {
      return false;
    }

    return !includesBannedTerm(
      `${template.topic} ${template.hook} ${template.caption}`,
      bannedTopics,
    );
  });

  return candidates[0] ?? shuffle(TEMPLATE_LIBRARY[bucket])[0];
}

function buildTopic(project: Project, template: Template) {
  const pillar = project.contentPillars[template.topic.length % Math.max(project.contentPillars.length, 1)];
  return pillar
    ? `${template.topic} with a ${pillar.toLowerCase()} angle`
    : `${template.topic} for ${project.niche.toLowerCase()}`;
}

function buildScript(project: Project, character: Character, template: Template) {
  const personality = character.personality || "confident, calm, and observant";
  const tone = project.tone || "polished and conversational";
  const goal = project.contentGoals[0] || "build a reliable posting rhythm";

  return `${template.scriptLead} ${template.scriptMoment} Let the voiceover feel ${tone.toLowerCase()} with ${personality.toLowerCase()} energy, and close by reinforcing ${goal.toLowerCase()}.`;
}

function buildCaption(project: Project, template: Template) {
  const audience = project.audience ? ` ${project.audience} gets the joke.` : "";
  return `${template.caption}${audience}`;
}

function buildHashtags(project: Project, template: Template) {
  const tags = [
    ...template.hashtags,
    slugifyTag(project.niche),
    ...project.contentPillars.slice(0, 2).map(slugifyTag),
  ].filter((tag): tag is string => Boolean(tag));

  return Array.from(new Set(tags)).slice(0, 7);
}

function buildVisualPrompt(project: Project, character: Character, template: Template) {
  const consistency = clamp(character.consistencyLevel, 0, 100);
  const appearance = character.appearanceDescription || "polished adult lifestyle creator styling";
  const wardrobe = character.wardrobeStyle || "clean soft-luxury staples";
  const promptRules = character.promptRules || "safe mainstream TikTok-style framing only";
  const visualRules = character.visualRules || "vertical 9:16, candid phone camera realism, natural skin texture";

  return [
    `${character.name || "Bella"}, fictional adult lifestyle creator for ${project.accountName}.`,
    getModeDirection(character),
    `Scene: ${template.scene}.`,
    `Appearance: ${appearance}. Wardrobe: ${wardrobe}.`,
    `Project niche: ${project.niche}. Tone: ${project.tone}. Consistency target: ${consistency} out of 100.`,
    `Visual rules: ${visualRules}. Prompt rules: ${promptRules}.`,
    "Safe mainstream content only: no nudity, no erotic framing, no body-part focus, no minors, no illegal activity, no dangerous stunts.",
  ].join(" ");
}

function makeItem(
  project: Project,
  character: Character,
  dayNumber: number,
  template: Template,
): ContentItem {
  const now = isoNow();

  return applyVisualCheck({
    id: createId("content"),
    projectId: project.id,
    characterId: character.id,
    dayNumber,
    format: template.format,
    topic: buildTopic(project, template),
    hook: template.hook,
    script: buildScript(project, character, template),
    caption: buildCaption(project, template),
    hashtags: buildHashtags(project, template),
    coverTitle: template.coverTitle,
    visualPrompt: buildVisualPrompt(project, character, template),
    titlePlacement: template.placement,
    status: "draft",
    visualCheckStatus: "not_checked",
    visualWarnings: [],
    createdAt: now,
    updatedAt: now,
  });
}

export function generateMockContent(
  project: Project,
  character: Character,
  count: number,
): ContentItem[] {
  const total = clamp(count, 1, 60);
  const bucketPlan = buildBucketPlan(total);
  const usedTopics = new Set<string>();

  return bucketPlan.map((bucket, index) => {
    const template = pickTemplate(bucket, usedTopics, project.bannedTopics);
    usedTopics.add(template.topic);
    return makeItem(project, character, index + 1, template);
  });
}
