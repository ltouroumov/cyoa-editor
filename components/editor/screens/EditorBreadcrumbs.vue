<template>
  <Breadcrumb :home="bcHome" :model="bcStack" :dt="{ background: 'none' }">
    <!-- <template #item="{ item }">
      <a
        href="#"
        class="p-breadcrumb-item-link"
        data-pc-section="itemlink"
        @click="item.command"
      >
        <span
          class="p-breadcrumb-item-icon"
          :class="item.icon"
          data-pc-section="itemicon"
        />
        <span class="p-breadcrumb-item-label" data-pc-section="itemlabel">
          {{ item.label }}
        </span>
      </a>
    </template> -->
  </Breadcrumb>
</template>

<script setup lang="ts">
import { useScreenDispatch } from '~/components/editor/screens/useScreenDispatch';

const { bcHome, bcStack } = useScreenDispatch();
</script>

<style scoped lang="scss"></style>
