<template>
  <div
    class="scroll-to-top"
    :class="{ hidden: isHidden }"
    @click="scrollToTop()"
  >
    <div class="icon i-solar-arrow-up-linear"></div>
  </div>
</template>

<script setup lang="ts">
const scroll = useWindowScroll();

const isHidden = computed(() => {
  return scroll.y.value < 100;
});

const scrollToTop = () => {
  scroll.y.value = 0;
};
</script>

<style scoped lang="scss">
.scroll-to-top {
  display: flex;
  justify-content: center;
  align-items: center;

  background: gray;
  filter: opacity(70%);

  width: 2rem;
  height: 2rem;

  border-radius: 100%;

  position: fixed;
  bottom: 1rem;
  right: 1rem;
  //margin-left: auto;
  //margin-right: 1rem;

  cursor: pointer;

  .icon {
    color: black;
    width: 1.5rem;
    height: 1.5rem;
  }

  &.hidden {
    visibility: hidden;
  }
}
</style>
