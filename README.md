# vector-tile-ascii

ASCII renderer for OpenStreetMap vector tiles.


## Why?

Because it should be possible to download and view a single tile without configuring a massive Mapnik-based rendering infrastructure.


## Example

```bash
git clone https://github.com/chillyv/vector-tile-ascii.git
cd vector-tile-ascii/

npm install

# Fetch and decompress a vector tile from MapBox
curl "https://a.tiles.mapbox.com/v3/mapbox.mapbox-streets-v5/14/15881/10561.vector.pbf" \
  | openssl zlib -d > 10561.vector.pbf

# View the tile
node index.js 10561.vector.pbf
```

Check it against the reference image:

http://a.tile.openstreetmap.org/14/15881/10561.png
