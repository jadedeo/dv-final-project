<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import "../style.css";
    import { countrySummary } from '../lib/countrySummary';


    export let data; 
    $: console.log(data);

    let width = 400;
    let height = 400;

    const RADIUS = 5;

    $: simulation = d3.forceSimulation(data)
        .force("x", 
            d3.forceX()
                .x(d => d.ArrivalYear)
                .strength(0.8)
        )
        .force("y",
            d3.forceY()
                .y(d => height / 2)
                .strength(0.2)
        )
        .force('collide',
            d3.forceCollide().radius(RADIUS)
        )
    
    $: console.log('nodes', simulation.nodes());

    const margin = {top: 0, right: 0, bottom: 20, left: 0};
    $: innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bottom;

    $: console.log(innerWidth);

    $: xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.ArrivalYear))
        .range([0, innerWidth])

    $: yScale = d3.scaleLinear()
        .domain([0, height])
        .range([innerHeight, 0])

    $: nodes = simulation.nodes();

</script>

<h1>Beeswarm Here</h1>



<div class="chart-container" bind:clientWidth={width}>
    <svg width={width} height={height}>
        <g class="inner-chart" transform="translate({margin.left}, {margin.top})">
            {#each nodes as node}
                <circle
                    cx={node.x}
                    cy={node.y}
                    r={RADIUS}
                    fill="steelblue"
                />
            {/each}
        </g>
    </svg>
</div>



<style>

</style>