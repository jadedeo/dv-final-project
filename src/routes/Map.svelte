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
    let shipData = [];
    let filteredShipData = [];

    // let colors = d3.scaleOrdinal(d3.schemeTableau10);

    const maxIndentures = Math.max(...countrySummary.map(d => d.numIndentures));
    const lineThicknessScale = d3.scaleLinear()
        .domain([0, maxIndentures])
        .range([3, 13]);

    function getLineColor(numIndentures) {
        if (numIndentures > 200000) return '#E54F6D';
        if (numIndentures > 100000) return '#F6AE2D';
        if (numIndentures > 50000) return '#86A873';
        return '#087F8C';
    }

    function getShipListInfo(countryName) {
        // console.log('fetching shiplist data for', countryName);

        filteredShipData = shipData.filter(d => d.Country === countryName);
        // console.log('filteredData',filteredShipData);
    }

    
    onMount(async() => {
        const parseDate = d3.timeParse("%Y-%m-%d");
        shipData = await d3.csv("shipListData.csv", row => ({
            ...row,
            'ArrivalFormatted': new Date(row['Date of Arrival'])
        }));
        console.log("shipData", shipData);

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
                                'description': `
                                    <strong>${country.countryName}</strong>
                                    
                                    ${country.numIndentures} indentures
                                `,
                                'shipDataAvailable': country.shipDataAvailable
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
                        'line-width': lineThicknessScale(country.numIndentures),
                        'line-dasharray': country.shipDataAvailable ? [1, 0] : [2, 2]  
                    }
                });

                map.on('mouseenter', layerId, (e) => {
                    const shipDataAvailable = e.features[0].properties.shipDataAvailable;
                    map.getCanvas().style.cursor = shipDataAvailable ? 'pointer' : 'default';
                    const description = e.features[0].properties.description;
                    tooltip.innerHTML = description;
                    tooltip.style.display = 'block';
                    
                    const xOffset = 10;
                    const yOffset = 10;

                    tooltip.style.left = `${e.point.x + xOffset}px`;
                    tooltip.style.top = `${e.point.y + yOffset}px`;
                });

                map.on('mouseleave', layerId, () => {
                    map.getCanvas().style.cursor = '';
                    tooltip.style.display = 'none';
                });

                map.on('click', layerId, (e) => {
                    if (e.features[0].properties.shipDataAvailable) {
                        getShipListInfo(country.countryName);
                    } else {
                        console.log("dashed line clicked, no action");
                    }
                });
            });
        });

        return () => {
            map.remove();
        };
    });

    $: yearMax = d3.max(filteredShipData, d => d['ArrivalFormatted']);


    let minYear, maxYear, selectedYear;
    $: if (filteredShipData.length > 0) {
        minYear = d3.min(filteredShipData, d => d['ArrivalFormatted'] ? d['ArrivalFormatted'].getFullYear() : new Date().getFullYear());
        maxYear = d3.max(filteredShipData, d => d['ArrivalFormatted'] ? d['ArrivalFormatted'].getFullYear() : new Date().getFullYear());

        console.log(minYear, '---', maxYear);
        selectedYear = maxYear;
    }
    
    $: filteredByYearShipData = filteredShipData.filter(d => {
        console.log("d['ArrivalFormatted'].getFullYear()", d['ArrivalFormatted'].getFullYear());
        return d['ArrivalFormatted'] && d['ArrivalFormatted'].getFullYear() <= selectedYear;
    });
    $: console.log('filteredByYearShipData', filteredByYearShipData);


    let selectedShip = null;
    $: if (selectedYear) {
        selectedShip = null;
    }

    function selectShip(ship, index) {
        selectedShip = index;
        // console.log('SELECT SHIP', ship, selectedShip);
    }

    function scrollTo(node) {
        // console.log('HERE');
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
</script>

<div id="map-container">
    <div id="map" style="width: 100%; height: 600px;"></div>
    <div id="tooltip" style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; z-index: 1;">Tooltip Content</div>
    <div id="legend" class="legend">
        <h4>Legend</h4>
        <div><span class="legend-key" style="background-color: #E54F6D;"></span><span>Over 200,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #F6AE2D;"></span><span>Over 100,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #86A873;"></span><span>Over 50,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #087F8C;"></span><span>Less than 50,000 indentures</span></div>
        <div><span class="legend-line solid"></span><span>Ship Lists Available</span></div>
        <div><span class="legend-line dotted"></span><span>Ship Lists Unavailable</span></div>
    </div>
</div>

{#if filteredShipData.length > 0}
<div id="ship-list-info" use:scrollTo>
    <h2>Ship Lists for {filteredByYearShipData[0]['Country']}</h2>
    <div>
        <span>Show voyages until: {selectedYear}</span>
        <input type="range" min="{minYear}" max="{maxYear}" bind:value="{selectedYear}" style="width:100%;" />
    </div>
    {#if selectedShip !== null}
        <div id="voyage-details">
            <h3>The {filteredByYearShipData[selectedShip]['Name of Ship']}</h3>
            <p>Arrived in {filteredByYearShipData[selectedShip]['Country']} on <span class="emphasis">{filteredByYearShipData[selectedShip]['ArrivalFormatted'].toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"long", day:"numeric"})}</span>
                {#if filteredByYearShipData[selectedShip]['Total Passengers']}
                    <span>carrying <span class="emphasis">{filteredByYearShipData[selectedShip]['Total Passengers']} passengers</span></span>
                    {#if filteredByYearShipData[selectedShip]['Total Passengers']}
                        <span>with <span class="emphasis">registration numbers {filteredByYearShipData[selectedShip]['Registration Numbers']}</span>.</span>
                    {:else}
                        .
                    {/if}
                {:else}
                    .
                {/if}
            </p>
            <p></p>
        </div>
    {/if}
    <div id="units">
        {#each filteredByYearShipData as ship, index}
            <div
                class="ship"
                style="background-color: {selectedShip === index ? 'gray' : 'black'}"
                on:click={() => selectShip(ship, index)}
            ></div>
        {/each}
    </div>
</div>
{/if}

<style>

    .emphasis {
        color:coral;
    }

    #voyage-details{
        background-color:white;
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        /* margin: 25px 0; */
        padding:25px;
        display:flex;
        flex-direction: column;
        gap:10px;
    }

    #ship-list-info{
        display:flex;
        flex-direction:column;
        gap:25px;
    }

    .ship {
        display: flex;
        width: 1em;
        aspect-ratio: 1;
        background: steelblue;
        border-radius: 50%;
    }

    #units {
        width: fit-content;
        display:flex;
        flex-wrap:wrap;
        gap:3px;
    }

    .legend {
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px;
    background: white;
    /* box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2); */
    z-index: 10;
    font-size: 14px;
}

.legend-key {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin-right: 5px;
    vertical-align: middle;
}

.legend-line {
    display: inline-block;
    width: 30px;
    height: 3px;
    margin-right: 5px;
    vertical-align: middle;
}

.legend-line.solid {
    background-color: #000;
}

.legend-line.dotted {
    border-bottom: 5px dotted #000;
}

</style>