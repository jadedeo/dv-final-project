<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { countrySummary } from "../lib/countrySummary";
  import {
    caribbeanCountries,
    southAmericaCountries,
  } from "../lib/filteringGroups";

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

  let radioSelected = "top25";

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

    const colorFallback = "#e0e0e0";
    const hoverColor = "#707070";

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
      .on("mouseover", function (event, d) {
        if (!summaryCountries.has(d.country)) {
          d3.select(this).attr("stroke", hoverColor);
          d3.select(this)
            .raise() // This temporarily brings the hovered gray line to the top.
            .attr("stroke", hoverColor);
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
        d3.select("#tooltipSuicide").style("visibility", "hidden");
      });

    lines
      .filter((d) => summaryCountries.has(d.country))
      .on("click", function (event, d) {
        countrySelected = true;
        drawRatesBySexChart(d);
        d3.select("#tooltipSuicide").style("visibility", "hidden");
      });

    lines.filter((d) => !summaryCountries.has(d.country)).lower();
    lines.filter((d) => summaryCountries.has(d.country)).raise();
  }

  function drawRatesBySexChart(selectedData) {
    const svgElement = document.getElementById("suicideChart");
    svgElement.innerHTML = "";

    const countryData = genderSpecificData.find(
      (item) => item.country == selectedData.country
    );

    // console.log('sex breakdown', countryData);

    if (!countryData) return;

    const dataForChart = countryData.years.map((year) => {
      const overallYearData = selectedData.years.find(
        (y) => y.year === year.year
      );
      return {
        year: year.year,
        maleRate: year.genders.find((g) => g.gender === "male")?.rate,
        femaleRate: year.genders.find((g) => g.gender === "female")?.rate,
        overallRate: overallYearData ? overallYearData.rate : null,
      };
    });

    // console.log('dataForChart', dataForChart);

    const svg = d3
      .select(svgElement)
      .attr("viewBox", "0 0 800 500")
      .append("g");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataForChart, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(dataForChart, (d) => Math.max(d.maleRate, d.femaleRate)),
      ])
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

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    g.append("g").call(d3.axisLeft(yScale));

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

    ["maleRate", "femaleRate", "overallRate"].forEach((rateType, i) => {
      const line = d3
        .line()
        .defined((d) => !isNaN(d[rateType]))
        .x((d) => xScale(d.year))
        .y((d) => yScale(d[rateType]));

      g.append("path")
        .datum(dataForChart)
        .attr("fill", "none")
        .attr("stroke", countryColors.get(selectedData.country))
        .style(
          "stroke-dasharray",
          rateType === "overallRate" ? "0" : `${2 * i + 3}, ${2 * i + 3}`
        )
        .attr("stroke-width", 4)
        .attr("d", line)
        .on("mousemove", function (event, d) {
          const pointer = d3.pointer(event, this);
          const x0 = xScale.invert(pointer[0]);
          const bisect = d3.bisector((d) => d.year).left;
          const idx = bisect(dataForChart, x0, 1);
          const a = dataForChart[idx - 1];
          const b = dataForChart[idx];
          const yearData = b && x0 - a.year > b.year - x0 ? b : a;
          if (!yearData) return;

          d3
            .select("#tooltipSuicide")
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`)
            .style("visibility", "visible").html(`
                        <strong>${selectedData.country}</strong>
                        (${yearData.year})<br>
                        Male Rate: ${yearData.maleRate.toFixed(2)}<br>
                        Female Rate: ${yearData.femaleRate.toFixed(2)}<br>
                        Overall Rate: ${yearData.overallRate.toFixed(2)}
                    `);
        })
        .on("mouseout", () => {
          d3.select("#tooltipSuicide").style("visibility", "hidden");
        });
    });
  }

  function handleGoBack() {
    countrySelected = false;
    drawMainChart();
  }
</script>

<section id="suicide-section">
  <div class="header-and-paragraphs">
    <h3>Prevalence of Suicide</h3>
    <p>
      Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non
      placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus
      mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo.
      Cras sollicitudin arcu nisi, in feugiat lorem facilisis non. Aliquam
      elementum erat ut purus sollicitudin sollicitudin. Mauris condimentum est
      vitae maximus faucibus.
    </p>
  </div>

  <div>
    <h4>Average Suicide Rates per 100k, 1986-2016</h4>
    <small class="sources"
      >Source: Suicide Rates Overview 1985 to 2016, <a
        href="https://www.kaggle.com/datasets/russellyates88/suicide-rates-overview-1985-to-2016?select=master.csv"
        >Kraggle</a
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
            name="radio"
            bind:group={radioSelected}
            value="top25"
            on:change={onChange}
          />
          <span class="name">Top 25</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="radio"
            bind:group={radioSelected}
            value="top50"
            on:change={onChange}
          />
          <span class="name">Top 50</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="radio"
            bind:group={radioSelected}
            value="countriesInterest"
            on:change={onChange}
          />
          <span class="name">Countries of Interest Only</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="radio"
            bind:group={radioSelected}
            value="caribbean"
            on:change={onChange}
          />
          <span class="name">Caribbean Only</span>
        </label>
        <label class="radio">
          <input
            type="radio"
            name="radio"
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
    <svg id="suicideChart"></svg>
    <div
      id="tooltipSuicide"
      style="position: absolute; visibility: hidden; background: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; border: 1px solid #ccc;"
    ></div>
  </div>
</section>

<style>
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
