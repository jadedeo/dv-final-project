<script>
  import { onMount } from "svelte";
  import mapboxgl from "mapbox-gl";

  export let config;

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

      // Handle `onChapterEnter`
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

      // Handle `onChapterExit`
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

  // Helper function to determine the paint property based on layer type
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
        return null; // Unsupported layer type
    }
  }

  function goToNextChapter() {
    if (currentChapterIndex < config.chapters.length - 1) {
      currentChapterIndex++;
      updateChapter(currentChapterIndex);
    }
  }

  function goToPreviousChapter() {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      updateChapter(currentChapterIndex);
    }
  }
</script>

<div id="container">
  <div id="map"></div>
  <div id="story">
    <div id="features">
      <div class="chapter-content">
        <h3>{config.chapters[currentChapterIndex]?.title}</h3>
        <p>{@html config.chapters[currentChapterIndex]?.description}</p>
      </div>
    </div>
    <div class="controls">
      <button
        on:click={goToPreviousChapter}
        disabled={currentChapterIndex === 0}
      >
        Previous
      </button>
      <button
        on:click={goToNextChapter}
        disabled={currentChapterIndex === config.chapters.length - 1}
      >
        Next
      </button>
    </div>
  </div>
</div>

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
    position: relative;
    z-index: 5;
    width: 50%;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.9);
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .chapter-content {
    margin-bottom: 1rem;
  }

  .controls {
    display: flex;
    justify-content: space-between;
  }

  button {
    background-color: #0071bc;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
