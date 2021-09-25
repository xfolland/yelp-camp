try {
    mapboxgl.accessToken = mapToken;
    const clustermap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v10",
        center: [-103.5917, 40.6699],
        zoom: 3
    });

    clustermap.on("load", () => {
        // Add a new source from our GeoJSON data and
        // set the "cluster" option to true. GL-JS will
        // add the point_count property to your source data.
        clustermap.addSource("campgrounds", {
            type: "geojson",
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS" Earthquake hazards program.
            data: campgrounds,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        clustermap.addLayer({
            id: "clusters",
            type: "circle",
            source: "campgrounds",
            filter: ["has", "point_count"],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#ffee58",
                    10,
                    "#ffa726",
                    30,
                    "#ef5350"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    10,
                    25,
                    30,
                    30
                ]
            }
        });

        clustermap.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "campgrounds",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });

        clustermap.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "campgrounds",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#ffee58",
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
            }
        });

        // inspect a cluster on click
        clustermap.on("click", "clusters", (e) => {
            const features = clustermap.queryRenderedFeatures(e.point, {
                layers: ["clusters"]
            });
            const clusterId = features[0].properties.cluster_id;
            clustermap.getSource("campgrounds").getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    clustermap.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        clustermap.on("click", "unclustered-point", (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const title = e.features[0].properties.popup;

            // Ensure that if the map is zoomed out such that
            // multiple copies of the feature are visible, the
            // popup appears over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `${title}`
                )
                .addTo(clustermap);
        });

        clustermap.on("mouseenter", "clusters", () => {
            clustermap.getCanvas().style.cursor = "pointer";
        });
        clustermap.on("mouseleave", "clusters", () => {
            clustermap.getCanvas().style.cursor = "";
        });
    });
} catch (e) { }
