function * traverse (items) {
  for (const item of items) {
    if (item.url) {
      yield item
    }
    if (item.items) {
      yield * traverse(item.items)
    }
  }
}

// draw `selected` and `current` up their paths to the root
function percolate (items) {
  return items.map((item) => {
    item.items = percolate(item.items || [])
    const selected = item.items.find((item) => item.selected)
    if (selected) {
      item.selected = true
      item.current = selected.current
    }
    return item
  })
}

// given a nav, return a copy with only prev/curr/next entries, and the paths leading to them
function simplifyNav (origNav, current, prune = false) {
  // we will mutate the structure internally, so work on a copy
  const nav = structuredClone(origNav)
  const entries = Array.from(traverse(nav))

  const currentIndex = entries.findIndex(
    ({ url }) => url === current)

  if (currentIndex === -1) { return origNav }
  entries[currentIndex].current = true

  for (const pos of [-1, 0, 1]) {
    const entry = entries[currentIndex + pos]
    if (entry) {
      entry.selected = true
    }
  }

  return percolate(nav)
}

// Antora handlebars helpers expect a single function exported
module.exports = simplifyNav

// but we also want to export individual functions for testing
module.exports.simplifyNav = simplifyNav
module.exports.traverse = traverse
module.exports.percolate = percolate
