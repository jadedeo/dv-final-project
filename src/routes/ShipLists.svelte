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
  const margin = { top: 20, right: 10, bottom: 0, left: 10 };
  let width;
  let height;

  onMount(async () => {
    shipData = await d3.csv("shipListDataNew.csv", (row) => ({
      ...row,
      ArrivalFormatted: new Date(row["Date of Arrival"]),
      Year: new Date(row["Date of Arrival"]).getFullYear(),
      PassengerCount: +row["Total Passengers"],
    }));

    const container = document.getElementById("ship-section");
    width = container.clientWidth - margin.left - margin.right;
    height = container.clientHeight - margin.top - margin.bottom;

    filterShipData();

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
    const container = document.getElementById("ship-section");
    const containerWidth = container.clientWidth;
    // const containerHeight = container.clientHeight;

    width = containerWidth - margin.left - margin.right;
    // height = containerHeight - margin.top - margin.bottom;

    drawBeeswarmPlot();
  }

  function drawBeeswarmPlot() {
    if (!svg) {
      svg = d3
        .select("#beeswarm-plot")
        .append("svg")
        .attr(
          "viewBox",
          `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`
        )
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");
    } else {
      svg.selectAll("*").remove();
    }

    d3.select("#beeswarm-plot")
      .select("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.attr("transform", `translate(${margin.left},${margin.top})`);

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

    svg
      .append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

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
            `<strong>${d["Name of Ship"] ? `The ${d["Name of Ship"]}` : `Unnamed Ship`}</strong><br/>
          Arrived ${
            !isNaN(new Date(d.ArrivalFormatted).getMonth())
              ? `on <em>${d.ArrivalFormatted.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</em>`
              : "on an unknown date"
          } ${
            !isNaN(d.PassengerCount) && d.PassengerCount !== 0
              ? `carrying <em>${d.PassengerCount} passengers</em> given
          registration numbers <em>${d["Registration Numbers"]}</em>`
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

  $: selectedCountryData = countrySummary.filter(
    (country) => country.countryName == selectedCountry
  )[0];
  $: selectedSource = selectedCountryData.shipDataSource;
  // $: console.log("selectedSource", selectedSource);
</script>

<section id="ship-section">
  <div class="header-and-paragraphs">
    <h2>Ship Lists</h2>
    <p>
      Each of the dots below represents a voyage carrying indentured laborers
      from the subcontinent to the selected colony.
    </p>
    <p>
      With recent generations, many descendents of indenture have attempted to
      trace their roots. This is an extremely difficult and time consuming
      process for most, made worse by the fact that not every country has
      digitized their indentureship records, whether that be ship or passenger
      lists.
    </p>
    <p>
      Guyana, previously both a Dutch and English colony, recevied the single
      largest population of indentured laborers from South Asia, and yet this
      information has not been compiled in any accessible or searchable form.
      There are
      <a
        href="https://westindiandiplomacy.com/petition-to-preserve-digitize-indian-indentured-enslaved-african-records-in-the-caribbean/"
        >ongoing petitions</a
      > to urge local governments to take up this important work before physical
      record books become irreversibly damaged.
    </p>
  </div>

  <div id="ship-list-all-settings">
    <div class="ship-list-settings">
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
      <div>
        <small class="sources"
          >Source: <a href={selectedSource.link} target="_blank"
            >{selectedSource.text}</a
          ></small
        >
      </div>
    </div>

    <div class="ship-list-settings">
      <div class="label-value-container">
        <div
          id="key-empty-circle"
          style="border-color: {countryColors.get(selectedCountry)};"
        ></div>
        <p>No Passenger Data Available</p>
      </div>
      <div class="label-value-container">
        <div
          id="key-small-circle"
          style="background-color: {countryColors.get(
            selectedCountry
          )}; opacity: 0.3;"
        ></div>
        <p>Less Passengers</p>
      </div>
      <div class="label-value-container">
        <div
          id="key-large-circle"
          style="background-color: {countryColors.get(
            selectedCountry
          )}; opacity: 1;"
        ></div>
        <p>More Passengers</p>
      </div>
    </div>
  </div>
  <div id="beeswarm-container">
    <div id="beeswarm-plot" style="position: relative;"></div>
    <div
      id="tooltip"
      style="position: absolute; display: none; background: rgba(255, 255, 255, 0.8); border: 1px solid #ccc; padding: 10px; border-radius: 4px;"
    ></div>
  </div>
</section>

<style>
  a {
    color: inherit;
  }

  #beeswarm-container {
    max-width: 1024px;
    margin: 0 auto;
  }
  #key-empty-circle {
    width: 1em;
    height: 1em;
    border: 1.5px solid;
    border-radius: 50%;
    opacity: 1;
  }

  #key-small-circle {
    width: 0.8em;
    height: 0.8em;
    background-color: red;
    border-radius: 50%;
    opacity: 0.3;
  }

  #key-large-circle {
    width: 1.2em;
    height: 1.2em;
    background-color: red;
    border-radius: 50%;
    opacity: 1;
  }

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
  }

  .ship-list-settings {
    display: flex;
    gap: 25px;
    align-items: center;
  }

  span.underline {
    text-decoration: underline !important;
    color: pink;
  }

  .label-value-container p {
    font-size: 14px;
  }

  #ship-list-all-settings {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
</style>
