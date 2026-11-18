const collectTerms = require('./asciidoc/collect-terms.js')

module.exports.register = function ({ config }) {
  const records = []

  // case-preserving with a case insensitive fallback 
  const styles = config.data?.styles || {}
  const lower = Object.fromEntries(
    Object.entries(styles)
        .map(([k,v]) => [k.toLocaleLowerCase(), v]))
  const combinedStyles = {...lower, ...styles}

  function transform (node) {
    const orig = node.getText()
    if (! orig) { return node}

    const stylised = combinedStyles[orig] || combinedStyles[orig.toLocaleLowerCase()]

    node.text = stylised ?
        node.getParent().applySubstitutions(
            stylised,
            ['specialcharacters', 'quotes']) : orig

    return node
  }

  this.on('beforeProcess', ({ siteAsciiDocConfig }) => {
    siteAsciiDocConfig.sourcemap = true
    const extensions = siteAsciiDocConfig.extensions ??= []

    extensions.push({
      register(registry, context) {
        collectTerms.register(registry, context, { transform, records })
      },
    })
  })

  this.on('documentsConverted', () => {
    console.dir(records, { depth: 4})
  })
}