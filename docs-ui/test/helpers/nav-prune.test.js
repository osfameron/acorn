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
    content: 'Distributed Docs',
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
            content: 'Overriding the url',
            url: '/acorn/misc/renaming/override-url.html',
          },
        ],
      },
    ],
  },
]

const { traverse, simplifyNav } = require('../../src/helpers/nav-prune.js')

// helper function to show just paths to .selected items.
function marks (items) {
  return items.flatMap((item) => {
    if (!item.selected) return []
    return [[item.content, ...marks(item.items)]]
  })
}

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
  assert.deepEqual(
    marks(simplifyNav(nav, '/acorn/intro/intro.html')),
    [
      [
        undefined, // opening run has no content
        ['Introduction'],
        ['AI Statement'],
      ],
    ]
  )
})

test('simplifyNav 2', () => {
  assert.deepEqual(
    marks(simplifyNav(nav, '/acorn/intro/ai-statement.html')),
    [
      [
        undefined,
        ['Introduction'],
        ['AI Statement'],
      ],
      ['Distributed Docs',
        ['The Playbook'],
      ],
    ]
  )
})

test('simplifyNav 3', () => {
  assert.deepEqual(
    marks(simplifyNav(nav, '/acorn/playbook/intro.html')),
    [
      [
        undefined,
        ['AI Statement'],
      ],
      ['Distributed Docs',
        ['The Playbook'],
      ],
      ['Some classic problems',
        ['Renaming things'],
      ],
    ]
  )
})

test('simplifyNav at end', () => {
  assert.deepEqual(
    marks(simplifyNav(nav, '/acorn/misc/renaming/override-url.html')),
    [
      ['Some classic problems',
        ['Renaming things',
          ['page-aliases'],
          ['Overriding the url'],
        ],
      ],
    ]
  )
})

test('simplifyNav with no match returns full nav', () => {
  assert.deepEqual(simplifyNav(nav, '/not-found.html'), nav)
})
