<script>
  import { onMount } from "svelte";

  let dots = new Array(100).fill(false);
  let hoverIndex = -1;
  let indexClicked = null;
  let locked = false;
  let showAnswerGrid = false;

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
    showAnswerGrid = true;
  };

  const getDotStyle = (index) => {
    return index <= hoverIndex && locked
      ? "#E54F6D"
      : index <= hoverIndex && !locked
        ? "#faae20"
        : "gray";
  };

  onMount(() => {
    dots = new Array(100).fill(false);
  });
</script>

<div class="header-and-paragraphs">
  <h3>Intimate Partner Violence</h3>
  <p>
    Vivamus ut ex vitae mi iaculis vulputate. Morbi maximus ac nulla non
    placerat. Aliquam erat volutpat. Cras molestie, purus elementum tempus
    mattis, arcu nunc placerat risus, vitae accumsan tellus purus nec justo.
  </p>
</div>

<div>
  <p>The sex ratio in most communities hovers somewhere around 50:50.</p>
  <h4>
    What do you think the male to female ratio among indentured laborers in
    plantation colonies was?
  </h4>
</div>

<div id="dot-grids">
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
          style="background-color: {i < 40 ? '#E54F6D' : 'gray'}"
        ></div>
      {/each}
    </div>
  {/if}
</div>

<div>
  <p>
    {showAnswerGrid ? "You Guessed" : "Your Guess"}: {hoverIndex + 1} males to {100 -
      (hoverIndex + 1)} females
  </p>
  {#if locked && !showAnswerGrid}
    <button on:click={() => showAnswer()}>Show Correct Answer</button>
  {/if}
</div>

<style>
  #dot-grids {
    display: flex;
    gap: 25px;
    max-height: 400px;
    justify-content: center;
  }
  .dot {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    cursor: pointer;
  }

  #dots {
    max-width: 400px;
    /* height:500px; */
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 8px;
    width: 100%;
    /* margin: 20px auto; */
    max-height: 400px;
  }
</style>
