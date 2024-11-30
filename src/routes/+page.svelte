<script>
  import Map from "./Map.svelte";
  import ShipLists from "./ShipLists.svelte";
  import Suicide from "./Suicide.svelte";
  import IPV from "./IPV.svelte";
  import Alcoholism from "./Alcoholism.svelte";
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
        <h4>The legacy of indentured servitude in ex-colonies.</h4>
      </div>
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In hendrerit
          nunc sed tortor mattis tempor. Nulla orci justo, dignissim vestibulum
          venenatis et, vehicula ac ex.
        </p>
      </div>
      <button on:click={navigateToMap}>Start</button>
    </div>
  </div>

  <div class="map-section">
    <Map />
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

  .intro-section {
    background-image: url("images/leaves2.png");
    background-color: #bababa99;
    background-blend-mode: lighten;
  }

  #intro-section-content {
    background: rgba(255, 255, 255, 0.6);
    padding: 25px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 25px;
  }
</style>
