<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <div class="navbar-nav">
          <NuxtLink href="/editor" class="nav-link">Editor</NuxtLink>
          <NuxtLink href="/viewer" class="nav-link">Viewer</NuxtLink>
        </div>
        <span class="navbar-text">
          {{ projectFile?.file ?? "No File Selected" }}
          <button class="btn btn-dark btn-sm i-carbon-close"
                  v-if="projectFile?.file"
                  @click="unloadProject">
          </button>
        </span>
      </div>
    </nav>
    <slot/>
  </div>
</template>
<script setup lang="ts">
import {useProjectFile, unloadProject} from "~/composables/project";

const projectFile = useProjectFile();
</script>

<style lang="scss">
</style>