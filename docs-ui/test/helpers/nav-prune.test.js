// test/navigation.test.js
const { test } = require('node:test')
const assert = require('node:assert/strict')

const nav = [
  {
    items: [
      {
        content: 'Introduction',
        url: '/acorn/intro/intro.html',
        // some additional properties, just to check that these aren't stripped
        urlType: 'internal',
        roles: ['page'],
      },
      {
        content: 'AI Statement',
        url: '/acorn/intro/ai-statement.html',
      },
    ],
  },
  {
    content: 'Distributed Docs.',
    items: [
      {
        content: 'The Playbook',
        url: '/acorn/playbook/intro.html',
        items: [
          { content: 'Heading 1 with no url' },
          { content: 'Heading 2 with no url' },
          { content: 'Heading 3 with no url' },
        ],
      },
    ],
  },
  {
    content: 'Some classic problems',
    items: [
      {
        content: 'Renaming things',
        url: '/acorn/misc/renaming.html',
        items: [
          {
            content: 'page-aliases',
            url: '/acorn/misc/renaming/page-aliases.html',
          },
          {
            content: 'overriding the url component',
            url: '/acorn/misc/renaming/override-url.html',
          },
        ],
      },
    ],
  },
]

const { traverse, simplifyNav } = require('../../src/helpers/nav-prune.js')

test('traverse finds all nodes with .url', () => {
  const entries = Array.from(traverse(nav))

  assert.deepEqual(entries.map((e) => e.url), [
    '/acorn/intro/intro.html',
    '/acorn/intro/ai-statement.html',
    '/acorn/playbook/intro.html',
    '/acorn/misc/renaming.html',
    '/acorn/misc/renaming/page-aliases.html',
    '/acorn/misc/renaming/override-url.html',
  ])
})

test('simplifyNav at beginning', () => {
  assert.deepEqual(simplifyNav(nav, '/acorn/intro/intro.html'), [
    {
      items: [
        {
          content: 'Introduction',
          current: true,
          items: [],
          roles: ['page'],
          selected: true,
          url: '/acorn/intro/intro.html',
          urlType: 'internal',
        },
        {
          content: 'AI Statement',
          items: [],
          selected: true,
          url: '/acorn/intro/ai-statement.html',
        },
      ],
      selected: true,
    },
  ])
})

test('simplifyNav 2', () => {
  assert.deepEqual(simplifyNav(nav, '/acorn/intro/ai-statement.html'), [
    {
      items: [
        {
          content: 'Introduction',
          items: [],
          roles: ['page'],
          selected: true,
          url: '/acorn/intro/intro.html',
          urlType: 'internal',
        },
        {
          content: 'AI Statement',
          current: true,
          items: [],
          selected: true,
          url: '/acorn/intro/ai-statement.html',
        },
      ],
      selected: true,
    },
    {
      content: 'Distributed Docs.',
      items: [
        {
          content: 'The Playbook',
          items: [],
          selected: true,
          url: '/acorn/playbook/intro.html',
        },
      ],
      selected: true,
    },
  ])
})

test('simplifyNav 3', () => {
  assert.deepEqual(simplifyNav(nav, '/acorn/playbook/intro.html'), [
    {
      items: [
        {
          content: 'AI Statement',
          items: [],
          selected: true,
          url: '/acorn/intro/ai-statement.html',
        },
      ],
      selected: true,
    },
    {
      content: 'Distributed Docs.',
      items: [
        {
          content: 'The Playbook',
          current: true,
          items: [],
          selected: true,
          url: '/acorn/playbook/intro.html',
        },
      ],
      selected: true,
    },
    {
      content: 'Some classic problems',
      items: [
        {
          content: 'Renaming things',
          items: [],
          selected: true,
          url: '/acorn/misc/renaming.html',
        },
      ],
      selected: true,
    },
  ])
})

test('simplifyNav at end', () => {
  assert.deepEqual(simplifyNav(nav, '/acorn/misc/renaming/override-url.html'), [
    {
      content: 'Some classic problems',
      selected: true,
      items: [
        {
          content: 'Renaming things',
          selected: true,
          url: '/acorn/misc/renaming.html',
          items: [
            {
              content: 'page-aliases',
              items: [],
              selected: true,
              url: '/acorn/misc/renaming/page-aliases.html',
            },
            {
              content: 'overriding the url component',
              current: true,
              items: [],
              selected: true,
              url: '/acorn/misc/renaming/override-url.html',
            },
          ],
        },
      ],
    },
  ])
})

test('simplifyNav with no match returns full nav', () => {
  assert.deepEqual(simplifyNav(nav, '/not-found.html'), nav)
})
