# leaflet-bing-layer

Bing Maps Layer for Leaflet v1.0.0


### L.TileLayer.Bing(options|BingMapsKey)

Create a new Bing Maps Layer. Depends on [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which needs a polyfill for [older browsers](http://caniuse.com/#feat=promises) by adding this script to your html `<head>`:

```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Promise"></script>
```

### Parameters

| parameter                     | type           | description                                                                                           |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `options`                     | string\|object | A valid [Bing Maps Key](https://msdn.microsoft.com/en-us/library/ff428642.aspx) or an `options` object. `options` inherits from [L.TileLayer options](http://mourner.github.io/Leaflet/reference.html#tilelayer-options) (e.g. you can use `minZoom` and `opacity` and etc) |
| `options.bingMapsKey`         | string         | A valid Bing Maps Key [_required_]                                                                      |
| `[options.imagerySet]` | string         | _optional:_ [Imagery Type](https://msdn.microsoft.com/en-us/library/ff701716.aspx) [_default=Aerial_] <br>- `Aerial` - Aerial imagery<br>- `AerialWithLabels` - Aerial imagery with a road overlay<br>- `Road` - Roads without additional imagery<br>**[Not supported](https://social.msdn.microsoft.com/Forums/en-US/3d80d4a6-f4c9-4926-a336-e0d545b1ef3c/is-it-possible-to-retrieve-birdseye-map-tiles-using-rest-services?forum=bingmapsservices)**: `Birdseye` and `BirdseyeWithLabels`      |
| `[options.culture]`   | string         | _optional:_ Language for labels, [see options](https://msdn.microsoft.com/en-us/library/hh441729.aspx) [_default=en_US_]           |

### Methods

| Method           | Returns        | Description   |
| ----------       | -------------- | ------------- |
| `getMetaData(<LatLng> latlng, <Number> zoom)`    | `Promise`      | Get the [Bing Imagery metadata](https://msdn.microsoft.com/en-us/library/ff701712.aspx) for a specific [`LatLng`](http://leafletjs.com/reference.html#latlng) and zoom level. `latLng` or `zoom` are optional *if* the layer is attached to a map, they default to current map center and zoom. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to the metadata JSON from Bing |

### Example

```js
var map = L.map('map').setView([51.505, -0.09], 13)
L.tileLayer.bing(MyBingMapsKey).addTo(map)
```

[Live Example](http://digidem.github.io/leaflet-bing-layer/) see [index.html](index.html)

### License

MIT
