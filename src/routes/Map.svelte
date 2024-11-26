<script>
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import mapboxgl from 'mapbox-gl';
    import { routes } from '../lib/routes';
    import { countrySummary } from '../lib/countrySummary';
    import * as d3 from 'd3';
    import "../style.css";
    import Beeswarm from './Beeswarm.svelte';

    mapboxgl.accessToken = 'pk.eyJ1IjoiamFkZWRlbyIsImEiOiJjbTJuZzFpYWkwNTdhMmlvbW16bmt3bjlhIn0.QCsOvTO9JomVioOyAgZgPA';

    let map;
    let tooltip;
    let shipData = [];
    let filteredShipData = [];
    let selectedCountry = null;
    let selectedCountryColor = '#087F8C';
    const countryColors = new Map(countrySummary.map(entry => [entry.countryName, entry.color]));


    const maxIndentures = Math.max(...countrySummary.map(d => d.numIndentures));
    const lineThicknessScale = d3.scaleLinear()
        .domain([0, maxIndentures])
        .range([3, 8]);

    function getLineColor(numIndentures) {
        if (numIndentures > 200000) return '#E54F6D';
        if (numIndentures > 100000) return '#faae20';
        if (numIndentures > 50000) return '#86A873';
        return '#087F8C';
    }

    function getOpacity(totalPassengers) {
        if (!totalPassengers) return 1;
        return 0.1 + (totalPassengers / 800) * 0.7;
    }

    
    onMount(async() => {
        shipData = await d3.csv("shipListData.csv", row => ({
            ...row,
            'ArrivalFormatted': new Date(row['Date of Arrival'])
        }));

        map = new mapboxgl.Map({
            container: 'map',
            projection: 'mercator',
            style: 'mapbox://styles/mapbox/light-v11',
            zoom: 1.5,
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
                        'line-color' : countryColors.get(country.countryName),
                        'line-width' : 6,
                        'line-width': lineThicknessScale(country.numIndentures),
                        'line-dasharray': country.shipDataAvailable ? [1, 0] : [2, 2]  
                    }
                });

                map.on('mouseenter', layerId, (e) => {
                    const shipDataAvailable = e.features[0].properties.shipDataAvailable;
                    map.getCanvas().style.cursor = shipDataAvailable ? 'pointer' : 'default';
                    const description = e.features[0].properties.description;
                    // console.log(description);
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
                        selectCountry(country.countryName);
                    } else {
                        // console.log("dashed line clicked, no action");
                    }
                });
            });
        });

        return () => {
            map.remove();
        };
    });


    let minYear, maxYear, selectedYear;
    $: if (filteredShipData.length > 0) {
        minYear = d3.min(filteredShipData, d => d['ArrivalFormatted'] ? d['ArrivalFormatted'].getFullYear() : new Date().getFullYear());
        maxYear = d3.max(filteredShipData, d => d['ArrivalFormatted'] ? d['ArrivalFormatted'].getFullYear() : new Date().getFullYear());

        selectedYear = maxYear;
    }
    
    $: filteredByYearShipData = filteredShipData.filter(d => {
        return d['ArrivalFormatted'] && d['ArrivalFormatted'].getFullYear() <= selectedYear;
    });
    // $: console.log('filteredByYearShipData', filteredByYearShipData);


    let selectedShip = null;
    $: if (selectedYear) {
        selectedShip = null;
    }

    function selectShip(ship, index) {
        selectedShip = index;
        selectedCountry = ship.Country;

    }

    function selectCountry(countryName) {
        // selectedCountryColor = getLineColor(countrySummary.find(c => c.countryName === countryName).numIndentures);
        selectedCountryColor = countryColors.get(countryName);

        filteredShipData = shipData.filter(d => d.Country === countryName).map(d => ({
            ...d,
            'ArrivalYear': d['ArrivalFormatted'].getFullYear(),
            'Passengers': d['Total Passengers'] ? parseInt(d['Total Passengers'], 10) : 10
        }));
        selectedCountry = countryName;  // This ensures we keep track of the current selected country
    }

    // function scrollTo(node) {
    //     // console.log('HERE');
    //     node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }

    $: gradientStyle = `background-image: linear-gradient(to right, ${selectedCountryColor}33, ${selectedCountryColor})`;

</script>

<div class="header-and-paragraphs">
    <div>
        <h2>Where Did They Go?</h2>
        <h4>Some subheading goes here.</h4>
    </div>
    
    <p>Mauris auctor aliquam cursus. Praesent id vehicula est. Maecenas ut eros enim. Nulla facilisi. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus nec euismod dui, et maximus velit. Donec nec consequat libero.</p>

    <p>With recent generations, many descendents of indenture have attempted to trace their roots. This is an extremely difficult and time consuming process for most, made worse by the fact that <span class="emphasis">not every country has digitized their indentureship records</span>, whether that be ship or passenger lists.</p>

    <p><span class="emphasis">Guyana, previously both a Dutch and English colony, recevied the single largest population of indentured laborers from South Asia, and yet this information has not been compiled in any accessible or searchable form.</span> There are <a href="https://westindiandiplomacy.com/petition-to-preserve-digitize-indian-indentured-enslaved-african-records-in-the-caribbean/">ongoing petitions</a> to urge local governments to take up this important work before physical record books become irreversibly damaged.</p>
</div>

<div id="map-container">
    <div id="map" style="width: 100%; height: 600px;"></div>
    <div id="tooltip" style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; z-index: 1;">Tooltip Content</div>
    <!-- <div id="legend" class="legend">
        <h4>Legend</h4>
        <div><span class="legend-key" style="background-color: #E54F6D;"></span><span>Over 200,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #F6AE2D;"></span><span>Over 100,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #86A873;"></span><span>Over 50,000 indentures</span></div>
        <div><span class="legend-key" style="background-color: #087F8C;"></span><span>Less than 50,000 indentures</span></div>
        <div><span class="legend-line solid"></span><span>Ship Lists Available</span></div>
        <div><span class="legend-line dotted"></span><span>Ship Lists Unavailable</span></div>
    </div> -->
</div>

{#if filteredShipData.length > 0}

<Beeswarm data={filteredShipData} />

<!-- use:scrollTo -->
<div id="ship-list-info" >
    <div class="header-and-paragraphs">
        <div>
            <h2>Voyages Destined for {filteredByYearShipData[0]['Country']}</h2>
        </div>
    </div>



    <di id="dot-settings">
        <div id="dot-legend">
            <div class="dot-legend-label row">
                <div class="ship" style=" background-color:unset; {`border: 1px solid ${selectedCountryColor}`}"></div>
                <p>Passenger Information Unavailable</p>
            </div>
            <div class="dot-legend-label">
                <div id="dot-gradient" style={gradientStyle}></div>
                <div id="passenger-amounts">
                    <p>Less Passengers</p>
                    <p>More Passengers</p>
                </div>
            </div>
        </div>
        <div id="slider">
            <p><span>Show voyages until: {selectedYear}</span></p>
            <input type="range" min="{minYear}" max="{maxYear}" bind:value="{selectedYear}" style="width:100%;" />
        </div>
    </div>
    
    <div id="units">
        {#each filteredByYearShipData as ship, index}
            <div
                class="ship"
                style="border: {ship['Total Passengers'] ? '' : `1px solid ${selectedCountryColor}`}; background-color: {ship['Total Passengers'] ? selectedCountryColor : 'unset'}; opacity: {getOpacity(ship['Total Passengers'])}"
                on:click={() => selectShip(ship, index)}
            ></div>
        {/each}
    </div>
    {#if selectedShip !== null}


        <div id="voyage-details" transition:slide="{{ duration: 500 }}">
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
{/if}

<style>

    #dot-settings{
        display:grid;
        grid-template-columns:3fr 5fr;
        gap:30px;
        align-items: center;
    }

    #passenger-amounts{
        width:100%;
        display:flex;
        justify-content: space-between;
    }

    #dot-gradient {
        width:100%;
        height:15px;
    }

    .dot-legend-label{
        display:flex;
        flex-direction: column;
        gap:5px;
        width:100%;
        justify-content: center;
    }
    .dot-legend-label.row{
        flex-direction: row;
        justify-content: flex-start;
        gap:8px;

    }

    #dot-legend{
        background-color:white;
        display:flex;
        flex-direction: column;
        gap:15px;
    }



    .emphasis {
        color:#E54F6D;
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
        transition: transform 0.2s ease-in-out;
        cursor: pointer;
    }

    .ship:hover {
        transform: scale(1.5);
        /* border:3px solid white; */
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