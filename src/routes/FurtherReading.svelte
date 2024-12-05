<script>
  // Define the state for toggling the whole section
  let isReadingOpen = false;

  // Function to toggle the section
  function toggleReading() {
    isReadingOpen = !isReadingOpen;
  }
</script>

<section id="reading-section">
  <h2 on:click={toggleReading}>
    Further Readings
    <!-- <span
      class="chevron"
      style:transform={isReadingOpen ? "rotate(180deg)" : "rotate(0deg)"}
      >▼</span
    > -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-chevron-down"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
      />
    </svg>
  </h2>

  <!-- All content under Further Readings, grouped together -->
  <div
    class="section-content"
    style:height={isReadingOpen ? "auto" : "0"}
    class:collapsed={!isReadingOpen}
  >
    <div>
      <h3>Suicide</h3>
      <p>
        <a
          href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10606164/"
          target="_blank"
          >Reconciling a Broken Heritage: Developing Mental Health Social Work
          in Guyana</a
        >
      </p>
      <p>
        <a
          href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11203727/"
          target="_blank"
          >Indo-Caribbean Youth and Suicidal Behavior: A Systematic Review</a
        >
      </p>
    </div>

    <div>
      <h3>Intimate Partner Violence</h3>
      <p>
        <a
          href="https://www.researchgate.net/publication/336926774_Indo-Caribbean_Immigrant_Perspectives_on_Intimate_Partner_Violence"
          target="_blank"
          >Indo-Caribbean Immigrant Perspectives on Intimate Partner Violence</a
        >
      </p>
    </div>
  </div>
</section>

<style>
  #reading-section {
    width: 100%;
  }

  a {
    color: inherit;
  }

  h2 {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chevron {
    transition: transform 0.3s ease;
    font-size: 1.5em;
  }

  .section-content {
    overflow: hidden;
    transition: height 0.3s ease;
  }

  .collapsed {
    display: none;
  }

  .section-content div {
    margin-bottom: 15px;
  }

  .section-content p {
    margin: 5px 0;
  }
</style>
