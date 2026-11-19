'use strict'

module.exports = (thing) => {
  return `<pre style="font-size: 5pt"> ${JSON.stringify(thing, null, 2)} </pre>`
}
