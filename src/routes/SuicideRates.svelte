<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { countrySummary } from '../lib/countrySummary';

    let suicideData = [];
    let processedData = [];
    let svgElement;
    const summaryCountries = new Set(countrySummary.map(entry => entry.countryName));

    onMount(async () => {


        suicideData = await d3.csv("suicideRates.csv", d => ({
            country: d.country,
            year: +d.year,
            suicides: +d.suicides_no,
            population: +d.population
        }));
        // console.log(suicideData);

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

        processedData = countryRates.sort((a, b) => b.averageRate - a.averageRate).slice(0, 50);

        console.log("Processed Data", processedData);
        drawChart(summaryCountries);
    });



    function drawChart(summaryCountries) {
        if (!processedData.length) return;

        const colors = d3.scaleOrdinal(d3.schemeCategory10);
        const colorFallback = '#ccc';  // Gray color for countries not in summary

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

        const y = d3.scaleLinear()
            .domain([0, d3.max(processedData, c => d3.max(c.years, d => d.rate))])
            .range([height, 0]);

        // Define the line generator
        const line = d3.line()
            .defined(d => d.rate !== null)  // Skip undefined values to not draw part of the line
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
            .attr('stroke', d => summaryCountries.has(d.country) ? colors(d.country) : colorFallback)
            .attr('stroke-width', 2)
            .attr('class', 'line')
            .attr('d', d => line(d.years));

        lines.filter(d => summaryCountries.has(d.country)).raise();
    }


</script>


<div class="header-and-paragraphs">
    <h3>Prevalence of Suicide</h3>
    <p>Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo. Cras sollicitudin arcu nisi, in feugiat lorem facilisis non. Aliquam elementum erat ut purus sollicitudin sollicitudin. Mauris condimentum est vitae maximus faucibus.</p>
</div>
<svg bind:this={svgElement}></svg>
<div id="tooltip" style="position: absolute; visibility: hidden; background-color: white; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"></div>



<style>
    path {
        stroke-linejoin: round;
        stroke-linecap: round;
    }
</style>