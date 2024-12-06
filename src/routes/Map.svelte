<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";
  import { config } from "../lib/mapConfig";
  import "../style.css";

  let map;
  let currentChapterIndex = 0;

  onMount(() => {
    mapboxgl.accessToken = config.accessToken;

    map = new mapboxgl.Map({
      container: "map",
      style: config.style,
      center: config.chapters[0].location.center,
      zoom: config.chapters[0].location.zoom,
      bearing: config.chapters[0].location.bearing,
      pitch: config.chapters[0].location.pitch,
      interactive: false,
    });

    if (config.use3dTerrain) {
      map.on("load", () => {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      });
    }

    map.scrollZoom.disable();
    updateChapter(currentChapterIndex);

    return () => map.remove();
  });

  function updateChapter(index) {
    const chapter = config.chapters[index];

    if (chapter) {
      map.flyTo(chapter.location);

      chapter.onChapterEnter?.forEach(({ layer, opacity }) => {
        const paintProps = getLayerPaintType(layer);
        if (paintProps) {
          paintProps.forEach((prop) => {
            map.setPaintProperty(layer, prop, opacity);
          });
        } else {
          console.warn(`Layer '${layer}' not found or unsupported.`);
        }
      });

      if (index > 0) {
        const prevChapter = config.chapters[index - 1];
        prevChapter.onChapterExit?.forEach(({ layer, opacity }) => {
          const paintProps = getLayerPaintType(layer);
          if (paintProps) {
            paintProps.forEach((prop) => {
              map.setPaintProperty(layer, prop, opacity);
            });
          }
        });
      }
    }
  }

  function getLayerPaintType(layer) {
    const mapLayer = map.getLayer(layer);
    if (!mapLayer) return null;

    const layerType = mapLayer.type;
    switch (layerType) {
      case "fill":
        return ["fill-opacity"];
      case "line":
        return ["line-opacity"];
      case "circle":
        return ["circle-opacity"];
      case "symbol":
        return ["icon-opacity", "text-opacity"];
      default:
        return null;
    }
  }

  function goToNextChapter() {
    if (currentChapterIndex < config.chapters.length - 1) {
      currentChapterIndex++;
      updateChapter(currentChapterIndex);
    } else {
      document
        .getElementById("after-map")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function goToPreviousChapter() {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      updateChapter(currentChapterIndex);
    }
  }
</script>

<section id="map-section">
  <div id="container">
    <div id="map"></div>
    <div id="story">
      <h3>{config.chapters[currentChapterIndex]?.title}</h3>
      <p>{@html config.chapters[currentChapterIndex]?.description}</p>
      <p>
        <small class="sources"
          >Inspiration & Referenced Code: <a
            href="https://github.com/mapbox/storytelling"
            target="_blank">Mapbox Interactive Storytelling</a
          ></small
        >
      </p>
      <div class="map-nav-buttons">
        {#if currentChapterIndex > 0}
          <button class="previous" on:click={goToPreviousChapter}
            >Previous</button
          >
        {:else}
          <div class="spacer"></div>
        {/if}
        <button class="next" on:click={goToNextChapter}
          >{currentChapterIndex == config.chapters.length - 1
            ? "Next Section"
            : "Next"}</button
        >
      </div>
    </div>
  </div>
</section>

<style>
  #container {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  #map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  #story {
    position: absolute;
    left: 2rem;
    bottom: 2rem;
    z-index: 5;
    width: 30%;
    max-width: 400px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.8);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }

  #story > p {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .map-nav-buttons {
    display: flex;
    justify-content: space-between;
  }

  button {
    background-color: #e4e4e4;
    color: rgb(51, 65, 85);
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    width: 120px;
  }

  button.previous {
    order: 1;
  }

  button.next {
    order: 2;
  }

  .spacer {
    width: 120px;
  }
</style>
