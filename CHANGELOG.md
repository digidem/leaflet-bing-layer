# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

- FIXED: **[BREAKING]** Export factory function on `L.tileLayer.bing` not `L.TileLayer.bing`
- CHANGED: BingMapsKey is now passed on `options.bingMapsKey` (`options.BingMapsKey` will still work, but for convention this should start with a lowercase character)
- IMPROVED: Package with browserify and require dependencies
- IMPROVED: Throws error if invalid imagerySet is passed as option
- ADDED: `getMetaData` method

## v2.0.2 - 2015-12-03

Initial release

[Unreleased]: https://github.com/digidem/leaflet-bing-layer/compare/v2.0.2...HEAD
