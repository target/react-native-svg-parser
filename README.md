# react-native-svg-parser

[![npm version](https://badge.fury.io/js/%40target-corp%2Freact-native-svg-parser.svg)](https://badge.fury.io/js/%40target-corp%2Freact-native-svg-parser) [![Build Status](https://travis-ci.org/target/react-native-svg-parser.svg?branch=master)](https://travis-ci.org/target/react-native-svg-parser)

An SVG/XML parser that converts to react-native-svg format. This project was
created in order to make it easy to use existing SVG files with the [react-native-svg](https://github.com/react-native-community/react-native-svg) project,
which only supports a subset of SVG and does not provide a method for directly rendering
SVG from an SVG/XML format file.

## Installation

```
npm i @target-corp/react-native-svg-parser
```

## Usage

```
import ReactNativeSvgParser from 'react-native-svg-parser'

const svgNode = ReactNativeSvgParser(`YOUR SVG XML STRING`, `YOUR CSS STYLESHEET STRING`)

....

render() {
  return <View>
    { svgNode }
  </View>
}

```

## Options

The parser takes a third parameter, and object with config options. You can specify the following values:

| Prop name | Type   | Description |
|-----------|--------| ------------|
| width     | number | overrides the width provided by viewbox, becomes "width" prop on ```Svg``` element |
| height    | number | overrides the height provided by viewbox, becomes "height" prop on ```Svg``` element |
| viewBox   | string | overrides the viewbox element on the SVG and is added as a prop on ```Svg``` element |
| DOMParser | object | this is passed directly to xmldom.DOMParser, see xmldom docs for options available |
| omitById  | array  | an optional array of ids to omit from the SVG output object |

Example usage:

```
import ReactNativeSvgParser from 'react-native-svg-parser'

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

const svgNode = ReactNativeSvgParser(svgString, cssString, {width: 111, height: 222})

.... // (will render a red circle with a black stroke)

render() {
  return <View>
    { svgNode }
  </View>
}

```


## Developing: Lint test and build

In order to test and develop locally you will need to install the peer dependencies (React and React Native). However, we have you covered. Just run this command:

```
npm run install-peers
```

Then you can run test lint and build using this command:

```
npm run ci
```



## Console warning, on transform prop

On v5.5.1 react-native-svg enforced prop type of "object" on transform attribute. However,
as of v6.0.0 this is changed to:
```
    transform: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
```
https://github.com/react-native-community/react-native-svg/blob/master/lib/props.js#L69

Therefore, the minimum version compatibility for this libaray with ```react-native-svg``` is version 6.0.0.


## Changelog

### v1.0.5

Fixed text node rendering.
