<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import "../style.css";
  import { countrySummary } from "../lib/countrySummary";
  const countryColors = new Map(
    countrySummary.map((entry) => [entry.countryName, entry.color])
  );
  let availableCountries = countrySummary.filter((c) => c.shipDataAvailable);

  let selectedCountry = "Trinidad & Tobago";
  let shipData = [];
  let filteredShipData = [];
  let shipCount = 0;

  let svg;
  const margin = { top: 20, right: 10, bottom: 50, left: 60 };
  let width = 800 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  onMount(async () => {
    shipData = await d3.csv("shipListData.csv", (row) => ({
      ...row,
      ArrivalFormatted: new Date(row["Date of Arrival"]),
      Year: new Date(row["Date of Arrival"]).getFullYear(),
      PassengerCount: +row["Total Passengers"],
    }));

    filterShipData();

    // Make chart responsive
    window.addEventListener("resize", resizeChart);
    resizeChart();
  });

  function filterShipData() {
    filteredShipData = shipData.filter(
      (ship) => ship.Country === selectedCountry
    );
    shipCount = filteredShipData.length;
    drawBeeswarmPlot();
  }

  function getOpacity(totalPassengers) {
    if (!totalPassengers) return 1;
    return 0.3 + (totalPassengers / 800) * 0.7;
  }

  function resizeChart() {
    const containerWidth = document.getElementById("beeswarm-plot").clientWidth;
    width = Math.max(containerWidth - margin.left - margin.right, 300); // Set a minimum width
    drawBeeswarmPlot();
  }

  function drawBeeswarmPlot() {
    if (!svg) {
      svg = d3.select("#beeswarm-plot").append("svg").append("g");
    } else {
      svg.selectAll("*").remove();
    }

    // Update SVG dimensions
    d3.select("#beeswarm-plot")
      .select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.attr("transform", `translate(${margin.left},${margin.top})`);

    // Define x-scale
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(filteredShipData, (d) => d.Year))
      .range([50, width - 50]);

    const passengerExtent = d3
      .extent(filteredShipData, (d) => d.PassengerCount)
      .filter((v) => v !== null && v !== undefined && !isNaN(v));

    const sizeScale = d3
      .scaleSqrt()
      .domain(passengerExtent.length > 0 ? passengerExtent : [0, 1000])
      .range([6, 12]);

    const defaultRadius = 6;

    // Draw x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // Force simulation
    const simulation = d3
      .forceSimulation(filteredShipData)
      .force("x", d3.forceX((d) => xScale(d.Year)).strength(1.5))
      .force("y", d3.forceY(height / 2).strength(0.5))
      .force(
        "collide",
        d3.forceCollide((d) => sizeScale(d.PassengerCount) || defaultRadius + 1)
      )
      .stop();

    for (let i = 0; i < 500; i++) simulation.tick();

    svg
      .selectAll("circle")
      .data(filteredShipData)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => sizeScale(d.PassengerCount) || defaultRadius)
      .attr("fill", (d) =>
        isNaN(d.PassengerCount) || d.PassengerCount <= 0
          ? "white"
          : countryColors.get(d.Country)
      )
      .attr("stroke", (d) =>
        isNaN(d.PassengerCount) || d.PassengerCount <= 0
          ? countryColors.get(d.Country)
          : "none"
      )
      .attr("stroke-width", (d) =>
        isNaN(d.PassengerCount) || d.PassengerCount <= 0 ? 1.5 : 0
      )
      .attr("fill-opacity", (d) =>
        isNaN(d.PassengerCount) || d.PassengerCount <= 0
          ? 1
          : getOpacity(d.PassengerCount)
      )
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        const tooltip = d3.select("#tooltip");
        tooltip
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px")
          .style("display", "inline-block")
          .html(
            `<strong>The ${d["Name of Ship"]}</strong><br/>
            Arrived ${
              !isNaN(new Date(d.ArrivalFormatted).getMonth())
                ? `on <span class="underline">${d.ArrivalFormatted.toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</span>`
                : "on an unknown date"
            } ${
              !isNaN(d.PassengerCount) && d.PassengerCount !== 0
                ? `carrying <span class="underline">${d.PassengerCount} passengers</span> given
            registration numbers <span class="underline">${d["Registration Numbers"]}</span>`
                : ""
            }`
          );
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("stroke", (d) =>
            isNaN(d.PassengerCount) || d.PassengerCount <= 0
              ? countryColors.get(d.Country)
              : "none"
          )
          .attr("stroke-width", (d) =>
            isNaN(d.PassengerCount) || d.PassengerCount <= 0 ? 1.5 : 0
          );

        d3.select("#tooltip").style("display", "none");
      });
  }
</script>

<section id="ship-section">
  <div class="header-and-paragraphs">
    <h3>Ship Lists</h3>
    <p>
      Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non
      placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus
      mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo.
      Cras sollicitudin arcu nisi, in feugiat lorem facilisis non. Aliquam
      elementum erat ut purus sollicitudin sollicitudin. Mauris condimentum est
      vitae maximus faucibus.
    </p>
  </div>

  <div id="ship-list-settings">
    <div class="label-value-container">
      <p><strong>Country:</strong></p>
      <select bind:value={selectedCountry} on:change={filterShipData}>
        {#each availableCountries as country}
          <option value={country.countryName}>{country.countryName}</option>
        {/each}
      </select>
    </div>
    <div class="label-value-container">
      <p><strong>Ship Count:</strong></p>
      <p class="style-like-button">{shipCount}</p>
    </div>
  </div>

  <div id="beeswarm-plot" style="position: relative;"></div>
  <div
    id="tooltip"
    style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); border: 1px solid #ccc; padding: 10px; border-radius: 4px;"
  ></div>
</section>

<style>
  #tooltip {
    pointer-events: none;
    max-width: 300px;
  }

  circle {
    cursor: pointer;
  }

  select {
    background-color: #eeeeee;
    border: 0;
    padding: 5px;
    border-radius: 5px;
    color: rgb(51, 65, 85);
    cursor: pointer;
    font-size: 16px;
  }

  #ship-list-settings {
    display: flex;
    gap: 25px;
    align-items: center;
  }

  span.underline {
    text-decoration: underline !important;
    color: pink;
  }
</style>
