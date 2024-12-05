<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { countrySummary } from "../lib/countrySummary";
  import { southAsia, westAfrica } from "../lib/filteringGroups";
  import "../style.css";

  let data = [];
  let filteredData = [];
  let sliderYear = 2019;
  let tooltip;

  // console.log(countrySummary);

  const validYears = [2000, 2005, 2010, 2015, 2019];
  const countryColors = new Map(
    countrySummary.map((entry) => [entry.countryName, entry.color])
  );
  const summaryCountries = new Set(
    countrySummary.map((entry) => entry.countryName)
  );
  const relevantCountries = new Set([
    ...countrySummary.map((country) => country.countryName),
    ...southAsia,
    // ...westAfrica,
  ]);

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  onMount(async () => {
    data = await d3.csv("alcoholConsumption.csv", (row) => ({
      Country: row.Entity,
      Year: +row.Year,
      Male: +row.Male,
      Female: +row.Female,
      Population: row.Population,
    }));

    tooltip = document.getElementById("tooltipAlcoholism");

    createChart();
    filterByYear();
  });

  function filterByYear() {
    filteredData = data.filter(
      (d) => d.Year === sliderYear && relevantCountries.has(d.Country)
    );
    d3.selectAll("text.label").style("opacity", 0); // Hide labels
    updateChart();
  }
  function createChart() {
    const svgElement = document.getElementById("chart");
    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 800 500`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 3.5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 16]).range([height, 0]);

    // Draw gridlines
    const yAxisGridlines = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat("")
      .ticks(height / 50);

    svg
      .append("g")
      .attr("class", "grid")
      .call(yAxisGridlines)
      .selectAll("line")
      .style("stroke", "#ddd")
      .style("stroke-opacity", 0.7);

    svg.select(".grid path").style("stroke-width", 0);

    // Draw axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width / 50)
          .tickFormat((d) => `${d}L`)
      );

    svg
      .append("g")
      .attr("class", "y-axis")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(height / 50)
          .tickFormat((d) => `${d}L`)
      );

    // Add axis labels
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .text("Female Consumption (liters)");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .text("Male Consumption (liters)");
  }

  function updateChart() {
    const svg = d3.select("#chart g");

    const xScale = d3.scaleLinear().domain([0, 3.5]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 16]).range([height, 0]);
    const populationScale = d3
      .scaleSqrt()
      .domain(d3.extent(data, (d) => +d.Population))
      .range([10, 20]);

    // Bind data to circles
    const circles = svg
      .selectAll("circle")
      .data(filteredData, (d) => d.Country);

    // Update existing circles
    circles
      .transition()
      .duration(1000)
      .attr("cx", (d) => xScale(d.Female))
      .attr("cy", (d) => yScale(d.Male))
      .attr("r", (d) => populationScale(d.Population));

    // Enter new circles
    circles
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.Female))
      .attr("cy", (d) => yScale(d.Male))
      .attr("r", (d) => populationScale(d.Population))
      .attr(
        "fill",
        (d) =>
          countryColors.get(d.Country) ||
          (southAsia.includes(d.Country) ? "#ccc" : "#7d7d7d")
      )
      .attr("opacity", (d) => (countryColors.get(d.Country) ? 1 : 0.5))
      .attr("stroke", (d) => (countryColors.get(d.Country) ? "" : "#b5b3b3"))
      .on("mouseover", function (event, d) {
        tooltip.innerHTML = `<strong>${d.Country}</strong><br>Male: ${d.Male}L<br>Female: ${d.Female}L`;
        tooltip.style.display = "block";
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
      })
      .on("mouseout", function () {
        tooltip.style.display = "none";
      });

    // Remove old circles
    circles.exit().transition().duration(1000).attr("r", 0).remove();
  }

  // Snap slider to valid years
  function snapToValidYear(event) {
    const inputYear = +event.target.value;
    const closestYear = validYears.reduce((prev, curr) =>
      Math.abs(curr - inputYear) < Math.abs(prev - inputYear) ? curr : prev
    );
    sliderYear = closestYear;
    filterByYear();
  }
  // $: console.log(data);
  // $: console.log(filteredData);

  // console.log(summaryCountries);
</script>

<section id="alcoholism-section">
  <div class="header-and-paragraphs">
    <h2>Alcoholism</h2>
    <p>
      The historical context of indentureship in former sugar colonies such as
      Guyana, Trinidad, Suriname, Fiji, and South Africa is intrinsically linked
      to the cultivation of sugarcane and the production of rum—a byproduct of
      the sugar industry. Rum not only served as a significant economic
      commodity but also played a complex role in the lives of indentured
      laborers, often being used as a form of payment and a means to cope with
      the harsh realities of their servitude.
    </p>
    <p>
      This practice embedded patterns of alcohol use among populations, which
      have evolved differently across regions due to varying cultural
      influences. By juxtaposing these countries with regions in West Africa and
      South Asia, where racial similarities exist but cultural contexts differ
      significantly, this visualization aims to explore how these differences
      influence contemporary patterns of alcoholism, providing insight into the
      enduring impacts of colonial economic practices on public health and
      social behaviors.
    </p>
  </div>

  <div>
    <h4>Alcohol Consumtion Per Capita, 2000-2019</h4>
    <small class="sources"
      >Source: Title Here, <a href="/" target="_blank"
        >World Health Organization</a
      ></small
    >
  </div>

  <div id="slider-container">
    <div class="label-value-container">
      <p><strong>Year:</strong></p>
      <p class="style-like-button">{sliderYear}</p>
    </div>
    <input
      type="range"
      min="2000"
      max="2019"
      step="1"
      bind:value={sliderYear}
      on:input={snapToValidYear}
    />
  </div>

  <div>
    <div id="legend" class="legend" style="display: none;">
      {#each summaryCountries as country}
        <div class="legend-entry" style="align-items: center; display: flex;">
          <div
            style="width: 15px; height: 15px; border-radius: 50%; background-color: {countryColors.get(
              country
            )}; margin-right: 5px;"
          ></div>
          <span>{country}</span>
        </div>
      {/each}
    </div>
    <div class="legend">
      {#each summaryCountries as country}
        <div
          class="legend-entry"
          style="align-items: center; display: flex; flex-direction:row;"
        >
          <div
            style="width: 15px; height: 15px; border-radius: 50%; background-color: {countryColors.get(
              country
            )}; margin-right: 5px;"
          ></div>
          <p>{country}</p>
        </div>
      {/each}
      <div class="legend-entry" style="align-items: center; display: flex;">
        <div
          style="width: 15px; height: 15px; border-radius: 50%; background-color: #ccc; margin-right: 5px;"
        ></div>
        <span>Mainland South Asia</span>
      </div>
    </div>
    <!-- <div class="legend">
      <div class="legend-entry" style="align-items: center; display: flex;">
        <div
          style="width: 15px; height: 15px; border-radius: 50%; background-color: #ccc; margin-right: 5px;"
        ></div>
        <span>South Asia</span>
      </div>
    </div> -->

    <div id="alcoholismChart-container">
      <svg id="chart"></svg>
      <div
        id="tooltipAlcoholism"
        style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; z-index: 1;"
      >
        Tooltip Content
      </div>
    </div>
  </div>
</section>

<style>
  #alcoholismChart-container {
    max-width: 900px;
    margin: 0 auto;
  }
  input[type="range"] {
    width: 100%;
    margin: 10px 0;
  }

  #slider-container {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    column-gap: 20px;
    row-gap: 5px;
    padding: 0.5rem;
    border-radius: 0.5rem;
    justify-content: center;
  }
</style>
