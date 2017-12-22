# react-native-svg-parser
An SVG/XML parser that converts to react-native-svg format

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


## Developing: Lint test and build

```
npm test && npm run lint && npm run build
```



## Console warning, on transform prop

On v5.5.1 react-native-svg enforced prop type of "object" on transform attribute. However, 
as of v6.0.0 this is changed to:
```
    transform: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
```
https://github.com/react-native-community/react-native-svg/blob/master/lib/props.js#L69
