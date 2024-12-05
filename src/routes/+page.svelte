<script>
  // import BackgroundInfo from "./BackgroundInfo.svelte";
  import Map from "./Map.svelte";
  import ShipLists from "./ShipLists.svelte";
  import Suicide from "./Suicide.svelte";
  import IPV from "./IPV.svelte";
  import Alcoholism from "./Alcoholism.svelte";
  import FurtherReading from "./FurtherReading.svelte";
  import "../style.css";

  function navigateToMap() {
    const mapSection = document.getElementById("map-section");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth" });
    }
  }
</script>

<div class="main-container">
  <div class="intro-section">
    <div id="intro-section-content">
      <div>
        <h1>A Jahaji's Shadow</h1>
        <h3>The legacy of indentured servitude in ex-colonies.</h3>
      </div>
      <div style="display:flex; flex-direction:column; gap:15px;">
        <p>
          When the Atlantic Slave Trade was abolished in the 19th century,
          nations such as Britain, France & the Netherlands still required labor
          for their plantation colonies. To meet this demand, so began the era
          of the Indian Indenture System (1838-1920), forcing the migration of
          approximately 2 million South Asians from their homelands.
        </p>
        <p>
          Colonies such as British Guiana (now Guyana), Trinidad & Tobago,
          Suriname, Natal (now part of South Africa), Mauritius & more received
          some of the largest populations of indentured laborers. This project
          focuses on these countries, though note that others (Réunion, Grenada,
          St. Vincent, etc.) are part of the same story.
        </p>
        <p>
          Today, a significant portion of the resulting diaspora now live
          somewhere in the West & would be considered "twice-removed". Though
          the following addresses social issues that were exaccerbated by
          indentureship in the ex-colonies themselves, they are still instances
          of intergenerational trauma that continue to follow present-day
          descendents of indenture.
        </p>
      </div>
      <button on:click={navigateToMap}>View Map</button>
    </div>
  </div>

  <!-- TO EXPAND ON LATER -->
  <!-- <div class="additional-sections bg-info">
    <BackgroundInfo />
  </div> -->

  <div class="map-section">
    <Map />
  </div>

  <div class="additional-sections">
    <ShipLists />
    <Alcoholism />
    <Suicide />
    <IPV />
    <FurtherReading />
  </div>
</div>

<style>
  .intro-section {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-image: url("$lib/images/leaves2.png");
    background-color: #bababa99;
    background-blend-mode: lighten;
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0 10%;
  }

  .additional-sections {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* margin:50px 0; */
    /* margin-top: 50; */
    margin: 50px 0;
    padding: 0 10%;
  }

  /* .additional-sections.bg-info {
    min-height: 100vh;
  } */

  .map-section {
    position: relative;
    width: 100%;
    height: 100vh;
    margin: 0;
  }

  #intro-section-content {
    background: rgba(255, 255, 255, 0.7);
    padding: 25px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 25px;
    max-width: 1024px;
  }
</style>
