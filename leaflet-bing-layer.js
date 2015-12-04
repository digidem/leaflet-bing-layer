/* https://github.com/camsong/fetch-jsonp */
/*eslint-disable */
var fetchJsonp=function(){"use strict";function e(){return"jsonp_"+Date.now()+"_"+Math.ceil(1e5*Math.random())}function n(e){try{delete window[e]}catch(n){window[e]=void 0}}function t(e){var n=document.getElementById(e);document.getElementsByTagName("head")[0].removeChild(n)}var o={timeout:5e3,jsonpCallback:"callback",jsonpCallbackFunction:null},a=function(a){var i=void 0===arguments[1]?{}:arguments[1],u=null!=i.timeout?i.timeout:o.timeout,r=null!=i.jsonpCallback?i.jsonpCallback:o.jsonpCallback,c=void 0;return new Promise(function(o,l){var m=i.jsonpCallbackFunction||e();window[m]=function(e){o({ok:!0,json:function(){return Promise.resolve(e)}}),c&&clearTimeout(c),t(r+"_"+m),n(m)},a+=-1===a.indexOf("?")?"?":"&";var s=document.createElement("script");s.setAttribute("src",a+r+"="+m),s.id=r+"_"+m,document.getElementsByTagName("head")[0].appendChild(s),c=setTimeout(function(){l(new Error("JSONP request to "+a+" timed out")),n(m),t(r+"_"+m)},u)})};return a}();
/*eslint-enable */

/*global define:false*/
;(function (factory, window) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['leaflet'], factory)
  } else if (typeof modules === 'object' && module.exports) {
    // define a Common JS module that relies on 'leaflet'
    module.exports = factory(require('leaflet'))
  } else {
    // Assume Leaflet is loaded into global object L already
    window.L = factory(window.L)
  }
}(function (L) {
  'use strict'

  /**
   * Converts tile xyz coordinates to Quadkey
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @return {Number} Quadkey
   */
  function toQuadKey (x, y, z) {
    var key = ''
    for (var i = 1; i <= z; i++) {
      key += (((y >> z - i) & 1) << 1) | ((x >> z - i) & 1)
    }
    return key
  }

  /**
   * @param {Array} bbox1
   * @param {Array} bbox2
   * @return {Boolean} Returns true if bboxes intersect.
   */
  function bboxIntersect (bbox1, bbox2) {
    return !(
      bbox1[0] > bbox2[2] ||
      bbox1[2] < bbox2[0] ||
      bbox1[3] < bbox2[1] ||
      bbox1[1] > bbox2[3]
    )
  }

  /**
   * Converts Leaflet BBoxString to Bing BBox
   * @param {String} bboxString 'southwest_lng,southwest_lat,northeast_lng,northeast_lat'
   * @return {Array} [south_lat, west_lng, north_lat, east_lng]
   */
  function toBingBBox (bboxString) {
    var bbox = bboxString.split(',')
    return [bbox[1], bbox[0], bbox[3], bbox[2]]
  }

  /**
   * Create a new Bing Maps layer.
   * @param {string|object} options Either a [Bing Maps Key](https://msdn.microsoft.com/en-us/library/ff428642.aspx) or an options object
   * @param {string} options.BingMapsKey A valid Bing Maps Key (required)
   * @param {string} [options.imagerySet=Aerial] Type of imagery, see https://msdn.microsoft.com/en-us/library/ff701716.aspx
   * @param {string} [options.culture='en-US'] Language for labels, see https://msdn.microsoft.com/en-us/library/hh441729.aspx
   * @return {L.TileLayer} A Leaflet TileLayer to add to your map
   *
   * Create a basic map
   * @example
   * var map = L.map('map').setView([51.505, -0.09], 13)
   * L.TileLayer.Bing(MyBingMapsKey).addTo(map)
   */
  L.TileLayer.Bing = L.TileLayer.extend({
    options: {
      BingMapsKey: null, // Required
      imagerySet: 'Aerial',
      culture: 'en-US',
      minZoom: 1
    },

    statics: {
      METADATA_URL: 'http://dev.virtualearth.net/REST/v1/Imagery/Metadata/{imagerySet}?key={BingMapsKey}&include=ImageryProviders'
    },

    initialize: function (options) {
      if (typeof options === 'string') {
        options = { BingMapsKey: options }
      }
      if (!options.BingMapsKey) {
        throw new Error('Must supply options.BingMapsKey')
      }
      options = L.setOptions(this, options)
      options.minZoom = Math.max(1, options.minZoom)

      var metaDataUrl = L.Util.template(L.TileLayer.Bing.METADATA_URL, {
        BingMapsKey: this.options.BingMapsKey,
        imagerySet: this.options.imagerySet
      })

      this._imageryProviders = []
      this._attributions = []

      // Keep a reference to the promise so we can use it later
      this._fetch = fetchJsonp(metaDataUrl, {jsonpCallback: 'jsonp'})
        .then(function (response) {
          return response.json()
        })
        .then(this._metaDataOnLoad.bind(this))

      // for https://github.com/Leaflet/Leaflet/issues/137
      if (!L.Browser.android) {
        this.on('tileunload', this._onTileRemove)
      }
    },

    createTile: function (coords, done) {
      var tile = document.createElement('img')

      L.DomEvent.on(tile, 'load', L.bind(this._tileOnLoad, this, done, tile))
      L.DomEvent.on(tile, 'error', L.bind(this._tileOnError, this, done, tile))

      if (this.options.crossOrigin) {
        tile.crossOrigin = ''
      }

      /*
       Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
       http://www.w3.org/TR/WCAG20-TECHS/H67
      */
      tile.alt = ''

      // Don't create closure if we don't have to
      if (this._url) {
        tile.src = this.getTileUrl(coords)
      } else {
        this._fetch.then(function () {
          tile.src = this.getTileUrl(coords)
        }.bind(this)).catch(function (e) {
          console.error(e)
          done(e)
        })
      }

      return tile
    },

    getTileUrl: function (coords) {
      var quadkey = toQuadKey(coords.x, coords.y, coords.z)
      return L.Util.template(this._url, {
        quadkey: quadkey,
        subdomain: this._getSubdomain(coords),
        culture: this.options.culture
      })
    },

    // Update the attribution control every time the map is moved
    onAdd: function (map) {
      map.on('moveend', this._updateAttribution, this)
      L.TileLayer.prototype.onAdd.call(this, map)
      this._attributions.forEach(function (attribution) {
        map.attributionControl.addAttribution(attribution)
      })
    },

    // Clean up events and remove attributions from attribution control
    onRemove: function (map) {
      map.off('moveend', this._updateAttribution, this)
      this._attributions.forEach(function (attribution) {
        map.attributionControl.removeAttribution(attribution)
      })
      L.TileLayer.prototype.onRemove.call(this, map)
    },

    _metaDataOnLoad: function (metaData) {
      if (metaData.statusCode !== 200) {
        throw new Error('Bing Imagery Metadata error: \n' + JSON.stringify(metaData, null, '  '))
      }
      var resource = metaData.resourceSets[0].resources[0]
      this._url = resource.imageUrl
      this._imageryProviders = resource.imageryProviders
      this.options.subdomains = resource.imageUrlSubdomains
      this._updateAttribution()
      return Promise.resolve()
    },

    /**
     * Update the attribution control of the map with the provider attributions
     * within the current map bounds
     */
    _updateAttribution: function () {
      var map = this._map
      if (!map || !map.attributionControl) return
      var zoom = map.getZoom()
      var bbox = toBingBBox(map.getBounds().toBBoxString())
      this._fetch.then(function () {
        var newAttributions = this._getAttributions(bbox, zoom)
        var prevAttributions = this._attributions
        // Add any new provider attributions in the current area to the attribution control
        newAttributions.forEach(function (attr) {
          if (prevAttributions.indexOf(attr) > -1) return
          map.attributionControl.addAttribution(attr)
        })
        // Remove any attributions that are no longer in the current area from the attribution control
        prevAttributions.filter(function (attr) {
          if (newAttributions.indexOf(attr) > -1) return
          map.attributionControl.removeAttribution(attr)
        })
        this._attributions = newAttributions
      }.bind(this))
    },

    /**
     * Returns an array of attributions for given bbox and zoom
     * @private
     * @param {Array} bbox [west, south, east, north]
     * @param {Number} zoom
     * @return {Array} Array of attribution strings for each provider
     */
    _getAttributions: function (bbox, zoom) {
      return this._imageryProviders.reduce(function (attributions, provider) {
        for (var i = 0; i < provider.coverageAreas.length; i++) {
          if (bboxIntersect(bbox, provider.coverageAreas[i].bbox) &&
            zoom >= provider.coverageAreas[i].zoomMin &&
            zoom <= provider.coverageAreas[i].zoomMax) {
            attributions.push(provider.attribution)
            return attributions
          }
        }
        return attributions
      }, [])
    }
  })

  L.TileLayer.bing = function (options) {
    return new L.TileLayer.Bing(options)
  }

  return L
}, window))
