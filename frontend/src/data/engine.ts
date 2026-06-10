import questionsData from './questions.json'

export interface ArchetypeStats {
  speed: number;       // Coding speed / velocity
  order: number;       // Code organization / neatness
  logic: number;       // Algorithmic / logical depth
  aesthetics: number;   // UI / design polish
}

export interface Archetype {
  id: string;
  title: string;
  emoji: string;
  description: string;
  quote: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  stats: ArchetypeStats;
  roast: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  chaos_coder: {
    id: 'chaos_coder',
    title: 'The Chaos Coder',
    emoji: '🌪️',
    description: 'You write code that works, but only God and your console logs know why. You test in production, ignore linting errors, and live on the edge.',
    quote: '"It compiled once on my local machine, so I pushed it straight to main."',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    textColor: 'text-amber-200',
    accentColor: '#f59e0b',
    stats: { speed: 95, order: 10, logic: 60, aesthetics: 35 },
    roast: 'Your Git history is 90% "fix" and "wip". You think type checkers are a conspiracy against freedom of speech.'
  },
  tenx_architect: {
    id: 'tenx_architect',
    title: 'The 10x Architect',
    emoji: '🏛️',
    description: 'Why write 10 lines of code when you can build a 1,000-line multi-layered system with interfaces, factories, context providers, and Docker recipes?',
    quote: '"We must migrate this static blog to a multi-region serverless Kubernetes microservice mesh."',
    gradient: 'from-blue-600 via-indigo-700 to-purple-800',
    textColor: 'text-blue-200',
    accentColor: '#3b82f6',
    stats: { speed: 20, order: 95, logic: 85, aesthetics: 50 },
    roast: 'You spend more time drawing UML diagrams than shipping features. You build spaceships to cross the street.'
  },
  overflow_paster: {
    id: 'overflow_paster',
    title: 'The Copy-Paste Expert',
    emoji: '📋',
    description: 'Why reinvent the wheel? If someone solved it on StackOverflow 9 years ago, it is good enough. You copy, paste, tweak one variable, and pray.',
    quote: '"I do not know what this regex does, but it successfully resolved our production incident."',
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    textColor: 'text-orange-200',
    accentColor: '#f97316',
    stats: { speed: 85, order: 25, logic: 40, aesthetics: 45 },
    roast: 'Your coding style changes on every line depending on which snippet you copied. Your keyboard only has Ctrl, C, and V keys left.'
  },
  clean_coder: {
    id: 'clean_coder',
    title: 'The Clean Code Zealot',
    emoji: '✨',
    description: 'You worship Robert C. Martin. You would rather delay a feature release by 3 weeks than commit code with improper indentation or long functions.',
    quote: '"This function is 6 lines long. It violates the Single Responsibility Principle and must be refactored."',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    textColor: 'text-emerald-200',
    accentColor: '#10b981',
    stats: { speed: 30, order: 100, logic: 80, aesthetics: 60 },
    roast: 'You refactor code that has never been run and never will be. Your codebase is a museum: beautiful, but dead.'
  },
  grindset_leet: {
    id: 'grindset_leet',
    title: 'The Grindset Leetcoder',
    emoji: '🧠',
    description: 'You solve LeetCode Hard problems for fun. You dream in binary trees, measure conversations in Big O complexity, and optimize your coffee breaks.',
    quote: '"That conversation had O(N^2) space-time complexity. I will have to optimize my social loop."',
    gradient: 'from-purple-600 via-pink-600 to-rose-700',
    textColor: 'text-purple-200',
    accentColor: '#8b5cf6',
    stats: { speed: 70, order: 80, logic: 100, aesthetics: 20 },
    roast: 'You can balance a red-black tree in your sleep, but you cannot figure out how to center a div in CSS.'
  },
  prompt_engineer: {
    id: 'prompt_engineer',
    title: 'The AI Prompt Master',
    emoji: '🤖',
    description: 'Writing code is so last century. You write detailed prompts. You command Claude and ChatGPT to code, debug, and deploy while you sip matcha.',
    quote: '"Claude, review my code, write unit tests, and write a polite response to my project manager."',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    textColor: 'text-cyan-200',
    accentColor: '#06b6d4',
    stats: { speed: 90, order: 50, logic: 60, aesthetics: 70 },
    roast: 'If your internet connection drops or Claude goes down, your development capacity drops to zero.'
  },
  terminal_ninja: {
    id: 'terminal_ninja',
    title: 'The Terminal Ninja',
    emoji: '🥷',
    description: 'A mouse? Web browser? You live in a terminal window. You navigate code at the speed of light using Vim motions and customized shell plugins.',
    quote: '":wq is not just a command, it is my lifestyle."',
    gradient: 'from-zinc-700 via-slate-800 to-zinc-950',
    textColor: 'text-zinc-300',
    accentColor: '#71717a',
    stats: { speed: 90, order: 75, logic: 90, aesthetics: 30 },
    roast: 'You spend 40 hours a week configuring your Neovim status bar. Nobody else can type on your keyboard.'
  },
  pixel_perfectionist: {
    id: 'pixel_perfectionist',
    title: 'The Pixel Perfectionist',
    emoji: '🎨',
    description: 'Web development is your canvas. If a border-radius is 1px off or a transition curve is linear instead of cubic-bezier, you cannot sleep at night.',
    quote: '"The shadow blur on this button is off. Let me rewrite the Tailwind theme configuration."',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-600',
    textColor: 'text-fuchsia-200',
    accentColor: '#d946ef',
    stats: { speed: 50, order: 70, logic: 55, aesthetics: 100 },
    roast: 'You spend 5 hours animating a button hover state, only to find out the backend API it calls has been broken for two weeks.'
  }
}

export const ROAST_MESSAGES = [
  'Inspecting your commit history...',
  'Judging your variable names...',
  'Counting linting errors...',
  'Checking your StackOverflow search logs...',
  'Analyzing your relationship with Claude/ChatGPT...',
  'Calculating your O(N) emotional stability...',
  'Detecting unused variables in your brain...',
  'Checking if you actually write tests...'
]

export function calculateResult(answers: Record<number, number>): Archetype {
  const scores: Record<string, number> = {
    chaos_coder: 0,
    tenx_architect: 0,
    overflow_paster: 0,
    clean_coder: 0,
    grindset_leet: 0,
    prompt_engineer: 0,
    terminal_ninja: 0,
    pixel_perfectionist: 0
  }

  // Iterate over each question answered
  Object.entries(answers).forEach(([qIdStr, optionIdx]) => {
    const qId = parseInt(qIdStr, 10)
    const question = questionsData.find(q => q.id === qId)
    if (!question) return

    const option = question.options[optionIdx]
    if (!option) return

    // Add scores from the option
    Object.entries(option.scores).forEach(([archetype, val]) => {
      if (scores[archetype] !== undefined && typeof val === 'number') {
        scores[archetype] += val
      }
    })
  })

  // Find the archetype with the highest score
  let maxScore = -1
  let maxId = 'chaos_coder'

  // Deterministic search
  const order = Object.keys(scores)
  order.forEach(id => {
    if (scores[id] > maxScore) {
      maxScore = scores[id]
      maxId = id
    }
  })

  return ARCHETYPES[maxId]
}
