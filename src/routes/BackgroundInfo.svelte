<script>
  import Scrolly from "svelte-scrolly"; // Importing Scrolly component

  let scrollPercentage = 0;
  let images = [
    "images/butterfly.png",
    "images/butterfly.png",
    "images/butterfly.png",
    "images/butterfly.png",
    "images/butterfly.png",
  ];

  let commitProgress = 100;
</script>

<section id="bginfo-section">
  <Scrolly
    bind:progress={commitProgress}
    --scrolly-viz-width="50%"
    --scrolly-layout="viz-first"
  >
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis
      maximus gravida. Aenean ornare arcu sed urna vulputate dapibus. Aenean ut
      ante suscipit, sagittis augue ac, rhoncus nisl. Aliquam fringilla ante
      vitae turpis fermentum, sit amet ultrices felis tristique. Maecenas ac dui
      sem. Maecenas vel volutpat ex, sit amet sodales tellus. Sed mattis nibh
      risus, in hendrerit odio mollis a.
    </p>
    <img src="images/butterfly.png" />
    <p>
      Suspendisse libero leo, varius eu eros eu, sodales pharetra ante.
      Pellentesque eget volutpat leo. Phasellus et leo ut arcu mollis vehicula.
      Cras sagittis tincidunt lectus, sed laoreet libero dignissim vitae. Nam
      eget tempor libero, quis pellentesque leo.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis
      maximus gravida. Aenean ornare arcu sed urna vulputate dapibus. Aenean ut
      ante suscipit, sagittis augue ac, rhoncus nisl. Aliquam fringilla ante
      vitae turpis fermentum, sit amet ultrices felis tristique. Maecenas ac dui
      sem. Maecenas vel volutpat ex, sit amet sodales tellus. Sed mattis nibh
      risus, in hendrerit odio mollis a.
    </p>
    <p>
      Suspendisse libero leo, varius eu eros eu, sodales pharetra ante.
      Pellentesque eget volutpat leo. Phasellus et leo ut arcu mollis vehicula.
      Cras sagittis tincidunt lectus, sed laoreet libero dignissim vitae. Nam
      eget tempor libero, quis pellentesque leo.
    </p>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis
      maximus gravida. Aenean ornare arcu sed urna vulputate dapibus. Aenean ut
      ante suscipit, sagittis augue ac, rhoncus nisl. Aliquam fringilla ante
      vitae turpis fermentum, sit amet ultrices felis tristique. Maecenas ac dui
      sem. Maecenas vel volutpat ex, sit amet sodales tellus. Sed mattis nibh
      risus, in hendrerit odio mollis a.
    </p>
    <p>
      Suspendisse libero leo, varius eu eros eu, sodales pharetra ante.
      Pellentesque eget volutpat leo. Phasellus et leo ut arcu mollis vehicula.
      Cras sagittis tincidunt lectus, sed laoreet libero dignissim vitae. Nam
      eget tempor libero, quis pellentesque leo.
    </p>

    <svelte:fragment slot="viz" class="bginfo-text-container">
      <div class="header-and-paragraphs">
        <h2>Historical Context</h2>
        <p>
          The enduring legacy of colonization and indentureship has profoundly
          impacted the mental health of populations in former colonies. The
          oppressive conditions and social isolation experienced during
          indentureship fostered a legacy of psychological distress, which can
          be seen today in the disproportionately high suicide rates within
          these communities.
        </p>
        <p>
          Though the following issues may stem from a variety of causes, the
          project frames them within the context of colonization.
        </p>
      </div>
    </svelte:fragment>
  </Scrolly>
</section>

<style>
  img {
    max-width: 100%;
  }
</style>
