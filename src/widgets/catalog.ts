export type CatalogWidgetCategory =
  | 'music'
  | 'coding'
  | 'health'
  | 'information'
  | 'links'
  | 'tracking'
  | 'fun'
  | 'images'
  | 'productivity'

export type CatalogWidgetTemplate =
  | 'clock'
  | 'weather'
  | 'spotify'
  | 'spotify_now'
  | 'github'
  | 'github_stats'
  | 'rss'
  | 'strava'
  | 'poll'
  | 'map'
  | 'progress'
  | 'soundpad'
  | 'qr'
  | 'link'
  | 'emoji'
  | 'polaroid'
  | 'sticky'

export type CatalogWidgetConfig = Record<string, string | number | boolean>

export type CatalogWidget = {
  id: string
  name: string
  category: CatalogWidgetCategory
  description: string
  tags: string[]
  icon: string
  template: CatalogWidgetTemplate
  config?: CatalogWidgetConfig
}

export const WIDGET_CATEGORIES: {
  id: CatalogWidgetCategory
  label: string
  icon: string
  description: string
}[] = [
  { id: 'music', label: 'Music', icon: '🎵', description: 'Playlists, sound pads, and audio widgets' },
  { id: 'coding', label: 'Coding', icon: '💻', description: 'GitHub repos, dev tools, and project trackers' },
  { id: 'health', label: 'Health', icon: '💪', description: 'Wellness, fitness, and habit trackers' },
  { id: 'information', label: 'Information', icon: '📡', description: 'Clocks, weather, and live data' },
  { id: 'links', label: 'Links', icon: '🔗', description: 'QR codes, link cards, and social profiles' },
  { id: 'tracking', label: 'Tracking', icon: '📊', description: 'Progress bars and goal counters' },
  { id: 'fun', label: 'Fun', icon: '🎉', description: 'Stickers, sound effects, and playful widgets' },
  { id: 'images', label: 'Images', icon: '📷', description: 'Polaroids and photo placeholders' },
  { id: 'productivity', label: 'Productivity', icon: '✅', description: 'Sticky notes, reminders, and planners' },
]

export const WIDGET_CATALOG: CatalogWidget[] = [
  // ── Clocks (12) ──────────────────────────────────────────────────────────
  {
    id: 'clock-utc',
    name: 'UTC Clock',
    category: 'information',
    description: 'Flip clock synced to Coordinated Universal Time.',
    tags: ['clock', 'time', 'utc', 'world'],
    icon: '🕐',
    template: 'clock',
    config: { location: 'UTC', timezone: 'UTC' },
  },
  {
    id: 'clock-nyc',
    name: 'New York Clock',
    category: 'information',
    description: 'Live flip clock for New York City (Eastern Time).',
    tags: ['clock', 'time', 'nyc', 'usa'],
    icon: '🗽',
    template: 'clock',
    config: { location: 'New York, NY', timezone: 'America/New_York' },
  },
  {
    id: 'clock-la',
    name: 'Los Angeles Clock',
    category: 'information',
    description: 'Live flip clock for Los Angeles (Pacific Time).',
    tags: ['clock', 'time', 'la', 'usa'],
    icon: '🌴',
    template: 'clock',
    config: { location: 'Los Angeles, CA', timezone: 'America/Los_Angeles' },
  },
  {
    id: 'clock-london',
    name: 'London Clock',
    category: 'information',
    description: 'Live flip clock for London (GMT/BST).',
    tags: ['clock', 'time', 'london', 'uk'],
    icon: '🇬🇧',
    template: 'clock',
    config: { location: 'London, UK', timezone: 'Europe/London' },
  },
  {
    id: 'clock-paris',
    name: 'Paris Clock',
    category: 'information',
    description: 'Live flip clock for Paris (Central European Time).',
    tags: ['clock', 'time', 'paris', 'france'],
    icon: '🗼',
    template: 'clock',
    config: { location: 'Paris, France', timezone: 'Europe/Paris' },
  },
  {
    id: 'clock-tokyo',
    name: 'Tokyo Clock',
    category: 'information',
    description: 'Live flip clock for Tokyo (Japan Standard Time).',
    tags: ['clock', 'time', 'tokyo', 'japan'],
    icon: '🗾',
    template: 'clock',
    config: { location: 'Tokyo, Japan', timezone: 'Asia/Tokyo' },
  },
  {
    id: 'clock-sydney',
    name: 'Sydney Clock',
    category: 'information',
    description: 'Live flip clock for Sydney (Australian Eastern Time).',
    tags: ['clock', 'time', 'sydney', 'australia'],
    icon: '🦘',
    template: 'clock',
    config: { location: 'Sydney, Australia', timezone: 'Australia/Sydney' },
  },
  {
    id: 'clock-mumbai',
    name: 'Mumbai Clock',
    category: 'information',
    description: 'Live flip clock for Mumbai (India Standard Time).',
    tags: ['clock', 'time', 'mumbai', 'india'],
    icon: '🇮🇳',
    template: 'clock',
    config: { location: 'Mumbai, India', timezone: 'Asia/Kolkata' },
  },
  {
    id: 'clock-dubai',
    name: 'Dubai Clock',
    category: 'information',
    description: 'Live flip clock for Dubai (Gulf Standard Time).',
    tags: ['clock', 'time', 'dubai', 'uae'],
    icon: '🏙️',
    template: 'clock',
    config: { location: 'Dubai, UAE', timezone: 'Asia/Dubai' },
  },
  {
    id: 'clock-berlin',
    name: 'Berlin Clock',
    category: 'information',
    description: 'Live flip clock for Berlin (Central European Time).',
    tags: ['clock', 'time', 'berlin', 'germany'],
    icon: '🇩🇪',
    template: 'clock',
    config: { location: 'Berlin, Germany', timezone: 'Europe/Berlin' },
  },
  {
    id: 'clock-chicago',
    name: 'Chicago Clock',
    category: 'information',
    description: 'Live flip clock for Chicago (Central Time).',
    tags: ['clock', 'time', 'chicago', 'usa'],
    icon: '🌆',
    template: 'clock',
    config: { location: 'Chicago, IL', timezone: 'America/Chicago' },
  },
  {
    id: 'clock-sao-paulo',
    name: 'São Paulo Clock',
    category: 'information',
    description: 'Live flip clock for São Paulo (Brasília Time).',
    tags: ['clock', 'time', 'sao-paulo', 'brazil'],
    icon: '🇧🇷',
    template: 'clock',
    config: { location: 'São Paulo, Brazil', timezone: 'America/Sao_Paulo' },
  },

  // ── Weather (12) ─────────────────────────────────────────────────────────
  {
    id: 'weather-nyc',
    name: 'New York Weather',
    category: 'information',
    description: 'Live weather card for New York City.',
    tags: ['weather', 'forecast', 'nyc', 'usa'],
    icon: '🌤️',
    template: 'weather',
    config: { location: 'New York, NY', units: 'fahrenheit' },
  },
  {
    id: 'weather-la',
    name: 'Los Angeles Weather',
    category: 'information',
    description: 'Live weather card for Los Angeles.',
    tags: ['weather', 'forecast', 'la', 'usa'],
    icon: '☀️',
    template: 'weather',
    config: { location: 'Los Angeles, CA', units: 'fahrenheit' },
  },
  {
    id: 'weather-london',
    name: 'London Weather',
    category: 'information',
    description: 'Live weather card for London.',
    tags: ['weather', 'forecast', 'london', 'uk'],
    icon: '🌧️',
    template: 'weather',
    config: { location: 'London, UK', units: 'celsius' },
  },
  {
    id: 'weather-paris',
    name: 'Paris Weather',
    category: 'information',
    description: 'Live weather card for Paris.',
    tags: ['weather', 'forecast', 'paris', 'france'],
    icon: '⛅',
    template: 'weather',
    config: { location: 'Paris, France', units: 'celsius' },
  },
  {
    id: 'weather-tokyo',
    name: 'Tokyo Weather',
    category: 'information',
    description: 'Live weather card for Tokyo.',
    tags: ['weather', 'forecast', 'tokyo', 'japan'],
    icon: '🌸',
    template: 'weather',
    config: { location: 'Tokyo, Japan', units: 'celsius' },
  },
  {
    id: 'weather-sydney',
    name: 'Sydney Weather',
    category: 'information',
    description: 'Live weather card for Sydney.',
    tags: ['weather', 'forecast', 'sydney', 'australia'],
    icon: '🏖️',
    template: 'weather',
    config: { location: 'Sydney, Australia', units: 'celsius' },
  },
  {
    id: 'weather-mumbai',
    name: 'Mumbai Weather',
    category: 'information',
    description: 'Live weather card for Mumbai.',
    tags: ['weather', 'forecast', 'mumbai', 'india'],
    icon: '🌡️',
    template: 'weather',
    config: { location: 'Mumbai, India', units: 'celsius' },
  },
  {
    id: 'weather-dubai',
    name: 'Dubai Weather',
    category: 'information',
    description: 'Live weather card for Dubai.',
    tags: ['weather', 'forecast', 'dubai', 'uae'],
    icon: '🏜️',
    template: 'weather',
    config: { location: 'Dubai, UAE', units: 'celsius' },
  },
  {
    id: 'weather-berlin',
    name: 'Berlin Weather',
    category: 'information',
    description: 'Live weather card for Berlin.',
    tags: ['weather', 'forecast', 'berlin', 'germany'],
    icon: '🌥️',
    template: 'weather',
    config: { location: 'Berlin, Germany', units: 'celsius' },
  },
  {
    id: 'weather-chicago',
    name: 'Chicago Weather',
    category: 'information',
    description: 'Live weather card for Chicago.',
    tags: ['weather', 'forecast', 'chicago', 'usa'],
    icon: '🌬️',
    template: 'weather',
    config: { location: 'Chicago, IL', units: 'fahrenheit' },
  },
  {
    id: 'weather-sao-paulo',
    name: 'São Paulo Weather',
    category: 'information',
    description: 'Live weather card for São Paulo.',
    tags: ['weather', 'forecast', 'sao-paulo', 'brazil'],
    icon: '🌦️',
    template: 'weather',
    config: { location: 'São Paulo, Brazil', units: 'celsius' },
  },
  {
    id: 'weather-seattle',
    name: 'Seattle Weather',
    category: 'information',
    description: 'Live weather card for Seattle — rain or shine.',
    tags: ['weather', 'forecast', 'seattle', 'usa'],
    icon: '🌧️',
    template: 'weather',
    config: { location: 'Seattle, WA', units: 'fahrenheit' },
  },

  // ── Spotify (8) ──────────────────────────────────────────────────────────
  {
    id: 'spotify-focus',
    name: 'Focus Beats',
    category: 'music',
    description: 'Ambient focus playlist widget with visualizer.',
    tags: ['spotify', 'music', 'focus', 'work'],
    icon: '🎧',
    template: 'spotify',
    config: { label: 'Hyper-Focus Ambient Waves' },
  },
  {
    id: 'spotify-lofi',
    name: 'Lo-Fi Study',
    category: 'music',
    description: 'Chill lo-fi beats for studying and relaxing.',
    tags: ['spotify', 'music', 'lofi', 'study'],
    icon: '📻',
    template: 'spotify',
    config: { label: 'Lo-Fi Study Beats' },
  },
  {
    id: 'spotify-deep-work',
    name: 'Deep Work',
    category: 'music',
    description: 'Minimal electronic tracks for deep work sessions.',
    tags: ['spotify', 'music', 'deep-work', 'productivity'],
    icon: '🧠',
    template: 'spotify',
    config: { label: 'Deep Work Minimal' },
  },
  {
    id: 'spotify-chill',
    name: 'Chill Vibes',
    category: 'music',
    description: 'Easygoing playlist for winding down.',
    tags: ['spotify', 'music', 'chill', 'relax'],
    icon: '😌',
    template: 'spotify',
    config: { label: 'Chill Vibes Sunday' },
  },
  {
    id: 'spotify-coding',
    name: 'Coding Flow',
    category: 'music',
    description: 'Instrumental tracks optimized for coding marathons.',
    tags: ['spotify', 'music', 'coding', 'developer'],
    icon: '⌨️',
    template: 'spotify',
    config: { label: 'Coding Flow State' },
  },
  {
    id: 'spotify-rain',
    name: 'Rain Sounds',
    category: 'music',
    description: 'Gentle rain ambience for concentration.',
    tags: ['spotify', 'music', 'rain', 'ambient'],
    icon: '🌧️',
    template: 'spotify',
    config: { label: 'Rain on Window' },
  },
  {
    id: 'spotify-jazz',
    name: 'Jazz Café',
    category: 'music',
    description: 'Smooth jazz for creative afternoons.',
    tags: ['spotify', 'music', 'jazz', 'cafe'],
    icon: '🎷',
    template: 'spotify',
    config: { label: 'Late Night Jazz Café' },
  },
  {
    id: 'spotify-ambient',
    name: 'Epic Ambient',
    category: 'music',
    description: 'Cinematic ambient soundscapes for big projects.',
    tags: ['spotify', 'music', 'ambient', 'cinematic'],
    icon: '🌌',
    template: 'spotify',
    config: { label: 'Epic Ambient Soundscapes' },
  },

  {
    id: 'spotify-now-playing',
    name: 'Spotify Now Playing',
    category: 'music',
    description: 'Live track from your Spotify account (OAuth).',
    tags: ['spotify', 'now playing', 'oauth', 'music'],
    icon: '🎧',
    template: 'spotify_now',
    config: { label: 'Now playing' },
  },

  // ── GitHub (10) ──────────────────────────────────────────────────────────
  {
    id: 'github-stats-octocat',
    name: 'GitHub Stats',
    category: 'coding',
    description: 'Live profile stats + contribution chart (public API).',
    tags: ['github', 'stats', 'contributions', 'developer'],
    icon: '📊',
    template: 'github_stats',
    config: { username: 'octocat', label: 'GitHub' },
  },
  {
    id: 'github-profile',
    name: 'GitHub Profile',
    category: 'coding',
    description: 'Contribution grid and profile stats widget.',
    tags: ['github', 'profile', 'stats', 'developer'],
    icon: '👤',
    template: 'github',
    config: { repo: 'octocat', label: 'GitHub Profile' },
  },
  {
    id: 'github-hello-world',
    name: 'Hello World Repo',
    category: 'coding',
    description: 'Classic starter repo activity widget.',
    tags: ['github', 'repo', 'starter', 'open-source'],
    icon: '🌍',
    template: 'github',
    config: { repo: 'octocat/Hello-World' },
  },
  {
    id: 'github-vscode',
    name: 'VS Code Repo',
    category: 'coding',
    description: 'Track activity on the VS Code repository.',
    tags: ['github', 'repo', 'vscode', 'microsoft'],
    icon: '💻',
    template: 'github',
    config: { repo: 'microsoft/vscode' },
  },
  {
    id: 'github-react',
    name: 'React Repo',
    category: 'coding',
    description: 'React library commit and issue tracker.',
    tags: ['github', 'repo', 'react', 'frontend'],
    icon: '⚛️',
    template: 'github',
    config: { repo: 'facebook/react' },
  },
  {
    id: 'github-nextjs',
    name: 'Next.js Repo',
    category: 'coding',
    description: 'Next.js framework activity widget.',
    tags: ['github', 'repo', 'nextjs', 'vercel'],
    icon: '▲',
    template: 'github',
    config: { repo: 'vercel/next.js' },
  },
  {
    id: 'github-rust',
    name: 'Rust Lang Repo',
    category: 'coding',
    description: 'Rust programming language repository tracker.',
    tags: ['github', 'repo', 'rust', 'systems'],
    icon: '🦀',
    template: 'github',
    config: { repo: 'rust-lang/rust' },
  },
  {
    id: 'github-python',
    name: 'CPython Repo',
    category: 'coding',
    description: 'Python interpreter repository activity.',
    tags: ['github', 'repo', 'python', 'backend'],
    icon: '🐍',
    template: 'github',
    config: { repo: 'python/cpython' },
  },
  {
    id: 'github-typescript',
    name: 'TypeScript Repo',
    category: 'coding',
    description: 'TypeScript language repository tracker.',
    tags: ['github', 'repo', 'typescript', 'microsoft'],
    icon: '📘',
    template: 'github',
    config: { repo: 'microsoft/TypeScript' },
  },
  {
    id: 'github-tldraw',
    name: 'tldraw Repo',
    category: 'coding',
    description: 'tldraw whiteboard library activity widget.',
    tags: ['github', 'repo', 'tldraw', 'canvas'],
    icon: '✏️',
    template: 'github',
    config: { repo: 'tldraw/tldraw' },
  },
  {
    id: 'github-contributions',
    name: 'Contribution Streak',
    category: 'coding',
    description: 'Daily commit streak and contribution heatmap.',
    tags: ['github', 'contributions', 'streak', 'stats'],
    icon: '🔥',
    template: 'github',
    config: { repo: 'user/repo', label: 'Contribution Streak' },
  },

  // ── Live RSS feeds (no key) ───────────────────────────────────────────────
  {
    id: 'rss-github-activity',
    name: 'GitHub Activity',
    category: 'coding',
    description: 'Recent public events from a GitHub user (Atom feed).',
    tags: ['github', 'rss', 'activity', 'developer'],
    icon: '🐙',
    template: 'rss',
    config: {
      label: 'GitHub',
      feedUrl: 'https://github.com/octocat.atom',
      feedLimit: 5,
    },
  },
  {
    id: 'rss-letterboxd',
    name: 'Letterboxd Films',
    category: 'information',
    description: 'Recently watched films from Letterboxd RSS.',
    tags: ['letterboxd', 'films', 'rss', 'movies'],
    icon: '🎬',
    template: 'rss',
    config: {
      label: 'Letterboxd',
      feedUrl: 'https://letterboxd.com/letterboxd/rss/',
      feedLimit: 5,
    },
  },
  {
    id: 'rss-devto',
    name: 'dev.to Articles',
    category: 'coding',
    description: 'Latest articles from a dev.to profile.',
    tags: ['devto', 'blog', 'rss', 'developer'],
    icon: '✍️',
    template: 'rss',
    config: {
      label: 'dev.to',
      feedUrl: 'https://dev.to/feed/ben',
      feedLimit: 5,
    },
  },
  {
    id: 'rss-mastodon',
    name: 'Mastodon Posts',
    category: 'links',
    description: 'Recent posts from a Mastodon profile RSS.',
    tags: ['mastodon', 'social', 'rss', 'fediverse'],
    icon: '🐘',
    template: 'rss',
    config: {
      label: 'Mastodon',
      feedUrl: 'https://mastodon.social/@mastodon.rss',
      feedLimit: 4,
    },
  },
  {
    id: 'rss-youtube-channel',
    name: 'YouTube Channel',
    category: 'links',
    description: 'Latest uploads from a YouTube channel feed.',
    tags: ['youtube', 'video', 'rss', 'channel'],
    icon: '▶️',
    template: 'rss',
    config: {
      label: 'YouTube',
      feedUrl:
        'https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uZZ5fsM69wQ',
      feedLimit: 4,
    },
  },
  {
    id: 'rss-goodreads',
    name: 'Goodreads Shelf',
    category: 'information',
    description: 'Currently-reading shelf via Goodreads RSS (replace user ID).',
    tags: ['goodreads', 'books', 'rss', 'reading'],
    icon: '📚',
    template: 'rss',
    config: {
      label: 'Goodreads',
      feedUrl: 'https://www.goodreads.com/review/list_rss/1?shelf=currently-reading',
      feedLimit: 5,
    },
  },

  {
    id: 'poll-quick',
    name: 'Quick Poll',
    category: 'fun',
    description: 'Ask visitors a question — emoji votes, one per session.',
    tags: ['poll', 'vote', 'emoji', 'interactive'],
    icon: '🗳️',
    template: 'poll',
    config: {
      question: 'How is this wall?',
      options: JSON.stringify([
        { id: 'love', emoji: '🔥', label: 'Love it' },
        { id: 'ok', emoji: '👍', label: 'Good' },
        { id: 'wow', emoji: '🤯', label: 'Wow' },
      ]),
    },
  },
  {
    id: 'strava-recent',
    name: 'Strava Activities',
    category: 'health',
    description: 'Recent workouts via Strava API token.',
    tags: ['strava', 'fitness', 'running', 'cycling'],
    icon: '🏃',
    template: 'strava',
    config: { label: 'Recent activities' },
  },

  // ── Progress trackers (12) ─────────────────────────────────────────────────
  {
    id: 'progress-water',
    name: 'Water Intake',
    category: 'health',
    description: 'Track daily glasses of water — goal 8 per day.',
    tags: ['health', 'water', 'hydration', 'tracker'],
    icon: '💧',
    template: 'progress',
    config: { label: 'Water', value: 0, max: 8, unit: 'glasses' },
  },
  {
    id: 'progress-steps',
    name: 'Daily Steps',
    category: 'health',
    description: 'Step counter progress toward 10,000 steps.',
    tags: ['health', 'steps', 'fitness', 'tracker'],
    icon: '👟',
    template: 'progress',
    config: { label: 'Steps', value: 0, max: 10000, unit: 'steps' },
  },
  {
    id: 'progress-reading',
    name: 'Reading Goal',
    category: 'productivity',
    description: 'Pages read today toward your reading target.',
    tags: ['reading', 'books', 'goal', 'tracker'],
    icon: '📚',
    template: 'progress',
    config: { label: 'Pages Read', value: 0, max: 30, unit: 'pages' },
  },
  {
    id: 'progress-gym',
    name: 'Gym Sessions',
    category: 'health',
    description: 'Weekly gym session counter — 4 sessions per week.',
    tags: ['health', 'gym', 'fitness', 'tracker'],
    icon: '🏋️',
    template: 'progress',
    config: { label: 'Gym', value: 0, max: 4, unit: 'sessions' },
  },
  {
    id: 'progress-meditation',
    name: 'Meditation Minutes',
    category: 'health',
    description: 'Daily meditation timer — 20 minutes per day.',
    tags: ['health', 'meditation', 'mindfulness', 'tracker'],
    icon: '🧘',
    template: 'progress',
    config: { label: 'Meditation', value: 0, max: 20, unit: 'minutes' },
  },
  {
    id: 'progress-sleep',
    name: 'Sleep Hours',
    category: 'health',
    description: 'Track hours slept toward an 8-hour goal.',
    tags: ['health', 'sleep', 'rest', 'tracker'],
    icon: '😴',
    template: 'progress',
    config: { label: 'Sleep', value: 0, max: 8, unit: 'hours' },
  },
  {
    id: 'progress-calories',
    name: 'Calorie Budget',
    category: 'health',
    description: 'Daily calorie intake tracker with a 2,000 cal budget.',
    tags: ['health', 'calories', 'nutrition', 'tracker'],
    icon: '🍎',
    template: 'progress',
    config: { label: 'Calories', value: 0, max: 2000, unit: 'kcal' },
  },
  {
    id: 'progress-habits',
    name: 'Habit Streak',
    category: 'tracking',
    description: 'Daily habit completion streak counter.',
    tags: ['habits', 'streak', 'daily', 'tracker'],
    icon: '🔥',
    template: 'progress',
    config: { label: 'Habit Streak', value: 0, max: 30, unit: 'days' },
  },
  {
    id: 'progress-project',
    name: 'Project Milestones',
    category: 'tracking',
    description: 'Track completed milestones on your current project.',
    tags: ['project', 'milestones', 'work', 'tracker'],
    icon: '🎯',
    template: 'progress',
    config: { label: 'Milestones', value: 0, max: 10, unit: 'done' },
  },
  {
    id: 'progress-savings',
    name: 'Savings Goal',
    category: 'tracking',
    description: 'Progress toward a savings target.',
    tags: ['finance', 'savings', 'money', 'tracker'],
    icon: '💰',
    template: 'progress',
    config: { label: 'Savings', value: 0, max: 5000, unit: 'dollars' },
  },
  {
    id: 'progress-learning',
    name: 'Learning Hours',
    category: 'productivity',
    description: 'Hours spent learning this week — 10 hour goal.',
    tags: ['learning', 'education', 'skills', 'tracker'],
    icon: '🎓',
    template: 'progress',
    config: { label: 'Learning', value: 0, max: 10, unit: 'hours' },
  },
  {
    id: 'progress-screen-time',
    name: 'Screen Time',
    category: 'health',
    description: 'Monitor daily screen time — stay under 4 hours.',
    tags: ['health', 'screen-time', 'digital', 'tracker'],
    icon: '📱',
    template: 'progress',
    config: { label: 'Screen Time', value: 0, max: 240, unit: 'minutes' },
  },

  // ── Sound pads (6) ─────────────────────────────────────────────────────────
  {
    id: 'soundpad-rain',
    name: 'Rain Sound',
    category: 'music',
    description: 'Tap to play gentle rain ambience.',
    tags: ['sound', 'rain', 'ambient', 'relax'],
    icon: '🌧️',
    template: 'soundpad',
    config: { label: 'Rain', sound: 'rain' },
  },
  {
    id: 'soundpad-bell',
    name: 'Bell Chime',
    category: 'fun',
    description: 'Soft bell chime for notifications or transitions.',
    tags: ['sound', 'bell', 'chime', 'alert'],
    icon: '🔔',
    template: 'soundpad',
    config: { label: 'Bell', sound: 'bell' },
  },
  {
    id: 'soundpad-chime',
    name: 'Wind Chime',
    category: 'fun',
    description: 'Delicate wind chime sound effect.',
    tags: ['sound', 'chime', 'ambient', 'calm'],
    icon: '🎐',
    template: 'soundpad',
    config: { label: 'Wind Chime', sound: 'chime' },
  },
  {
    id: 'soundpad-success',
    name: 'Success Ding',
    category: 'fun',
    description: 'Satisfying success sound for completed tasks.',
    tags: ['sound', 'success', 'ding', 'celebration'],
    icon: '✅',
    template: 'soundpad',
    config: { label: 'Success', sound: 'success' },
  },
  {
    id: 'soundpad-notification',
    name: 'Notification Pop',
    category: 'productivity',
    description: 'Quick pop sound for reminders and alerts.',
    tags: ['sound', 'notification', 'alert', 'pop'],
    icon: '📣',
    template: 'soundpad',
    config: { label: 'Notification', sound: 'notification' },
  },
  {
    id: 'soundpad-applause',
    name: 'Applause',
    category: 'fun',
    description: 'Crowd applause for celebrating wins on your wall.',
    tags: ['sound', 'applause', 'celebration', 'fun'],
    icon: '👏',
    template: 'soundpad',
    config: { label: 'Applause', sound: 'applause' },
  },
  {
    id: 'soundpad-synth',
    name: 'Synth Pad',
    category: 'music',
    description: 'Four-note oscillator pad (C E G A).',
    tags: ['sound', 'synth', 'music', 'notes'],
    icon: '🎹',
    template: 'soundpad',
    config: { label: 'Synth Pad', frequency: 440, wave: 'sine' },
  },

  // ── QR codes (8) ─────────────────────────────────────────────────────────
  {
    id: 'qr-portfolio',
    name: 'Portfolio QR',
    category: 'links',
    description: 'QR code linking to your personal portfolio site.',
    tags: ['qr', 'portfolio', 'link', 'share'],
    icon: '📱',
    template: 'qr',
    config: { url: 'https://yourportfolio.dev' },
  },
  {
    id: 'qr-github',
    name: 'GitHub QR',
    category: 'links',
    description: 'QR code for your GitHub profile.',
    tags: ['qr', 'github', 'developer', 'share'],
    icon: '🐙',
    template: 'qr',
    config: { url: 'https://github.com/yourusername' },
  },
  {
    id: 'qr-linkedin',
    name: 'LinkedIn QR',
    category: 'links',
    description: 'QR code for your LinkedIn profile.',
    tags: ['qr', 'linkedin', 'professional', 'share'],
    icon: '💼',
    template: 'qr',
    config: { url: 'https://linkedin.com/in/yourprofile' },
  },
  {
    id: 'qr-twitter',
    name: 'X / Twitter QR',
    category: 'links',
    description: 'QR code for your X (Twitter) profile.',
    tags: ['qr', 'twitter', 'x', 'social'],
    icon: '🐦',
    template: 'qr',
    config: { url: 'https://x.com/yourhandle' },
  },
  {
    id: 'qr-instagram',
    name: 'Instagram QR',
    category: 'links',
    description: 'QR code for your Instagram profile.',
    tags: ['qr', 'instagram', 'social', 'share'],
    icon: '📸',
    template: 'qr',
    config: { url: 'https://instagram.com/yourhandle' },
  },
  {
    id: 'qr-youtube',
    name: 'YouTube QR',
    category: 'links',
    description: 'QR code for your YouTube channel.',
    tags: ['qr', 'youtube', 'video', 'share'],
    icon: '▶️',
    template: 'qr',
    config: { url: 'https://youtube.com/@yourchannel' },
  },
  {
    id: 'qr-discord',
    name: 'Discord Invite QR',
    category: 'links',
    description: 'QR code for your Discord server invite.',
    tags: ['qr', 'discord', 'community', 'share'],
    icon: '💬',
    template: 'qr',
    config: { url: 'https://discord.gg/yourinvite' },
  },
  {
    id: 'qr-calendly',
    name: 'Calendly QR',
    category: 'links',
    description: 'QR code for your scheduling link.',
    tags: ['qr', 'calendly', 'booking', 'meetings'],
    icon: '📅',
    template: 'qr',
    config: { url: 'https://calendly.com/yourname' },
  },

  // ── Link cards (8) ─────────────────────────────────────────────────────────
  {
    id: 'link-portfolio',
    name: 'Portfolio Link',
    category: 'links',
    description: 'Rich link card for your portfolio website.',
    tags: ['link', 'portfolio', 'website', 'card'],
    icon: '🌐',
    template: 'link',
    config: { url: 'https://yourportfolio.dev', title: 'My Portfolio' },
  },
  {
    id: 'link-github',
    name: 'GitHub Link',
    category: 'links',
    description: 'Link card pointing to your GitHub profile.',
    tags: ['link', 'github', 'developer', 'card'],
    icon: '🐙',
    template: 'link',
    config: { url: 'https://github.com/yourusername', title: 'GitHub' },
  },
  {
    id: 'link-linkedin',
    name: 'LinkedIn Link',
    category: 'links',
    description: 'Professional link card for LinkedIn.',
    tags: ['link', 'linkedin', 'professional', 'card'],
    icon: '💼',
    template: 'link',
    config: { url: 'https://linkedin.com/in/yourprofile', title: 'LinkedIn' },
  },
  {
    id: 'link-notion',
    name: 'Notion Link',
    category: 'links',
    description: 'Link card for a shared Notion page or wiki.',
    tags: ['link', 'notion', 'docs', 'card'],
    icon: '📝',
    template: 'link',
    config: { url: 'https://notion.so/yourpage', title: 'Notion Workspace' },
  },
  {
    id: 'link-figma',
    name: 'Figma Link',
    category: 'links',
    description: 'Link card for a Figma design file or prototype.',
    tags: ['link', 'figma', 'design', 'card'],
    icon: '🎨',
    template: 'link',
    config: { url: 'https://figma.com/file/yourfile', title: 'Figma Design' },
  },
  {
    id: 'link-docs',
    name: 'Documentation Link',
    category: 'links',
    description: 'Link card for project documentation or API docs.',
    tags: ['link', 'docs', 'documentation', 'card'],
    icon: '📖',
    template: 'link',
    config: { url: 'https://docs.example.com', title: 'Documentation' },
  },
  {
    id: 'link-blog',
    name: 'Blog Link',
    category: 'links',
    description: 'Link card for your personal or team blog.',
    tags: ['link', 'blog', 'writing', 'card'],
    icon: '✍️',
    template: 'link',
    config: { url: 'https://yourblog.com', title: 'My Blog' },
  },
  {
    id: 'link-resume',
    name: 'Resume Link',
    category: 'links',
    description: 'Link card for your online resume or CV.',
    tags: ['link', 'resume', 'cv', 'career'],
    icon: '📄',
    template: 'link',
    config: { url: 'https://yourresume.com', title: 'Resume / CV' },
  },

  // ── Social emoji links (10) ────────────────────────────────────────────────
  {
    id: 'emoji-twitter',
    name: 'X / Twitter',
    category: 'links',
    description: 'Clickable 𝕏 emoji linking to your X profile.',
    tags: ['emoji', 'twitter', 'x', 'social'],
    icon: '𝕏',
    template: 'emoji',
    config: { emoji: '𝕏', linkUrl: 'https://x.com/yourhandle' },
  },
  {
    id: 'emoji-instagram',
    name: 'Instagram',
    category: 'links',
    description: 'Clickable camera emoji linking to Instagram.',
    tags: ['emoji', 'instagram', 'social', 'photo'],
    icon: '📸',
    template: 'emoji',
    config: { emoji: '📸', linkUrl: 'https://instagram.com/yourhandle' },
  },
  {
    id: 'emoji-linkedin',
    name: 'LinkedIn',
    category: 'links',
    description: 'Clickable briefcase emoji linking to LinkedIn.',
    tags: ['emoji', 'linkedin', 'professional', 'social'],
    icon: '💼',
    template: 'emoji',
    config: { emoji: '💼', linkUrl: 'https://linkedin.com/in/yourprofile' },
  },
  {
    id: 'emoji-github',
    name: 'GitHub',
    category: 'links',
    description: 'Clickable octocat emoji linking to GitHub.',
    tags: ['emoji', 'github', 'developer', 'social'],
    icon: '🐙',
    template: 'emoji',
    config: { emoji: '🐙', linkUrl: 'https://github.com/yourusername' },
  },
  {
    id: 'emoji-youtube',
    name: 'YouTube',
    category: 'links',
    description: 'Clickable play button emoji linking to YouTube.',
    tags: ['emoji', 'youtube', 'video', 'social'],
    icon: '▶️',
    template: 'emoji',
    config: { emoji: '▶️', linkUrl: 'https://youtube.com/@yourchannel' },
  },
  {
    id: 'emoji-tiktok',
    name: 'TikTok',
    category: 'links',
    description: 'Clickable music note emoji linking to TikTok.',
    tags: ['emoji', 'tiktok', 'video', 'social'],
    icon: '🎵',
    template: 'emoji',
    config: { emoji: '🎵', linkUrl: 'https://tiktok.com/@yourhandle' },
  },
  {
    id: 'emoji-discord',
    name: 'Discord',
    category: 'links',
    description: 'Clickable speech bubble emoji linking to Discord.',
    tags: ['emoji', 'discord', 'community', 'social'],
    icon: '💬',
    template: 'emoji',
    config: { emoji: '💬', linkUrl: 'https://discord.gg/yourinvite' },
  },
  {
    id: 'emoji-twitch',
    name: 'Twitch',
    category: 'links',
    description: 'Clickable game controller emoji linking to Twitch.',
    tags: ['emoji', 'twitch', 'streaming', 'gaming'],
    icon: '🎮',
    template: 'emoji',
    config: { emoji: '🎮', linkUrl: 'https://twitch.tv/yourchannel' },
  },
  {
    id: 'emoji-reddit',
    name: 'Reddit',
    category: 'links',
    description: 'Clickable alien emoji linking to Reddit.',
    tags: ['emoji', 'reddit', 'community', 'social'],
    icon: '👽',
    template: 'emoji',
    config: { emoji: '👽', linkUrl: 'https://reddit.com/u/yourusername' },
  },
  {
    id: 'emoji-bluesky',
    name: 'Bluesky',
    category: 'links',
    description: 'Clickable butterfly emoji linking to Bluesky.',
    tags: ['emoji', 'bluesky', 'social', 'fediverse'],
    icon: '🦋',
    template: 'emoji',
    config: { emoji: '🦋', linkUrl: 'https://bsky.app/profile/yourhandle' },
  },

  // ── Polaroid placeholders (6) ──────────────────────────────────────────────
  {
    id: 'polaroid-vacation',
    name: 'Vacation Polaroid',
    category: 'images',
    description: 'Polaroid frame placeholder for a vacation snapshot.',
    tags: ['polaroid', 'photo', 'vacation', 'travel'],
    icon: '🏝️',
    template: 'polaroid',
    config: { caption: 'Summer vibes ✨', src: '' },
  },
  {
    id: 'polaroid-family',
    name: 'Family Polaroid',
    category: 'images',
    description: 'Polaroid frame for a family photo.',
    tags: ['polaroid', 'photo', 'family', 'memories'],
    icon: '👨‍👩‍👧',
    template: 'polaroid',
    config: { caption: 'Family time', src: '' },
  },
  {
    id: 'polaroid-pets',
    name: 'Pet Polaroid',
    category: 'images',
    description: 'Polaroid frame for your furry friend.',
    tags: ['polaroid', 'photo', 'pets', 'cute'],
    icon: '🐾',
    template: 'polaroid',
    config: { caption: 'Best buddy 🐶', src: '' },
  },
  {
    id: 'polaroid-team',
    name: 'Team Polaroid',
    category: 'images',
    description: 'Polaroid frame for a team or group photo.',
    tags: ['polaroid', 'photo', 'team', 'work'],
    icon: '👥',
    template: 'polaroid',
    config: { caption: 'The dream team', src: '' },
  },
  {
    id: 'polaroid-milestone',
    name: 'Milestone Polaroid',
    category: 'images',
    description: 'Polaroid frame celebrating a milestone moment.',
    tags: ['polaroid', 'photo', 'milestone', 'celebration'],
    icon: '🏆',
    template: 'polaroid',
    config: { caption: 'We did it!', src: '' },
  },
  {
    id: 'polaroid-memory',
    name: 'Memory Polaroid',
    category: 'images',
    description: 'Blank polaroid for any cherished memory.',
    tags: ['polaroid', 'photo', 'memory', 'nostalgia'],
    icon: '📷',
    template: 'polaroid',
    config: { caption: 'A moment to remember', src: '' },
  },

  // ── Sticky note variants (8) — pads catalog to exactly 100 ─────────────────
  {
    id: 'sticky-todo',
    name: 'To-Do Sticky',
    category: 'productivity',
    description: 'Yellow sticky note for daily to-do items.',
    tags: ['sticky', 'todo', 'tasks', 'list'],
    icon: '📋',
    template: 'sticky',
    config: { text: '☐ Task one\n☐ Task two\n☐ Task three', color: 'yellow' },
  },
  {
    id: 'sticky-ideas',
    name: 'Ideas Sticky',
    category: 'productivity',
    description: 'Light-blue sticky for brainstorming ideas.',
    tags: ['sticky', 'ideas', 'brainstorm', 'creative'],
    icon: '💡',
    template: 'sticky',
    config: { text: '💡 New idea goes here…', color: 'light-blue' },
  },
  {
    id: 'sticky-quote',
    name: 'Quote Sticky',
    category: 'fun',
    description: 'Sticky note displaying an inspirational quote.',
    tags: ['sticky', 'quote', 'inspiration', 'motivation'],
    icon: '✨',
    template: 'sticky',
    config: { text: '"The best way to predict the future is to create it."', color: 'light-violet' },
  },
  {
    id: 'sticky-reminder',
    name: 'Reminder Sticky',
    category: 'productivity',
    description: 'Orange sticky for important reminders.',
    tags: ['sticky', 'reminder', 'alert', 'important'],
    icon: '⏰',
    template: 'sticky',
    config: { text: '⚠️ Don\'t forget!', color: 'orange' },
  },
  {
    id: 'sticky-meeting',
    name: 'Meeting Notes Sticky',
    category: 'productivity',
    description: 'Sticky for jotting down meeting notes.',
    tags: ['sticky', 'meeting', 'notes', 'work'],
    icon: '🗒️',
    template: 'sticky',
    config: { text: 'Meeting notes:\n• Agenda item\n• Action items', color: 'light-green' },
  },
  {
    id: 'sticky-shopping',
    name: 'Shopping List Sticky',
    category: 'productivity',
    description: 'Sticky note for a quick shopping list.',
    tags: ['sticky', 'shopping', 'list', 'groceries'],
    icon: '🛒',
    template: 'sticky',
    config: { text: '🛒 Milk\n🥚 Eggs\n🍞 Bread', color: 'yellow' },
  },
  {
    id: 'sticky-gratitude',
    name: 'Gratitude Sticky',
    category: 'health',
    description: 'Daily gratitude journal sticky note.',
    tags: ['sticky', 'gratitude', 'journal', 'wellness'],
    icon: '🙏',
    template: 'sticky',
    config: { text: 'Today I\'m grateful for…', color: 'light-green' },
  },
  {
    id: 'sticky-goals',
    name: 'Goals Sticky',
    category: 'productivity',
    description: 'Sticky for writing down weekly or monthly goals.',
    tags: ['sticky', 'goals', 'planning', 'targets'],
    icon: '🎯',
    template: 'sticky',
    config: { text: '🎯 This week\'s goals:\n1.\n2.\n3.', color: 'light-red' },
  },
  // ── Extended library (115+) ─────────────────────────────────────────────
  {
    id: 'clock-dubai',
    name: 'Dubai Clock',
    category: 'information',
    description: 'Gulf Standard Time flip clock.',
    tags: ['clock', 'dubai', 'uae', 'time'],
    icon: '🏙️',
    template: 'clock',
    config: { location: 'Dubai, UAE', timezone: 'Asia/Dubai' },
  },
  {
    id: 'clock-mumbai',
    name: 'Mumbai Clock',
    category: 'information',
    description: 'India Standard Time flip clock.',
    tags: ['clock', 'mumbai', 'india', 'time'],
    icon: '🇮🇳',
    template: 'clock',
    config: { location: 'Mumbai, India', timezone: 'Asia/Kolkata' },
  },
  {
    id: 'clock-singapore',
    name: 'Singapore Clock',
    category: 'information',
    description: 'Singapore time flip clock.',
    tags: ['clock', 'singapore', 'time'],
    icon: '🇸🇬',
    template: 'clock',
    config: { location: 'Singapore', timezone: 'Asia/Singapore' },
  },
  {
    id: 'weather-berlin',
    name: 'Berlin Weather',
    category: 'information',
    description: 'Current weather for Berlin.',
    tags: ['weather', 'berlin', 'germany'],
    icon: '🇩🇪',
    template: 'weather',
    config: { city: 'Berlin', units: 'metric' },
  },
  {
    id: 'weather-toronto',
    name: 'Toronto Weather',
    category: 'information',
    description: 'Current weather for Toronto.',
    tags: ['weather', 'toronto', 'canada'],
    icon: '🍁',
    template: 'weather',
    config: { city: 'Toronto', units: 'metric' },
  },
  {
    id: 'github-trending',
    name: 'GitHub Trending',
    category: 'coding',
    description: 'Placeholder for trending repos this week.',
    tags: ['github', 'trending', 'open source'],
    icon: '📈',
    template: 'github',
    config: { username: 'trending', repo: 'week' },
  },
  {
    id: 'progress-reading',
    name: 'Reading Progress',
    category: 'tracking',
    description: 'Track pages or chapters read.',
    tags: ['progress', 'books', 'reading'],
    icon: '📖',
    template: 'progress',
    config: { label: 'Reading', value: 42, max: 100 },
  },
  {
    id: 'progress-hydration',
    name: 'Hydration Tracker',
    category: 'health',
    description: 'Glasses of water today.',
    tags: ['water', 'health', 'habit'],
    icon: '💧',
    template: 'progress',
    config: { label: 'Water', value: 5, max: 8 },
  },
  {
    id: 'qr-wifi',
    name: 'Wi‑Fi QR',
    category: 'links',
    description: 'QR code placeholder for guest Wi‑Fi.',
    tags: ['qr', 'wifi', 'guest'],
    icon: '📶',
    template: 'qr',
    config: { label: 'Join Wi‑Fi', url: 'WIFI:S:Guest;T:WPA;P:password;;' },
  },
  {
    id: 'link-newsletter',
    name: 'Newsletter Signup',
    category: 'links',
    description: 'Link card for email list signup.',
    tags: ['link', 'newsletter', 'subscribe'],
    icon: '✉️',
    template: 'link',
    config: { title: 'Newsletter', url: 'https://example.com/subscribe' },
  },
  {
    id: 'polaroid-travel',
    name: 'Travel Polaroid',
    category: 'images',
    description: 'Polaroid frame for trip photos.',
    tags: ['polaroid', 'travel', 'photo'],
    icon: '✈️',
    template: 'polaroid',
    config: { caption: 'Summer 2026', imageUrl: '' },
  },
  {
    id: 'sticky-ideas',
    name: 'Ideas Backlog',
    category: 'productivity',
    description: 'Capture quick ideas before they vanish.',
    tags: ['sticky', 'ideas', 'brainstorm'],
    icon: '💡',
    template: 'sticky',
    config: { text: '💡 Ideas:\n• \n• ', color: 'light-violet' },
  },
  {
    id: 'sticky-meeting',
    name: 'Meeting Notes',
    category: 'productivity',
    description: 'Agenda + notes sticky for calls.',
    tags: ['sticky', 'meeting', 'notes'],
    icon: '📋',
    template: 'sticky',
    config: { text: '📋 Meeting\nAttendees:\nNotes:', color: 'light-blue' },
  },
  // ── Mega pack (140+) ─────────────────────────────────────────────────────
  { id: 'clock-chicago', name: 'Chicago Clock', category: 'information', description: 'Central Time flip clock.', tags: ['clock', 'chicago', 'usa'], icon: '🌆', template: 'clock', config: { location: 'Chicago, IL', timezone: 'America/Chicago' } },
  { id: 'clock-denver', name: 'Denver Clock', category: 'information', description: 'Mountain Time flip clock.', tags: ['clock', 'denver'], icon: '🏔️', template: 'clock', config: { location: 'Denver, CO', timezone: 'America/Denver' } },
  { id: 'clock-sao-paulo', name: 'São Paulo Clock', category: 'information', description: 'Brazil time flip clock.', tags: ['clock', 'brazil'], icon: '🇧🇷', template: 'clock', config: { location: 'São Paulo', timezone: 'America/Sao_Paulo' } },
  { id: 'clock-seoul', name: 'Seoul Clock', category: 'information', description: 'Korea Standard Time.', tags: ['clock', 'seoul', 'korea'], icon: '🇰🇷', template: 'clock', config: { location: 'Seoul', timezone: 'Asia/Seoul' } },
  { id: 'clock-hong-kong', name: 'Hong Kong Clock', category: 'information', description: 'HKT flip clock.', tags: ['clock', 'hong kong'], icon: '🏙️', template: 'clock', config: { location: 'Hong Kong', timezone: 'Asia/Hong_Kong' } },
  { id: 'clock-amsterdam', name: 'Amsterdam Clock', category: 'information', description: 'CET flip clock.', tags: ['clock', 'amsterdam'], icon: '🇳🇱', template: 'clock', config: { location: 'Amsterdam', timezone: 'Europe/Amsterdam' } },
  { id: 'weather-miami', name: 'Miami Weather', category: 'information', description: 'Weather for Miami, FL.', tags: ['weather', 'miami'], icon: '🌴', template: 'weather', config: { city: 'Miami', units: 'imperial' } },
  { id: 'weather-seoul', name: 'Seoul Weather', category: 'information', description: 'Weather for Seoul.', tags: ['weather', 'seoul'], icon: '🇰🇷', template: 'weather', config: { city: 'Seoul', units: 'metric' } },
  { id: 'weather-sydney-w', name: 'Sydney Weather', category: 'information', description: 'Weather for Sydney, AU.', tags: ['weather', 'sydney'], icon: '🇦🇺', template: 'weather', config: { city: 'Sydney', units: 'metric' } },
  { id: 'weather-mexico', name: 'Mexico City Weather', category: 'information', description: 'Weather for CDMX.', tags: ['weather', 'mexico'], icon: '🇲🇽', template: 'weather', config: { city: 'Mexico City', units: 'metric' } },
  { id: 'github-opensource', name: 'Open Source Repo', category: 'coding', description: 'Showcase a public repository.', tags: ['github', 'repo'], icon: '📦', template: 'github', config: { username: 'octocat', repo: 'Hello-World' } },
  { id: 'github-forks', name: 'Fork Counter', category: 'coding', description: 'Repo with fork stats placeholder.', tags: ['github', 'forks'], icon: '🍴', template: 'github', config: { username: 'vercel', repo: 'next.js' } },
  { id: 'progress-savings', name: 'Savings Goal', category: 'tracking', description: 'Track savings toward a target.', tags: ['money', 'savings'], icon: '💰', template: 'progress', config: { label: 'Savings', value: 3200, max: 10000 } },
  { id: 'progress-workout', name: 'Workout Week', category: 'health', description: 'Sessions completed this week.', tags: ['fitness', 'gym'], icon: '🏋️', template: 'progress', config: { label: 'Workouts', value: 3, max: 5 } },
  { id: 'progress-project', name: 'Project %', category: 'tracking', description: 'Sprint or project completion.', tags: ['project', 'sprint'], icon: '📊', template: 'progress', config: { label: 'Sprint', value: 68, max: 100 } },
  { id: 'soundpad-drum', name: 'Drum Hit', category: 'fun', description: 'Percussion sound pad.', tags: ['sound', 'drum'], icon: '🥁', template: 'soundpad', config: { label: 'Drum', sound: 'drum' } },
  { id: 'soundpad-success', name: 'Success Chime', category: 'fun', description: 'Positive feedback sound.', tags: ['sound', 'success'], icon: '✅', template: 'soundpad', config: { label: 'Success', sound: 'success' } },
  { id: 'soundpad-error', name: 'Error Buzz', category: 'fun', description: 'Error / fail sound.', tags: ['sound', 'error'], icon: '❌', template: 'soundpad', config: { label: 'Error', sound: 'error' } },
  { id: 'soundpad-laugh', name: 'Laugh Track', category: 'fun', description: 'Comedy laugh pad.', tags: ['sound', 'funny'], icon: '😂', template: 'soundpad', config: { label: 'Laugh', sound: 'laugh' } },
  { id: 'qr-contact', name: 'Contact QR', category: 'links', description: 'vCard / contact QR placeholder.', tags: ['qr', 'contact'], icon: '👤', template: 'qr', config: { label: 'Add contact', url: 'https://example.com/contact.vcf' } },
  { id: 'qr-calendar', name: 'Calendar QR', category: 'links', description: 'Link to booking page.', tags: ['qr', 'calendar'], icon: '📅', template: 'qr', config: { label: 'Book a call', url: 'https://cal.com' } },
  { id: 'link-youtube', name: 'YouTube Channel', category: 'links', description: 'Link card for YouTube.', tags: ['youtube', 'video'], icon: '▶️', template: 'link', config: { title: 'YouTube', url: 'https://youtube.com' } },
  { id: 'link-portfolio', name: 'Portfolio', category: 'links', description: 'Personal site link card.', tags: ['portfolio', 'website'], icon: '🌐', template: 'link', config: { title: 'My portfolio', url: 'https://example.com' } },
  { id: 'link-calendly', name: 'Book a call', category: 'links', description: 'Scheduling link card.', tags: ['calendly', 'meet'], icon: '📆', template: 'link', config: { title: 'Book a call', url: 'https://calendly.com' } },
  { id: 'polaroid-wedding', name: 'Wedding Polaroid', category: 'images', description: 'Polaroid for wedding photos.', tags: ['wedding', 'photo'], icon: '💒', template: 'polaroid', config: { caption: 'Just married', imageUrl: '' } },
  { id: 'polaroid-pet', name: 'Pet Polaroid', category: 'images', description: 'Cute pet photo frame.', tags: ['pet', 'dog', 'cat'], icon: '🐾', template: 'polaroid', config: { caption: 'Best friend', imageUrl: '' } },
  { id: 'sticky-todo', name: 'Todo List', category: 'productivity', description: 'Checkbox-style todo sticky.', tags: ['todo', 'tasks'], icon: '☑️', template: 'sticky', config: { text: '☐ Task 1\n☐ Task 2\n☐ Task 3', color: 'yellow' } },
  { id: 'sticky-quote', name: 'Quote Sticky', category: 'productivity', description: 'Inspirational quote note.', tags: ['quote', 'inspiration'], icon: '💬', template: 'sticky', config: { text: '"Your quote here"', color: 'light-violet' } },
  { id: 'sticky-deadline', name: 'Deadline', category: 'productivity', description: 'Due date reminder sticky.', tags: ['deadline', 'urgent'], icon: '⏰', template: 'sticky', config: { text: '⏰ Due: Friday', color: 'light-red' } },
  { id: 'sticky-brainstorm', name: 'Brainstorm', category: 'productivity', description: 'Free-form idea cloud.', tags: ['brainstorm', 'ideas'], icon: '🧠', template: 'sticky', config: { text: 'Brainstorm:\n• \n• \n• ', color: 'light-green' } },
  { id: 'sticky-password', name: 'Reminder', category: 'productivity', description: 'Private reminder (no real secrets!).', tags: ['reminder', 'note'], icon: '🔐', template: 'sticky', config: { text: 'Reminder: rotate keys', color: 'orange' } },
]

const VALID_CATEGORIES = new Set<CatalogWidgetCategory>(
  WIDGET_CATEGORIES.map((c) => c.id),
)

const VALID_TEMPLATES = new Set<CatalogWidgetTemplate>([
  'clock',
  'weather',
  'spotify',
  'github',
  'progress',
  'soundpad',
  'qr',
  'link',
  'emoji',
  'polaroid',
  'sticky',
])

export function searchCatalogWidgets(query: string, category?: CatalogWidgetCategory): CatalogWidget[] {
  const q = query.trim().toLowerCase()
  let results = WIDGET_CATALOG

  if (category) {
    results = results.filter((w) => w.category === category)
  }

  if (!q) return results

  return results.filter(
    (w) =>
      w.name.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.template.toLowerCase().includes(q) ||
      w.tags.some((t) => t.toLowerCase().includes(q)),
  )
}

export type ImportedWidgetFile = {
  version: 1
  format: 'wallwidget'
  widget: CatalogWidget
  exportedAt?: string
  author?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseCatalogWidget(raw: unknown): CatalogWidget {
  if (!isRecord(raw)) {
    throw new Error('Invalid widget: expected an object')
  }

  const { id, name, category, description, tags, icon, template, config } = raw

  if (typeof id !== 'string' || !id.trim()) {
    throw new Error('Invalid widget: id must be a non-empty string')
  }
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Invalid widget: name must be a non-empty string')
  }
  if (typeof category !== 'string' || !VALID_CATEGORIES.has(category as CatalogWidgetCategory)) {
    throw new Error(`Invalid widget: unknown category "${String(category)}"`)
  }
  if (typeof description !== 'string') {
    throw new Error('Invalid widget: description must be a string')
  }
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
    throw new Error('Invalid widget: tags must be an array of strings')
  }
  if (typeof icon !== 'string' || !icon.trim()) {
    throw new Error('Invalid widget: icon must be a non-empty string')
  }
  if (typeof template !== 'string' || !VALID_TEMPLATES.has(template as CatalogWidgetTemplate)) {
    throw new Error(`Invalid widget: unknown template "${String(template)}"`)
  }

  let parsedConfig: CatalogWidgetConfig | undefined
  if (config !== undefined) {
    if (!isRecord(config)) {
      throw new Error('Invalid widget: config must be an object')
    }
    parsedConfig = {}
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        parsedConfig[key] = value
      }
    }
  }

  return {
    id: id.trim(),
    name: name.trim(),
    category: category as CatalogWidgetCategory,
    description,
    tags,
    icon: icon.trim(),
    template: template as CatalogWidgetTemplate,
    ...(parsedConfig ? { config: parsedConfig } : {}),
  }
}

/** Parse a `.wallwidget` JSON file exported from the desktop app. */
export function parseWidgetFile(raw: string | unknown): ImportedWidgetFile {
  let data: unknown
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      throw new Error('Invalid widget file: not valid JSON')
    }
  } else {
    data = raw
  }

  if (!isRecord(data)) {
    throw new Error('Invalid widget file: expected a JSON object')
  }

  const format = data.format
  if (format !== undefined && format !== 'wallwidget') {
    throw new Error(`Invalid widget file: unsupported format "${String(format)}"`)
  }

  const version = data.version
  if (version !== undefined && version !== 1) {
    throw new Error(`Invalid widget file: unsupported version ${String(version)}`)
  }

  const widgetSource = data.widget ?? data
  const widget = parseCatalogWidget(widgetSource)

  const result: ImportedWidgetFile = {
    version: 1,
    format: 'wallwidget',
    widget,
  }

  if (typeof data.exportedAt === 'string') {
    result.exportedAt = data.exportedAt
  }
  if (typeof data.author === 'string') {
    result.author = data.author
  }

  return result
}
