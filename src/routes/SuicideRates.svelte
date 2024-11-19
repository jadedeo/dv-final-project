<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import {northCentralAmerica, southAmerica, caribbean} from '../lib/filteringGroups';
    import { countrySummary } from '../lib/countrySummary';

    let suicideData = [];
    let processedData = [];
    let svgElement;
    let topCutoff = 25;
    const summaryCountries = new Set(countrySummary.map(entry => entry.countryName));
    const countryColors = new Map(countrySummary.map((entry, index) => [entry.countryName, d3.schemeCategory10[index % 10]]));


    async function fetchData() {
        suicideData = await d3.csv("suicideRates.csv", d => ({
            country: d.country,
            year: +d.year,
            suicides: +d.suicides_no,
            population: +d.population
        }));
        // console.log(suicideData);
        processAndDraw();
    }

    function processAndDraw() {
        let countryRates = d3.rollups(suicideData, v => {
            const suicides = d3.sum(v, d => d.suicides);
            const population = d3.sum(v, d => d.population);
            return {suicides, population};
        }, d => d.country, d => d.year)
        .map(([country, years]) => ({
            country,
            years: years.map(([year, data]) => ({
                year,
                rate: (data.suicides / data.population) * 100000
            })),
            averageRate: d3.mean(years, ([, data]) => (data.suicides / data.population) * 100000)
        }));

        processedData = countryRates.sort((a, b) => b.averageRate - a.averageRate).slice(0, topCutoff);
        console.log(processedData);
        drawChart(summaryCountries);
    }

    onMount(() => {
        fetchData();
    });

    $: if (topCutoff && suicideData.length > 0) {
        processAndDraw();
    }

    function drawChart(summaryCountries) {
        d3.select(svgElement).selectAll('*').remove();

        if (!processedData.length) return;

        const colors = d3.scaleOrdinal(d3.schemeCategory10);
        const colorFallback = '#e0e0e0';
        const hoverColor = '#707070';

        const margin = {top: 20, right: 30, bottom: 30, left: 60},
            width = 800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        const svg = d3.select(svgElement)
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(processedData.flatMap(c => c.years), d => d.year))
            .range([0, width]);

        const yMin = d3.min(processedData, c => d3.min(c.years, d => d.rate));
        const yMax = d3.max(processedData, c => d3.max(c.years, d => d.rate));

        const y = d3.scaleLinear()
            .domain([yMin > 0 ? yMin * 0.9 : yMin * 1.1, yMax * 1.1]) // Reduce or increase by 10% for padding
            .range([height, 0]);

        const line = d3.line()
            .defined(d => d.rate !== null)  
            .x(d => x(d.year))
            .y(d => y(d.rate));

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format('d')));

        svg.append('g')
            .call(d3.axisLeft(y));

        const lines = svg.selectAll('.line')
            .data(processedData)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', d => summaryCountries.has(d.country) ? countryColors.get(d.country) : colorFallback)
            .attr('stroke-width', 2)
            .attr('class', 'line')
            .attr('d', d => line(d.years))
            .on('mouseover', function(event, d) {
                if (!summaryCountries.has(d.country)) {
                    d3.select(this).attr('stroke', hoverColor);
                }
                const xPosition = event.pageX;
                const yPosition = event.pageY;
                d3.select('#tooltipSuicide')
                    .style('left', xPosition + 'px')
                    .style('top', yPosition + 'px')
                    .style('visibility', 'visible')
                    .html(`${d.country}<br/>Average Rate: ${d.averageRate.toFixed(2)}`);
            })
            .on('mouseout', function(event, d) {
                console.log(d);
                console.log(d.country, summaryCountries.has(d.country));
                // Restore the color using the fixed mapping or fallback color
                d3.select(this).attr('stroke', summaryCountries.has(d.country) ? countryColors.get(d.country) : colorFallback);
                d3.select('#tooltipSuicide').style('visibility', 'hidden');
            });



        lines.filter(d => summaryCountries.has(d.country)).raise();
    }
</script>


<div class="header-and-paragraphs">
    <h3>Prevalence of Suicide</h3>
    <p>Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo. Cras sollicitudin arcu nisi, in feugiat lorem facilisis non. Aliquam elementum erat ut purus sollicitudin sollicitudin. Mauris condimentum est vitae maximus faucibus.</p>
</div>


<h4>Average Suicide Rates per 100k, 1986-2016</h4>

<div>
    <label>Show Top </label>
    <select bind:value = {topCutoff}>
        <option value={25}>25</option>
        <option value={50}>50</option>
    </select>
</div>
<div>

</div>

<div>
<svg id="suicideChart" bind:this={svgElement}></svg>
<div id="tooltipSuicide" style="position: absolute; visibility: hidden; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; border: 1px solid #ccc;"></div>
</div>


<style>
    #suicideChart {
        background-color:white;
    }


</style>