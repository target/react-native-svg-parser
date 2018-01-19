import { DOMParser } from 'xmldom'
import cssParse from 'css-parse-no-fs'
import converter from './converter'

/**
 * 2nd argument can be a set of config elements passed to domParser e.g.:
 * {
 *    domParser: {
 *      errorHandler: {
 *        warning: function(w){console.warn(w)}
 *      }
 *    }
 * }
 * This defaults to empty object. Check this link for options you can pass:
 * https://github.com/jindw/xmldom#api-reference
 *
 * @param String svgString
 * @param Object param1
 */
function parseSvg (svgString, opts) {
  return (new DOMParser(opts))
    .parseFromString(svgString, 'image/svg+xml')
}

/**
 * Takes in a string and returns CSS AST
 *
 * This is the parse method of this library:
 * https://github.com/reworkcss/css#api
 *
 * @param String cssString
 */
function makeCssAst (cssString) {
  if (!cssString) {
    return null
  }
  return cssParse(cssString)
}

/**
 *
 * Returns SVG object from a dom + config params
 *
 * @param Element svgDom
 * @param CssAst cssAst
 * @param Object config
 */
function convertSvg (svgDom, cssAst, config) {
  return converter(svgDom, cssAst, config)
}

export { parseSvg, makeCssAst, convertSvg }

/**
 * svgString is an XML SVG string
 *
 * config should include width, height, and css, as an optional param which is a CSS stylesheet as a string.
 *
 * @param String svgString
 * @param Object config
 */
export default (svgString, cssString, config = {}) => {
  const svgNodes = convertSvg(
    parseSvg(svgString, config.DOMParser || {}),
    makeCssAst(cssString),
    config
  )
  return svgNodes
}
