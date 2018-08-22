import parser, { parseSvg, makeCssAst} from '../parser'
import {SIMPLE_CSS, SIMPLE_SVG} from './fixtures.test'

describe('svg-parser main lib', () => {
  it('should parse css and return a set of rules', () => {
    const cssAst = makeCssAst(SIMPLE_CSS)
    expect(cssAst).toBeTruthy()
    expect(cssAst.stylesheet.rules).toBeTruthy()
    expect(cssAst.stylesheet.rules.length).toBe(5)
    const rules = cssAst.stylesheet.rules
    expect(rules[2].selectors[0]).toBe('#elementid1')
    const r2 = rules[2]
    expect(r2.declarations[0].property).toBe('fill')
    expect(r2.declarations[0].value).toBe('#F7F7F7')
  })

  it('should parse SVG and return a DOM', () => {
    const dom = parseSvg(SIMPLE_SVG)
    expect(dom).toBeTruthy()
    expect(dom.childNodes.length).toBe(3)
    expect(dom.childNodes[0].tagName).toBe('xml')
    expect(dom.childNodes[2].tagName).toBe('svg')
    expect(dom.documentElement.tagName).toBe('svg')
    expect(dom.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(dom.documentElement.childNodes.length).toBe(5)
  })

  it('should return an svg in react native SVG format', () => {
    const svg = parser(SIMPLE_SVG, SIMPLE_CSS)
    expect(svg).toBeTruthy()
    const { width, height, viewBox, children } = svg.props
    expect(width).toBe('94.51469159')
    expect(height).toBe('86.29088279')
    expect(viewBox).toBe('-4.296122345000001 24.174109004999984 94.51469159 86.29088279')
    const content = children[1]
    expect(content.type.displayName).toBe('G')
    expect(content.props.transform).toBe('matrix(0.0254 0 0 -0.0254 -19.6129971976 105.69902944479999)')
  })

  it('should return an svg in react native SVG format, with no CSS or config element', () => {
    const svg = parser(SIMPLE_SVG)
    expect(svg).toBeTruthy()
    const { width, height, children } = svg.props
    expect(width).toBe('94.51469159')
    expect(height).toBe('86.29088279')
    const content = children[1]
    expect(content.type.displayName).toBe('G')
    expect(content.props.transform).toBe('matrix(0.0254 0 0 -0.0254 -19.6129971976 105.69902944479999)')
  })

  it('should format an SVG with width and height if passed', () => {
    const svg = parser(SIMPLE_SVG, SIMPLE_CSS, {width: 111, height: 222})
    expect(svg).toBeTruthy()
    const { width, height, viewBox } = svg.props
    expect(width).toBe(111)
    expect(height).toBe(222)
    expect(viewBox).toBe('-4.296122345000001 24.174109004999984 94.51469159 86.29088279')
  })

  it('should format an SVG with custom viewbox if passed', () => {
    const svg = parser(SIMPLE_SVG, SIMPLE_CSS, {viewBox: '0 0 200 100'})
    expect(svg).toBeTruthy()
    const { viewBox } = svg.props
    expect(viewBox).toBe('0 0 200 100')
  })

  it('handles text elements', () => {
    const svg = parser(SIMPLE_SVG, SIMPLE_CSS)
    const { children } = svg.props
    const content = children[1]
    const lastGElement = content.props.children[3]
    const textElement = lastGElement.props.children[0]
    expect(textElement.props.children).toEqual('baby')
  })

  it('readme example works', () => {
    const svgString = `<svg height="100" width="100">
      <circle cx="50" cy="50" r="40" class="red-circle" />
    </svg>
    `
    const cssString = `
    .red-circle {
      fill: red;
      stroke: black;
      stroke-width: 3;
    }
    `
    const svgNode = parser(svgString, cssString)
    const { children } = svgNode.props
    const circle = children[0]

    expect(circle.props).toEqual({
      'children': [],
      'cx': '50',
      'cy': '50',
      'fill': 'red',
      'r': '40',
      'stroke': 'black',
      'strokeWidth': '3'
    })
  })
})
