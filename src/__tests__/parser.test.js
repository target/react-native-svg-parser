import parser from '../parser'

describe('svg-parser main lib', () => {
  it('should return an svg in react native SVG format', () => {
    const svg = parser('', {width: 111, height: 222})

    expect(svg).toBeTruthy()
  })
})
