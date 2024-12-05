<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";

  let dots = new Array(100).fill(false);
  let hoverIndex = -1;
  let indexClicked = null;
  let locked = false;
  let showAnswerGrid = false;
  let dotGridElement;

  const handleHover = (index) => {
    if (!locked) {
      hoverIndex = index;
    }
  };

  const handleClick = (index) => {
    if (locked && !showAnswerGrid) {
      locked = !locked;
    } else {
      locked = true;
      indexClicked = index;
    }
  };

  const showAnswer = () => {
    d3.select(dotGridElement)
      .transition()
      .duration(500)
      .style("opacity", 0)
      .on("end", () => {
        showAnswerGrid = true;
        d3.select(dotGridElement)
          .transition()
          .duration(500)
          .style("opacity", 1);

        d3.select("#guess-and-actual")
          .transition()
          .duration(500)
          .style("opacity", 1);

        d3.select("#show-answer")
          .transition()
          .duration(500)
          .style("opacity", 1);
      });
  };

  const getDotStyle = (index) => {
    return index <= hoverIndex && locked
      ? "#e76f51"
      : index <= hoverIndex && !locked
        ? "#f4a261"
        : "gray";
  };

  onMount(() => {
    dots = new Array(100).fill(false);
  });
</script>

<section id="ipv-section">
  <div class="header-and-paragraphs">
    <h2>Intimate Partner Violence</h2>
    <p>
      The gender dynamics of indentureship significantly shaped social attitudes
      and behaviors towards women. During the indentureship era, a vastly
      disproportionate number of male laborers were brought to sugar colonies
      compared to females creating highly skewed gender ratios. This imbalance
      facilitated an environment where women were vastly outnumbered and often
      viewed as commodities rather than individuals with rights. Such conditions
      bred a culture of gender inequality that has contributed to the prevalence
      of IPV within these communities.
    </p>
  </div>

  <div>
    <p>The sex ratio in most communities hovers somewhere around 50:50.</p>
    <h4>
      What do you think the female to male ratio among the first indentured
      laborers to arrive in British Guiana was?
    </h4>
  </div>

  <div
    id="dot-grids"
    bind:this={dotGridElement}
    class={!showAnswerGrid ? "one-dot-grid" : "two-dot-grids"}
  >
    <div id="dots" class="grid" style={showAnswerGrid ? "opacity: 50%" : ""}>
      {#each dots as dot, i}
        <div
          class="dot"
          style="background-color: {getDotStyle(i)}"
          on:mouseover={() => handleHover(i)}
          on:click={() => handleClick(i)}
        ></div>
      {/each}
    </div>

    {#if showAnswerGrid}
      <div id="dots-answer" class="grid">
        {#each dots as dot, i}
          <div
            class="dot"
            style="background-color: {i < 6 ? '#e76f51' : 'gray'}"
          ></div>
        {/each}
      </div>
    {/if}
  </div>

  <div id="guess-and-actual" class={!showAnswerGrid ? "one-col" : "two-col"}>
    <p id="your-guess-text">
      <strong>{showAnswerGrid ? "You Guessed" : "Your Guess"}:</strong>
      {hoverIndex + 1} females to
      {100 - (hoverIndex + 1)} males
    </p>
    {#if locked && !showAnswerGrid}
      <button id="show-answer" on:click={() => showAnswer()}
        >Show Correct Answer</button
      >
    {/if}
    {#if locked && showAnswerGrid}
      <p><strong>Actual Ratio:</strong> ~ 6 females to 94 males</p>
    {/if}
  </div>

  <p>
    The first indentured arrivals to the colony of British Guiana were known as <em
      >the Gladstone Coolies</em
    >, conscripted to work on the plantations of John Gladstone (who had
    previously owned more than 2,000 enslaved Africans).
  </p>

  <div>
    <p>
      Though precise counts are difficult to come by, it is estimated that the
      group was composed of approximately 400 men and 25 women, some of whom
      were actually young girls.
    </p>
    <div>
      <small class="sources"
        >Source: <a
          href=" http://westindiandiplomacy.com/indian-indentured-women/"
          target="_blank"
          ><em>Indian Indentured Women</em>, West Indian Diplomacy</a
        ></small
      >
    </div>
  </div>
</section>

<style>
  button {
    color: rgb(51, 65, 85);
    background-color: #eeeeee;
    border: 0;
    padding: 15px;
    border-radius: 5px;
    cursor: pointer;
  }

  #guess-and-actual.two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    justify-items: center;
  }
  #guess-and-actual.one-col {
    display: grid;
    grid-template-columns: 1fr;
    margin: 0 auto;
    row-gap: 10px;
  }
  #dot-grids.two-dot-grids {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    max-height: 400px;
    justify-items: center;
  }
  #dot-grids.one-dot-grid {
    display: grid;
    grid-template-columns: 1fr;
    justify-items: center;
    max-height: 400px;
  }
  .dot {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    cursor: pointer;
  }
  #dots,
  #dots-answer {
    max-width: 400px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    width: 100%;
    max-height: 400px;
  }
</style>
