/* https://github.com/camsong/fetch-jsonp */
/*eslint-disable */
!function(e,t){if("function"==typeof define&&define.amd)define(["exports","module"],t);else if("undefined"!=typeof exports&&"undefined"!=typeof module)t(exports,module);else{var n={exports:{}};t(n.exports,n),e.fetchJsonp=n.exports}}(this,function(e,t){"use strict";function n(){return"jsonp_"+Date.now()+"_"+Math.ceil(1e5*Math.random())}function o(e){try{delete window[e]}catch(t){window[e]=void 0}}function i(e){var t=document.getElementById(e);document.getElementsByTagName("head")[0].removeChild(t)}var u={timeout:5e3,jsonpCallback:"callback",jsonpCallbackFunction:null},a=function(e){var t=void 0===arguments[1]?{}:arguments[1],a=null!=t.timeout?t.timeout:u.timeout,r=null!=t.jsonpCallback?t.jsonpCallback:u.jsonpCallback,l=void 0;return new Promise(function(u,c){var s=t.jsonpCallbackFunction||n();window[s]=function(e){u({ok:!0,json:function(){return Promise.resolve(e)}}),l&&clearTimeout(l),i(r+"_"+s),o(s)},e+=-1===e.indexOf("?")?"?":"&";var d=document.createElement("script");d.setAttribute("src",e+r+"="+s),d.id=r+"_"+s,document.getElementsByTagName("head")[0].appendChild(d),l=setTimeout(function(){c(new Error("JSONP request to "+e+" timed out")),o(s),i(r+"_"+s)},a)})};t.exports=a});
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

  function toQuadKey (x, y, z) {
    var key = ''
    for (var i = 1; i <= z; i++) {
      key += (((y >> z - i) & 1) << 1) | ((x >> z - i) & 1)
    }
    return key
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
   * L.bingLayer(MyBingMapsKey).addTo(map)
   */
  L.BingLayer = L.TileLayer.extend({
    options: {
      BingMapsKey: null, // Required
      imagerySet: 'Aerial',
      culture: 'en-US'
    },

    statics: {
      METADATA_URL: 'http://dev.virtualearth.net/REST/v1/Imagery/Metadata/{imagerySet}?key={BingMapsKey}'
    },

    initialize: function (options) {
      if (typeof options === 'string') {
        options = { BingMapsKey: options }
      }
      if (!options.BingMapsKey) {
        throw new Error('Must supply options.BingMapsKey')
      }
      options = L.setOptions(this, options)

      var metaDataUrl = L.Util.template(L.BingLayer.METADATA_URL, {
        BingMapsKey: this.options.BingMapsKey,
        imagerySet: this.options.imagerySet
      })

      this._fetch = window.fetchJsonp(metaDataUrl, {jsonpCallback: 'jsonp'})
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

    _metaDataOnLoad: function (metaData) {
      if (metaData.statusCode !== 200) {
        throw new Error('Bing Imagery Metadata error: \n' + JSON.stringify(metaData, null, '  '))
      }
      this._url = metaData.resourceSets[0].resources[0].imageUrl
      this.options.subdomains = metaData.resourceSets[0].resources[0].imageUrlSubdomains
      return Promise.resolve()
    }

  })

  L.bingLayer = function (options) {
    return new L.BingLayer(options)
  }

  return L
}, window))
