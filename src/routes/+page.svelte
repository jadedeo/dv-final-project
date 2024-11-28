<script>
  import NewMap from "./NewMap.svelte";
  import ShipLists from "./ShipLists.svelte";
  import Suicide from "./Suicide.svelte";
  import IPV from "./IPV.svelte";
  import Alcoholism from "./Alcoholism.svelte";
  import "../style.css";

  const config = {
    style: "mapbox://styles/jadedeo/cm40cifbq00j101qr1z6hh9wb",
    accessToken:
      "pk.eyJ1IjoiamFkZWRlbyIsImEiOiJjbTJuZzFpYWkwNTdhMmlvbW16bmt3bjlhIn0.QCsOvTO9JomVioOyAgZgPA",
    showMarkers: false,
    markerColor: "#E54F6D",
    //projection: 'equirectangular',
    //Read more about available projections here
    //https://docs.mapbox.com/mapbox-gl-js/example/projections/
    inset: true,
    insetOptions: {
      markerColor: "orange",
    },
    insetPosition: "bottom-right",
    theme: "light",
    use3dTerrain: false, //set true for enabling 3D maps.
    auto: false,
    title: "Your Title Goes Here",
    subtitle:
      "The Storytelling Template helps you create an awesome animated map story with ease.",
    byline: "By a I.M. Amapper",
    footer:
      'Source: source citations, etc. <br> Created using <a href="https://github.com/mapbox/storytelling" target="_blank">Mapbox Storytelling</a> template.',
    chapters: [
      {
        id: "slug-style-id",
        alignment: "left",
        hidden: false,
        title: "The Motherland",
        description:
          "South Asian indentureship took place during the time of the British Raj, before the formation of modern-day countries such as India, Pakistan, and Bangladesh.",
        location: {
          center: [78.14475, 21.69509],
          zoom: 3,
          pitch: 0,
          bearing: 0,
        },
        mapAnimation: "flyTo",
        rotateAnimation: false,
        callback: "",
        onChapterEnter: [
          {
            layer: "britishraj-cf12ij",
            opacity: 1,
            duration: 500,
          },
          { layer: "indiaports-9jzlwj", opacity: 0 },
        ],
        onChapterExit: [
          {
            layer: "britishraj-cf12ij",
            opacity: 0,
          },
        ],
      },
      {
        id: "second-identifier",
        alignment: "left",
        hidden: false,
        title: "Ports of Departure",
        description:
          "Ships carrying laborers to the colonies departed from either Madras (now Chennai), Tamil Nadu or Kolkata, West Bengal.",
        location: {
          center: [78.14475, 21.69509],
          zoom: 3,
          pitch: 0,
          bearing: 0,
        },
        mapAnimation: "flyTo",
        rotateAnimation: false,
        callback: "",
        onChapterEnter: [
          { layer: "indiaports-9jzlwj", opacity: 1, duration: 500 },
        ],
        onChapterExit: [{ layer: "indiaports-9jzlwj", opacity: 0 }],
      },
      {
        id: "third-identifier",
        alignment: "left",
        hidden: false,
        title: "Geneva",
        image: "./assets/geneva.jpg",
        description:
          "Geneva, Switzerland, is a picturesque city nestled along the shores of Lake Geneva, surrounded by the Alps and Jura mountains.",
        location: {
          center: [6.15116, 46.20595],
          zoom: 12.52,
          pitch: 8.01,
          bearing: 0.0,
        },
        mapAnimation: "flyTo",
        rotateAnimation: false,
        callback: "",
        onChapterEnter: [],
        onChapterExit: [],
      },
      {
        id: "fourth-chapter",
        alignment: "left",
        hidden: false,
        title: "Buenos Aires",
        image: "./assets/buenos-aires.jpg",
        description:
          'Buenos Aires, the capital of Argentina, is a dynamic city known for its European-inspired architecture, vibrant tango culture, and rich culinary scene. Often called the "Paris of South America," it blends historic charm with modern energy.',
        location: {
          center: [-58.54195, -34.716],
          zoom: 4,
          pitch: 0,
          bearing: 0,
        },
        mapAnimation: "flyTo",
        rotateAnimation: false,
        callback: "",
        onChapterEnter: [],
        onChapterExit: [],
      },
    ],
  };

  function navigateToMap() {
    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth" });
    }
  }
</script>

<div class="main-container">
  <div class="intro-section">
    <h1>[Final Project Title Here]</h1>
    <div>
      <h4>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</h4>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hendrerit
        nunc sed tortor mattis tempor. Nulla orci justo, dignissim vestibulum
        venenatis et, vehicula ac ex.
      </p>
    </div>
    <button on:click={navigateToMap}>Start</button>
  </div>

  <div class="map-section">
    <NewMap {config} />
  </div>

  <div class="additional-sections">
    <ShipLists />
    <Suicide />
    <Alcoholism />
    <IPV />
  </div>
</div>

<style>
  .intro-section {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 25px;
  }

  .map-section {
    position: relative;
    width: 100%;
    height: 100vh;
    margin: 0;
  }

  .intro-section,
  .additional-sections {
    margin: 0;
    padding: 0 10%;
  }

  button {
    color: rgb(51, 65, 85);
    background-color: #eeeeee;
    border: 0;
    padding: 20px;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
