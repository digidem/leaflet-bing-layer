# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [v3.1.0] - 2016-04-29

- ADDED: Use `https` for Bing API requests.

## [v3.0.1] - 2015-12-13

- FIXED: options.BingMapsKey backwards compatability
- FIXED: options.bingMapsKey was not working for getMetaData
- FIXED: catch errors (and log to console) for jsonp

## [v3.0.0] - 2015-12-08

- FIXED: **[BREAKING]** Export factory function on `L.tileLayer.bing` not `L.TileLayer.bing`
- CHANGED: BingMapsKey is now passed on `options.bingMapsKey` (`options.BingMapsKey` will still work, but for convention this should start with a lowercase character)
- IMPROVED: Package with browserify and require dependencies
- IMPROVED: Throws error if invalid imagerySet is passed as option
- ADDED: `getMetaData` method

## v2.0.2 - 2015-12-03

Initial release

[Unreleased]: https://github.com/digidem/leaflet-bing-layer/compare/v3.0.0...HEAD
[v3.0.1]: https://github.com/digidem/leaflet-bing-layer/compare/v3.0.0...v3.0.1
[v3.0.0]: https://github.com/digidem/leaflet-bing-layer/compare/v2.0.2...v3.0.0
