<script>
    import { onMount } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    import { routes } from '../lib/routes';
    import { voyages } from '../lib/voyages';

    mapboxgl.accessToken = 'pk.eyJ1IjoiamFkZWRlbyIsImEiOiJjbTJuZzFpYWkwNTdhMmlvbW16bmt3bjlhIn0.QCsOvTO9JomVioOyAgZgPA';

    let map;

    onMount(() => {
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [0, 0],
            zoom: 2
        });

        map.on('load', function() {
            voyages.forEach(voyage => {
                let route = routes[voyage.route];
                map.addLayer({
                    'id': `voyage${voyage.id}`,
                    'type': 'line',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': route
                            }
                        }
                    },
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#FF6347',
                        'line-width': 2
                    }
                });
            });
        });

        return () => {
            map.remove();
        };
    });
</script>

<div id="map" style="width: 100%; height: 600px;"></div>
