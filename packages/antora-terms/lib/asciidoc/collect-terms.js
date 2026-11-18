/** Asciidoc extension to gather indexterms
 * 
 * See https://docs.asciidoctor.org/asciidoc/latest/sections/user-index/
 * 
 * This is documented to not work with the HTML export.
 * 
 * We can write flow (visible) or invisible terms:
 * 
 *    This is a ((term)) in the document.
 *    Also known as an (((term))) indexterm, 
 */

const identity = (a) => a

function register (
  registry,
  context,
  { transform = identity, records = [] } = {}) {

  registry.treeProcessor(function () {
    this.process(function (doc) {
      const converter = doc.getConverter()
      const original = converter.$convert_inline_indexterm

      // override the index term conversion
      converter.$convert_inline_indexterm = function (n) {

        const originalText = n.getText()
        const node = transform(n)
        const text = node.getText()

        // The source location will be populated if asciidoc.sourcemap = true
        const {file, lineno} = node.getParent().getSourceLocation() || {}
        const location = file && { location: { file, lineno }}

        const terms = node.getAttribute('terms')
        const visible = node.getType() === 'visible'

        const record = {
          visible,
          text,
          originalText,
          terms,
          location,
          context: {
            file: {
               pub: {
                 url: context.file.pub.url
               },
               src: context.file.src
            }
          }
        }

        records.push(record)

        return original.call(this, node) 
          // e.g. "" or "term" but might have side-effects
      }

      return doc
    })
  })
}



module.exports = { register }