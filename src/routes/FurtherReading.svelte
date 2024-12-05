<script>
  import { slide } from "svelte/transition"; // Import slide transition
  import { cubicOut } from "svelte/easing"; // Optional easing for smoother animations

  // Define the state for toggling the whole section
  let isReadingOpen = false;

  // Function to toggle the section
  function toggleReading() {
    isReadingOpen = !isReadingOpen;
  }
</script>

<section id="reading-section" style="cursor:pointer;">
  <div
    style="display:flex; justify-content:space-between; align-items:center;"
    on:click={toggleReading}
  >
    <h3>Further Reading</h3>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="bi bi-chevron-down"
      viewBox="0 0 16 16"
      style:transform={isReadingOpen ? "rotate(180deg)" : "rotate(0deg)"}
      transition:transform={{ duration: 300 }}
    >
      <path
        fill-rule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
      />
    </svg>
  </div>

  <!-- All content under Further Readings, grouped together -->
  <div
    class="section-content"
    transition:slide={{ duration: 300, easing: cubicOut }}
    style={`${isReadingOpen ? "display: flex; flex-direction:column; gap:15px;" : "display: none;"}`}
  >
    <div>
      <h4>General Literature</h4>
      <p>
        <a href="/" target="_blank"
          >Coolie Woman: The Odyssey of Indenture by Gaiutra Bahadur</a
        >
      </p>
      <p>
        <a href="/" target="_blank"
          >We Mark Your Memory: Writings from the Descendants of Indenture
          edited by David Dabydeen, et al.</a
        >
      </p>
    </div>
    <div>
      <h4>Suicide</h4>
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
      <h4>Intimate Partner Violence</h4>
      <p>
        <a
          href="https://www.researchgate.net/publication/336926774_Indo-Caribbean_Immigrant_Perspectives_on_Intimate_Partner_Violence"
          target="_blank"
          >Indo-Caribbean Immigrant Perspectives on Intimate Partner Violence</a
        >
      </p>
      <p>
        <a href="https://caribbeanwomencount.unwomen.org/" target="_blank"
          >UN Women | Caribbean Women Count: Ending Violence against Women and
          Girls</a
        >
      </p>
    </div>
  </div>
</section>

<style>
  #reading-section {
    width: 100%;
    background-color: #e5e5e5;
    padding: 25px;
    border-radius: 5px;
  }

  a {
    color: inherit;
  }

  h3 {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  svg {
    transition: transform 0.3s ease;
  }

  .section-content {
    overflow: hidden;
    padding: 10px 0;
  }

  .section-content div {
    margin-bottom: 15px;
  }

  .section-content p {
    margin: 5px 0;
  }
</style>
