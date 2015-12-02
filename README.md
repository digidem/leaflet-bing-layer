# leaflet-bing-layer

Bing Maps Layer for Leaflet v1.0.0


### L.BingLayer(options|BingMapsKey)

Create a new Bing Maps Layer.

### Parameters

| parameter                     | type           | description                                                                                           |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `options`                     | string\|object | A valid [Bing Maps Key](https://msdn.microsoft.com/en-us/library/ff428642.aspx) or an options object |
| `options.BingMapsKey`         | string         | A valid Bing Maps Key [_required_]                                                                      |
| `[options.imagerySet]` | string         | _optional:_ [Imagery Type](https://msdn.microsoft.com/en-us/library/ff701716.aspx) [_default=Aerial_]               |
| `[options.culture]`   | string         | _optional:_ Language for labels, [see options](https://msdn.microsoft.com/en-us/library/hh441729.aspx) [_default=en_US_]           |


### Example

```js
var map = L.map('map').setView([51.505, -0.09], 13)
L.bingLayer(MyBingMapsKey).addTo(map)
```

[Live Example](http://gmaclennan.github.io/leaflet-bing-layer/) see [index.html](index.html)

### License

MIT
