import React from 'react'
import camelCase from 'camelcase'

import Svg, {
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Text,
    Use,
    Defs,
    Stop
} from 'react-native-svg'

const mapping = {
  'svg': Svg,
  'circle': Circle,
  'ellipse': Ellipse,
  'g': G,
  'line': Line,
  'path': Path,
  'rect': Rect,
  'symbol': Symbol,
  'text': Text,
  'polygon': Polygon,
  'polyline': Polyline,
  'linearGradient': LinearGradient,
  'radialGradient': RadialGradient,
  'use': Use,
  'defs': Defs,
  'stop': Stop
}

function iterateMarkup (markup, config, i = 0) {
  if (!markup || !markup.nodeName) {
    return null
  }
  let tagName = markup.nodeName

  if (!markup.tagName) {
    return null
  }

  const attrs = []

  if (tagName === 'svg') {
    let viewBox = markup.attributes
                    ? Object.values(markup.attributes)
                      .filter((attr) => attr.name === 'viewBox')[0]
                  : false
    viewBox = viewBox ? viewBox.value.split(' ') : false

    attrs.push({
      name: 'width',
      value: config.width || `${viewBox[2]}`
    })
    attrs.push({
      name: 'height',
      value: config.height || `${viewBox[3]}`
    })
    attrs.push({
      name: 'viewBox',
      value: viewBox ? `${viewBox.join(' ')}` : '0 0 50 50'
    })
  } else {
    // tagName
    let cssProps = []
    let className
    // Find classes and match attributes from rule declarations
    Object.values(markup.attributes).forEach((attr) => {
      let rules = []
      if (attr.name === 'id') {
        let idname = '#' + attr.value

        rules = config.cssRules.filter((rule) => {
          if (rule.selectors.indexOf(idname) > -1) {
            return true
          } else {
            return false
          }
        })
      } else if (attr.name === 'class') {
        className = '.' + attr.value

        rules = config.cssRules.filter((rule) => {
          if (rule.selectors.indexOf(className) > -1) {
            return true
          } else {
            return false
          }
        })
      }

      if (rules.length === 0) {
        return
      }

      rules.forEach((rule) => {
        rule.declarations.forEach((declaration) => {
          const propertyName = camelCase(declaration.property)

          // always react native
          // Compare against whitelist/proptypes from react-native-svg props in validKeys
          attrs.push({
            name: propertyName,
            value: `${declaration.value}`
          })
          cssProps.push(propertyName)
        })
      })
    })

    Object.values(markup.attributes).forEach((attr) => {
      if (!attr || !attr.name) {
        return
      }

      const propertyName = camelCase(attr.name)

      if (propertyName === 'class') {
        return
      }

      if (cssProps.indexOf(propertyName) > -1) {
        return
      }

      attrs.push({
        name: propertyName,
        value: `${attr.value}`
      })
    })
  }

  const children = markup.childNodes.length ? Object.values(markup.childNodes).map((child) => {
    return iterateMarkup(child, config, ++i)
  }).filter((node) => {
    return !!node
  }) : []

  // map the tag to an element.
  const Elem = mapping[ tagName.toLowerCase() ]
  let elemAttributes = {}
  attrs.forEach((attr) => {
    elemAttributes[attr.name] = attr.value
  })

  // Note, if the element is not found it was not in the mapping.
  if (!Elem) {
    return null
  }

  const k = i + Math.random()
  return <Elem {...elemAttributes} key={k}>{ children }</Elem>
}

export default (dom, cssAst, config) => {
  config = Object.assign({}, config, {
    cssRules: (cssAst && cssAst.stylesheet && cssAst.stylesheet.rules) || []
  })
  return iterateMarkup(dom.documentElement, config)
}
