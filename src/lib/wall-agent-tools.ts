/** Tool definitions shared conceptually with server/ai.ts — OpenAI function schemas */
export const WALL_AGENT_TOOL_SCHEMAS = [
  {
    type: 'function' as const,
    function: {
      name: 'add_sticky',
      description: 'Add a sticky note to the wall canvas',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Sticky note text' },
          color: {
            type: 'string',
            enum: ['yellow', 'light-green', 'light-blue', 'light-violet', 'light-red', 'orange'],
          },
          x: { type: 'number', description: 'X position on canvas (0-1600)' },
          y: { type: 'number', description: 'Y position on canvas (0-1000)' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_text',
      description: 'Add a large text heading block',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string' },
          size: { type: 'string', enum: ['s', 'm', 'l', 'xl'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_link',
      description: 'Add a link card or embed (YouTube, Spotify, GitHub, etc.)',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_emoji',
      description: 'Add a large emoji sticker',
      parameters: {
        type: 'object',
        properties: { emoji: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['emoji'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_qr',
      description: 'Generate a QR code for a URL',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_widget',
      description: 'Add a live widget (clock, weather, spotify, github)',
      parameters: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['clock', 'weather', 'spotify', 'github'] },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_theme',
      description: 'Change the wall background theme',
      parameters: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: ['corkboard', 'whiteboard', 'glass', 'fridge', 'locker', 'notebook', 'black', 'white'],
          },
        },
        required: ['theme'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'fit_wall',
      description: 'Zoom camera to fit the entire wall in view',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'delete_selected',
      description: 'Delete currently selected shapes on the canvas',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'auto_arrange',
      description: 'Auto-arrange all canvas elements into a clean 3-column grid layout',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_wall_title',
      description: 'Set the wall board title shown in the header',
      parameters: {
        type: 'object',
        properties: { title: { type: 'string' } },
        required: ['title'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_embed',
      description: 'Add an iframe embed (YouTube, Spotify, etc.)',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_image_url',
      description: 'Add an image from a public URL (must allow CORS)',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_gif',
      description: 'Add an animated GIF from a URL',
      parameters: {
        type: 'object',
        properties: { url: { type: 'string' }, x: { type: 'number' }, y: { type: 'number' } },
        required: ['url'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_wall',
      description: 'Remove all elements from the canvas (keeps the background frame). Use when rebuilding from scratch.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

export type AgentToolCall = { id: string; name: string; arguments: Record<string, unknown> }
