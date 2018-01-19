import converter, { extractViewbox, getCssRulesForAttr, findApplicableCssProps, addNonCssAttributes } from '../converter'
import { parseSvg, makeCssAst } from '../parser'
import { SIMPLE_CSS, SIMPLE_SVG, SVG_WITH_UNMAPPED_ELEMENTS } from './fixtures.test'

function nodeEnumerate (node, nodes) {
  if (node.props && node.props.children) {
    if (Array.isArray(node.props.children) && node.props.children.length > 0) {
      node.props.children.forEach((child) => {
        nodes.push(node.type.displayName)
        return nodeEnumerate(child, nodes)
      })
    } else {
      nodes.push(node.type.displayName)
    }
  }
}

describe('svg-parser components', () => {
  describe('extractViewbox', () => {
    it('should make a fancy object', () => {
      const viewBox = extractViewbox({
        attributes: {
          '1': {
            name: 'viewBox',
            value: '-4.296122345000001 24.174109004999984 94.51469159 86.29088279'
          }
        }
      })

      expect(viewBox).toBeTruthy()
      expect(viewBox.width).toBe('94.51469159')
      expect(viewBox.height).toBe('86.29088279')
      expect(viewBox.viewBox).toBe('-4.296122345000001 24.174109004999984 94.51469159 86.29088279')
    })

    it('should return empty object if no viewbox', () => {
      const viewBox = extractViewbox({
        attributes: {
          '1': {
            name: 'fill',
            value: '#ffffff'
          }
        }
      })

      expect(viewBox).toEqual({})
    })
  })

  describe('getCssRulesForAttr', () => {
    it('should find CSS rules for a given attribute (by ID)', () => {
      const cssAst = makeCssAst(SIMPLE_CSS)
      const rules = getCssRulesForAttr({ name: 'id', value: 'elementid1' }, cssAst.stylesheet.rules)

      expect(rules).toBeTruthy()
      expect(rules.length).toBe(1)
      expect(rules[0].selectors[0]).toBe('#elementid1')
      const declarations = rules[0].declarations
      expect(declarations[0].property).toBe('fill')
      expect(declarations[0].value).toBe('#F7F7F7')
      expect(declarations[1].property).toBe('stroke')
      expect(declarations[1].value).toBe('none')
    })

    it('should find CSS rules for a given attribute (by class)', () => {
      const cssAst = makeCssAst(SIMPLE_CSS)
      const rules = getCssRulesForAttr({ name: 'class', value: 'content' }, cssAst.stylesheet.rules)

      expect(rules).toBeTruthy()
      expect(rules.length).toBe(1)
      expect(rules[0].selectors[0]).toBe('.content')
      const declarations = rules[0].declarations
      expect(declarations[2].property).toBe('fill')
      expect(declarations[2].value).toBe('#DDDDDD')
      expect(declarations[1].property).toBe('font-size')
      expect(declarations[1].value).toBe('11px')
      expect(declarations[0].property).toBe('font-family')
      expect(declarations[0].value).toBe("'Helvetica'")
    })
  })

  describe('findApplicableCssProps', () => {
    it('should get a list of css properties', () => {
      const dom = parseSvg(SIMPLE_SVG)
      const cssAst = makeCssAst(SIMPLE_CSS)

      // grabbing a node that has CSS on it:
      const svgNode = dom.documentElement
      expect(svgNode.childNodes[3].attributes.length).toBe(2)
      expect(svgNode.childNodes[3].attributes[0].name).toBe('class')
      expect(svgNode.childNodes[3].attributes[1].name).toBe('transform')

      const contentNode = svgNode.childNodes[3]
      const cssProps = findApplicableCssProps(contentNode, { cssRules: cssAst.stylesheet.rules })

      expect(cssProps).toBeTruthy()
      expect(cssProps.cssProps).toEqual([ 'fontFamily', 'fontSize', 'fill' ])
      expect(cssProps.attrs).toEqual([
        { name: 'fontFamily', value: '\'Helvetica\'' },
        { name: 'fontSize', value: '11px' },
        { name: 'fill', value: '#DDDDDD' }
      ])
    })
  })

  describe('addNonCssAttributes', () => {
    it('should pick out attributes like "role" or "aria-hidden"', () => {
      const dom = parseSvg(SIMPLE_SVG)
      const cssAst = makeCssAst(SIMPLE_CSS)

      // this is the "background" node, it has a "role" on it.
      const svgNode = dom.documentElement
      const backgroundNode = svgNode.childNodes[1]
      expect(backgroundNode.attributes.length).toBe(3)
      expect(backgroundNode.nodeName).toBe('g')
      expect(backgroundNode.attributes[0].name).toBe('id')
      expect(backgroundNode.attributes[1].name).toBe('role')

      const cssProps = findApplicableCssProps(backgroundNode, { cssRules: cssAst.stylesheet.rules })
      expect(cssProps).toBeTruthy()
      expect(cssProps.cssProps).toEqual(['fill'])
      expect(cssProps.attrs).toEqual([
        { name: 'fill', value: '#eeeeee' }
      ])

      const nonCssAttributes = addNonCssAttributes(backgroundNode, cssProps)
      expect(nonCssAttributes).toEqual([{ name: 'role', value: 'group' }])
    })
  })

  describe('converter', () => {
    it('should be skipping unmapped elements', () => {
      const dom = parseSvg(SVG_WITH_UNMAPPED_ELEMENTS)
      const cssAst = makeCssAst(SIMPLE_CSS)
      const svgElement = converter(dom, cssAst)

      expect(svgElement).toBeTruthy()
      let nodeList = []
      nodeEnumerate(svgElement, nodeList)
      nodeList = nodeList.map((n) => n.toLowerCase())
      expect(nodeList.indexOf('svg')).toBe(0)
      expect(nodeList.indexOf('g')).toBe(1)
      expect(nodeList.indexOf('filter')).toBe(-1)
      expect(nodeList.indexOf('feGaussianBlur')).toBe(-1)
    })

    it('should skip ids that are flagged for omision', () => {
      const dom = parseSvg(SIMPLE_SVG)
      const cssAst = makeCssAst(SIMPLE_CSS)
      const SvgElement = converter(dom, cssAst)
      // has 4 children normally
      expect(SvgElement.props.children[1].props.children.length).toEqual(4)
      const SvgElement2 = converter(dom, cssAst, {
        omitById: ['elementid1', 'elementid2', 'elementid3']
      })
      // omit 3 and you get 1 child
      expect(SvgElement2.props.children[1].props.children.length).toEqual(1)
      const wallShapesPath = SvgElement2.props.children[1].props.children[0].props.children[0].props.d
      expect(wallShapesPath.startsWith('M773.496 3040.5039 L4018.9941')).toEqual(true)
    })

    it('should skip null tag names elements (e.g. newline #text elements)', () => {
      const dom = parseSvg(SVG_WITH_UNMAPPED_ELEMENTS)
      const cssAst = makeCssAst(SIMPLE_CSS)
      const svgElement = converter(dom, cssAst)

      const nodeNames = Object.values(dom.documentElement.childNodes).map((node) => {
        return node.nodeName
      })
      const tagNames = Object.values(dom.documentElement.childNodes).map((node) => {
        return node.tagName
      })
      expect(nodeNames).toEqual([ '#text', 'g', '#text', 'filter', '#text', 'g', '#text', undefined ])
      expect(tagNames).toEqual([ undefined, 'g', undefined, 'filter', undefined, 'g', undefined, undefined ])

      expect(svgElement).toBeTruthy()
      let nodeList = []
      nodeEnumerate(svgElement, nodeList)
      nodeList = nodeList.map((n) => n.toLowerCase())
      expect(nodeList.indexOf('svg')).toBe(0)
      expect(nodeList.indexOf('#text')).toBe(-1)
    })
  })
})
