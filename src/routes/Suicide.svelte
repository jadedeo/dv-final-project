<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { countrySummary } from "../lib/countrySummary";
  import {
    caribbeanCountries,
    southAmericaCountries,
  } from "../lib/filteringGroups";
  import "../style.css";

  let suicideData = [];
  let processedData = [];
  let genderSpecificData = {};
  let countrySelected = false;
  let topCutoff = 25;
  const summaryCountries = new Set(
    countrySummary.map((entry) => entry.countryName)
  );
  const countryColors = new Map(
    countrySummary.map((entry) => [entry.countryName, entry.color])
  );

  let radioSelected = "caribbean";

  function onChange(event) {
    radioSelected = event.currentTarget.value;
  }

  async function fetchData() {
    suicideData = await d3.csv("suicideRates.csv", (d) => ({
      country: d.country,
      year: +d.year,
      suicides: +d.suicides_no,
      population: +d.population,
      gender: d.sex,
    }));
    processAndDraw();
  }

  function processAndDraw() {
    let countryRates = d3
      .rollups(
        suicideData,
        (v) => {
          const suicides = d3.sum(v, (d) => d.suicides);
          const population = d3.sum(v, (d) => d.population);
          return { suicides, population };
        },
        (d) => d.country,
        (d) => d.year
      )
      .map(([country, years]) => ({
        country,
        years: years.map(([year, data]) => ({
          year,
          rate: (data.suicides / data.population) * 100000,
        })),
        averageRate: d3.mean(
          years,
          ([, data]) => (data.suicides / data.population) * 100000
        ),
      }));

    // console.log('countryRates', countryRates);

    if (radioSelected == "top50") {
      processedData = countryRates
        .sort((a, b) => b.averageRate - a.averageRate)
        .slice(0, 50);
    } else if (radioSelected == "countriesInterest") {
      processedData = countryRates.filter((d) =>
        summaryCountries.has(d.country)
      );
    } else if (radioSelected == "caribbean") {
      processedData = countryRates.filter((d) =>
        caribbeanCountries.includes(d.country)
      );
    } else if (radioSelected == "southAmerica") {
      processedData = countryRates.filter((d) =>
        southAmericaCountries.includes(d.country)
      );
    } else {
      processedData = countryRates
        .sort((a, b) => b.averageRate - a.averageRate)
        .slice(0, topCutoff);
    }

    // console.log('processedData', processedData);

    genderSpecificData = d3
      .rollups(
        suicideData,
        (v) => ({
          suicides: d3.sum(v, (d) => d.suicides),
          population: d3.sum(v, (d) => d.population),
        }),
        (d) => d.country,
        (d) => d.year,
        (d) => d.gender
      )
      .map(([country, years]) => ({
        country,
        years: years.map(([year, genders]) => ({
          year,
          genders: genders.map(([gender, data]) => ({
            gender,
            rate: (data.suicides / data.population) * 100000,
          })),
        })),
      }));

    drawMainChart();
  }

  onMount(() => {
    fetchData();
  });

  $: if (radioSelected && suicideData.length > 0) {
    processAndDraw();
  }

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  function drawMainChart() {
    if (!processedData.length) return;

    const colorFallback = "#ebebeb";
    const hoverColor = "#a6a6a6";

    const svgElement = document.getElementById("suicideChart");
    svgElement.innerHTML = "";

    const svg = d3
      .select(svgElement)
      .attr("viewBox", "0 0 800 500")
      .append("g");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(
        d3.extent(
          processedData.flatMap((c) => c.years),
          (d) => d.year
        )
      )
      .range([0, width]);

    const yMin = d3.min(processedData, (c) => d3.min(c.years, (d) => d.rate));
    const yMax = d3.max(processedData, (c) => d3.max(c.years, (d) => d.rate));

    const yScale = d3
      .scaleLinear()
      .domain([yMin > 0 ? yMin * 0.9 : yMin * 1.1, yMax * 1.1])
      .range([height, 0]);

    const yAxisGridlines = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat("")
      .ticks(height / 50);

    g.append("g")
      .attr("class", "grid")
      .call(yAxisGridlines)
      .selectAll("line")
      .style("stroke", "#ddd")
      .style("stroke-opacity", 0.7);

    svg.select(".grid path").style("stroke-width", 0);

    const line = d3
      .line()
      .defined((d) => d.rate !== null)
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.rate));

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width / 50)
          .tickFormat((d) => d)
      );

    g.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(height / 50)
        .tickFormat((d) => d)
    );

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .text("Year");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 4)
      .attr("x", -(margin.top + height / 2))
      .text("Rate per 100k");

    const lines = g
      .selectAll(".line")
      .data(processedData)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", (d) =>
        summaryCountries.has(d.country)
          ? countryColors.get(d.country)
          : colorFallback
      )
      .attr("stroke-width", 2)
      .attr("class", "line")
      .attr("d", (d) => line(d.years))
      .attr("stroke-dasharray", function () {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashoffset", function () {
        const length = this.getTotalLength();
        return length;
      });

    lines
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0)
      .on("end", function () {
        d3.select(this)
          .on("mouseover", function (event, d) {
            if (!summaryCountries.has(d.country)) {
              d3.select(this).attr("stroke", hoverColor);
              d3.select(this).raise().attr("stroke", hoverColor);
            }
            if (!summaryCountries.has(d.country)) {
              d3.select(this).attr("stroke", hoverColor);
              d3.select(this).raise().attr("stroke", hoverColor);
            }
          })
          .on("mousemove", function (event, d) {
            const pointer = d3.pointer(event, this);
            const x0 = xScale.invert(pointer[0]);
            const bisect = d3.bisector((d) => d.year).left;
            const idx = bisect(d.years, x0, 1);
            const a = d.years[idx - 1];
            const b = d.years[idx];
            const yearData = b && x0 - a.year > b.year - x0 ? b : a;
            if (!yearData) return;

            d3.select("#tooltipSuicide")
              .style("left", event.pageX + "px")
              .style("top", event.pageY + "px")
              .style("visibility", "visible")
              .html(
                `<strong>${d.country}</strong><br>Year: ${yearData.year}<br>Rate: ${yearData.rate.toFixed(2)}`
              );
          })
          .on("mouseout", function (event, d) {
            d3.select(this).attr(
              "stroke",
              summaryCountries.has(d.country)
                ? countryColors.get(d.country)
                : colorFallback
            );
            if (!summaryCountries.has(d.country)) {
              d3.select(this).lower();
            }
            d3.select(this).attr(
              "stroke",
              summaryCountries.has(d.country)
                ? countryColors.get(d.country)
                : colorFallback
            );
            if (!summaryCountries.has(d.country)) {
              d3.select(this).lower();
            }
            d3.select("#tooltipSuicide").style("visibility", "hidden");
          });
      });

    lines.filter((d) => summaryCountries.has(d.country));

    lines.filter((d) => !summaryCountries.has(d.country)).lower();
    lines.filter((d) => summaryCountries.has(d.country)).raise();

    setUpLegend();
  }

  function handleGoBack() {
    countrySelected = false;
    drawMainChart();
  }

  $: activeCountries = [];
  // $: console.log("Active Countries for Legend:", activeCountries);

  function setUpLegend() {
    const legendContainer = d3.select("#legend");
    legendContainer.selectAll(".legend-entry").remove();

    activeCountries = processedData.filter((d) =>
      summaryCountries.has(d.country)
    );
  }
</script>

<section id="suicide-section">
  <div class="header-and-paragraphs">
    <h2>Suicide</h2>
    <p>
      The enduring legacy of colonization and indentureship has profoundly
      impacted the mental health of populations in former colonies. The
      oppressive conditions and social isolation experienced during
      indentureship fostered a legacy of psychological distress, which can be
      seen today in the disproportionately high suicide rates within these
      communities.
    </p>
    <p>
      By comparing rates in countries of interest to others in the region, we
      can see just how pervasive the issue is.
    </p>
  </div>

  <div>
    <h4>Average Suicide Rates per 100k, 1986-2016</h4>
    <small class="sources"
      >Source: <a
        href="https://www.kaggle.com/datasets/russellyates88/suicide-rates-overview-1985-to-2016?select=master.csv"
        target="_blank"><em>Suicide Rates Overview 1985 to 2016</em>, Kraggle</a
      ></small
    >
  </div>

  <div id="controls">
    {#if countrySelected}
      <button on:click={handleGoBack}>GO BACK</button>
    {:else}
      <div class="radio-inputs">
        <label class="radio">
          <input
            type="radio"
            name="suicideRadio"
            bind:group={radioSelected}
            value="top25"
            on:change={onChange}
          />
          <span class="name">Top 25</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="suicideRadio"
            bind:group={radioSelected}
            value="top50"
            on:change={onChange}
          />
          <span class="name">Top 50</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="suicideRadio"
            bind:group={radioSelected}
            value="countriesInterest"
            on:change={onChange}
          />
          <span class="name">Countries of Interest Only</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="suicideRadio"
            bind:group={radioSelected}
            value="caribbean"
            on:change={onChange}
          />
          <span class="name">Caribbean Only</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="suicideRadio"
            bind:group={radioSelected}
            value="southAmerica"
            on:change={onChange}
          />
          <span class="name">South America Only</span>
        </label>
      </div>
    {/if}
  </div>

  <div>
    <!-- {#if !countrySelected} -->
    <!-- <div id="suicideLegend" class="legend"></div> -->
    <div id="suicideLegend">
      {#each activeCountries as country}
        <div
          class="legend-entry"
          style="align-items: center; display: flex; flex-direction:row;"
        >
          <div
            style="width: 15px; height: 15px; border-radius: 50%; background-color: {countryColors.get(
              country.country
            )}; margin-right: 5px;"
          ></div>
          <p>{country.country}</p>
        </div>
      {/each}
    </div>
    <!-- {/if} -->

    <div id="suicideChart-container">
      <svg id="suicideChart"></svg>
      <div
        id="tooltipSuicide"
        style="position: absolute; visibility: hidden; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; border: 1px solid #ccc;"
      ></div>
    </div>
  </div>
</section>

<style>
  #suicideChart-container {
    max-width: 900px;
    margin: 0 auto;
  }
  #suicideLegend {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    column-gap: 20px;
    row-gap: 5px;
    padding: 0.5rem;
    border-radius: 0.5rem;
    justify-content: center;
  }

  #suicideChart {
    background-color: white;
  }

  #controls {
    display: flex;
    gap: 25px;
  }

  #controls-radios {
    display: flex;
    gap: 15px;
  }

  #suicide-section .radio-inputs {
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

  #suicide-section .radio-inputs .radio {
    flex: 1 1 auto;
    text-align: center;
  }

  #suicide-section .radio-inputs .radio input {
    display: none;
  }

  #suicide-section .radio-inputs .radio .name {
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

  #suicide-section .radio-inputs .radio .name:hover {
    background-color: rgb(219, 219, 219);
  }

  #suicide-section .radio-inputs .radio input:checked + .name {
    background-color: #fff;
    font-weight: 600;
  }
</style>
