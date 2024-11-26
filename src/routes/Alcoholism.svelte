<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { countrySummary } from '../lib/countrySummary';
    import { southAsia, westAfrica } from '../lib/filteringGroups';
  
    let data = [];
    let filteredData = [];
    let year = "2019";
    let tooltip;

    const countryColors = new Map(countrySummary.map(entry => [entry.countryName, entry.color]));
    const relevantCountries = new Set([
            ...countrySummary.map(country => country.countryName),
            ...southAsia,
            ...westAfrica,
        ]);


    onMount(async () => {
      data = await d3.csv("alcoholConsumption.csv", row => ({
            Country: row.Entity,
            Year: +row.Year,
            Male: +row.Male,
            Female: +row.Female,
            Population: row.Population,
        }));

        filterByYear();

        tooltip = document.getElementById('tooltipAlcoholism');
    });

    function filterByYear() {
        filteredData = data.filter(d => (d.Year == year && relevantCountries.has(d.Country)));
        createChart();
    }

    function createChart() {
        const svgElement = document.getElementById('chart');
        svgElement.innerHTML = '';

        const svg = d3.select(svgElement)
            .attr('viewBox', '0 0 800 500')
            .append('g');

        const margin = { top: 20, right: 30, bottom: 50, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
                        .domain([0, 3.5/*d3.max(filteredData, d => d.Female)*/])
                        .range([0, width]);

        const yScale = d3.scaleLinear()
                        .domain([0, 16 /*d3.max(filteredData, d => d.Male)*/])
                        .range([height, 0]);


        const populationExtent = d3.extent(filteredData, d => +d.Population);
        // console.log('Population Extent:', populationExtent);

        const populationScale = d3.scaleSqrt()
                .domain(populationExtent)
                .range([8, 20]); 

        const g = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`);

        // Draw the X-axis
        g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(width / 50).tickFormat(d => `${d}L`));

        // Draw the Y-axis
        g.append('g')
        .call(d3.axisLeft(yScale).ticks(height / 50).tickFormat(d => `${d}L`));

        // Axis Labels
        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2 + margin.left)
        .attr('y', height + margin.top + 40)
        .text('Female Consumption (liters)');

        svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left / 4)
        .attr('x', -(margin.top + height / 2))
        .text('Male Consumption (liters)');

        // Draw circles
        g.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.Female))
        .attr('cy', d => yScale(d.Male))
        .attr('r', d => populationScale(d.Population))
        .attr('fill', 
            d => countryColors.get(d.Country) || 
            (southAsia.includes(d.Country) ? '#ccc' : '#7d7d7d'))
        .attr('stroke', 'gray')
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
            console.log('HOVERING', d, event)
            const description = `<strong>${d.Country}</strong><br>Male: ${d.Male}L<br>Female: ${d.Female}L`;
            tooltip.innerHTML = description;
            
            tooltip.style.display = 'block';
            
            const xOffset = 10;
            const yOffset = 10;

            tooltip.style.left = `${event.pageX + xOffset}px`;
            tooltip.style.top = `${event.pageY + yOffset}px`;

            // console.log(event.x, event.y);
        })
        .on('mouseout', function() {
            tooltip.style.display = 'none';
        });
    }


</script>


<div class="header-and-paragraphs">
    <h3>Alcoholism</h3>
    <p>Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo. Cras sollicitudin arcu nisi, in feugiat lorem facilisis non. Aliquam elementum erat ut purus sollicitudin sollicitudin. Mauris condimentum est vitae maximus faucibus.</p>
</div>

<div>
    <h4>Alcohol Consumtion Per Capita, 2000-2019</h4>
    <small class="sources">Source: Title Here, <a href="/">World Health Organization</a></small>
</div>

<div class="radio-inputs">
    <label class="radio">
        <input type="radio" name="radio" bind:group={year} value="2000" on:change={() => filterByYear()}>
        <span class="name">2000</span>
    </label>
    <label class="radio">
        <input type="radio" name="radio" bind:group={year} value="2005" on:change={() => filterByYear()}>
        <span class="name">2005</span>
    </label>
        
    <label class="radio">
        <input type="radio" name="radio" bind:group={year} value="2010" on:change={() => filterByYear()}>
        <span class="name">2010</span>
    </label>

    <label class="radio">
        <input type="radio" name="radio" bind:group={year} value="2015" on:change={() => filterByYear()}>
        <span class="name">2015</span>
    </label>

    <label class="radio">
        <input type="radio" name="radio" bind:group={year} value="2019" on:change={() => filterByYear()}>
        <span class="name">2019</span>
    </label>
</div>

<div >
    <svg id="chart"></svg>
    <div id="tooltipAlcoholism" style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; z-index: 1;">Tooltip Content</div>
</div>

<style>

/* ANIMATIONS? */
.radio-inputs {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  border-radius: 0.5rem;
  background-color: #eee;
  box-sizing: border-box;
  box-shadow: 0 0 0px 1px rgba(0, 0, 0, 0.06);
  padding: 0.25rem;
  width: 100%;
  font-size: 14px;
}

.radio-inputs .radio {
  flex: 1 1 auto;
  text-align: center;
}

.radio-inputs .radio input {
  display: none;
}

.radio-inputs .radio .name {
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  padding: 0.5rem 0;
  color: rgba(51, 65, 85, 1);
  transition: all 0.15s ease-in-out;
}

.radio-inputs .radio .name:hover {
  background-color: rgb(219, 219, 219);
}

.radio-inputs .radio input:checked + .name {
  background-color: #fff;
  font-weight: 600;
}


</style>
  