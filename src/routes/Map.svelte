<script>
    import { onMount } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    import { routes } from '../lib/routes';
    import { countrySummary } from '../lib/countrySummary';
    import * as d3 from 'd3';
    import "../style.css";


    mapboxgl.accessToken = 'pk.eyJ1IjoiamFkZWRlbyIsImEiOiJjbTJuZzFpYWkwNTdhMmlvbW16bmt3bjlhIn0.QCsOvTO9JomVioOyAgZgPA';

    let map;
    let tooltip;

    function getLineColor(numIndentures) {
        if (numIndentures > 200000) return '#FF0000';
        if (numIndentures > 100000) return '#FF7F50';
        if (numIndentures > 50000) return '#FFD700';
        return '#ffc505';
    }

    const maxIndentures = Math.max(...countrySummary.map(d => d.numIndentures));
    const lineThicknessScale = d3.scaleLinear()
        .domain([0, maxIndentures])
        .range([3, 13]);

    function toggleVisibility(excludeLayerId) {
        countrySummary.forEach(country => {
            const otherLayerId = `route-${country.route}`;
            if (otherLayerId !== excludeLayerId) {
                const visibility = map.getLayoutProperty(otherLayerId, 'visibility');
                map.setLayoutProperty(otherLayerId, 'visibility', visibility === 'visible' ? 'none' : 'visible');
            }
        });
    }

    onMount(() => {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v11',
            center: [0, 0],
            zoom: 2
        });

        tooltip = document.getElementById('tooltip');

        map.on('load', function() {
            countrySummary.forEach(country => {
                const route = routes[country.route].coordinates;
                const layerId = `route-${country.route}`;
                map.addLayer({
                    'id': layerId,
                    'type': 'line',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {
                                'description': `${country.country}: ${country.numIndentures} indentures`
                            },
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': route
                            }
                        }
                    },
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round',
                        'visibility': 'visible'
                    },
                    'paint': {
                        'line-color': getLineColor(country.numIndentures),
                        'line-width': lineThicknessScale(country.numIndentures) 
                    }
                });

                map.on('mouseenter', layerId, (e) => {
                    const originsList = country.origins.join(', ');
                    const infoContainer = document.getElementById('map-info');
                    
                    infoContainer.innerHTML = `
                        <p>Laborers bound for</p>
                        <h2>${country.countryName}</h2>
                        <hr>
                        <div id="meta">
                            <div>
                                <p><strong>Period of Indenture</strong></p>
                                <p>${country.startYear}-${country.endYear}</p>
                            </div>
                            <div>
                                <p><strong>Number of People</strong></p>
                                <p>${country.numIndentures}</p>
                            </div>
                            <div>
                                <p><strong>Number of Voyages</strong></p>
                                <p>${country.numVoyages}</p>
                            </div>
                            <div>
                                <p><strong>Origins</strong></p>
                                <p>${originsList}</p>
                            </div>
                        </div>
                    `;
                    
                    // Change line color to black
                    map.setPaintProperty(layerId, 'line-color', '#000000');
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', layerId, () => {
                    map.setPaintProperty(layerId, 'line-color', getLineColor(country.numIndentures));
                    map.getCanvas().style.cursor = '';
                    document.getElementById('map-info').innerHTML = '<h2>Hover on a line for more info</h2><hr>';
                });

                map.on('click', layerId, () => {
                    const isVisible = map.getLayoutProperty(layerId, 'visibility') === 'visible';

                    if (isVisible) {
                        // hide  other lines
                        toggleVisibility(layerId);
                        map.setLayoutProperty(layerId, 'visibility', 'visible');
                    } else {
                        countrySummary.forEach((country) => {
                            const otherLayerId = `route-${country.route}`;
                            map.setLayoutProperty(otherLayerId, 'visibility', 'visible');
                        });
                    }
                });
            });
        });

        return () => {
            map.remove();
        };
    });
</script>

<div id="map-container">
    <div id="map" style="width: 100%; height: 600px;"></div>
    <div id="map-info">
        <h2>Hover on a line for more info</h2>
        <hr>
    </div>
</div>
