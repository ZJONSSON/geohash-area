Geohash library that focuses on rectangular areas for fast database lookups.

### `geohash.rect(lat,lng,distance,precision)`
Generates geohashes of a given `precision` around a supplied point (`lat` and `lng`) as determined by `distance`.

### `geohash.area(fn,precision)`
Returns a list of geohashes for a given `precision` (i.e. length) that cover a particular area.  The supplied function should recursively estimate whether a supplied geohash touches the area of interest.  This function should return `2` if the particular geohash is completely within the area boundaries being tesed.

### `geohash.encode(lat,lng,precision)`
Generates a geohash for a position with a given `precision`

### `geohash.decode(hash)`
Decodes a given geohash to a rectangle (`left`,`top`,`right`,`bottom`) with midpoint defined as `lat` / `lng`

### `geohash.distance(start,end)`
Both `start` and `end` should include properties `lat` and `lng`.  Function returns the distance between the two points as number of miles
