<template>
  <ProjectViewWrapper />
  <ProjectMenu v-if="store.status === 'empty'" class="pb-4" />
  <ClientOnly>
    <div
      v-if="$pwa?.offlineReady || $pwa?.needRefresh"
      class="pwa-toast"
      role="alert"
    >
      <div class="message">
        <span v-if="$pwa.offlineReady"> App ready to work offline </span>
        <span v-else>
          New content available, click on reload button to update.
        </span>
      </div>
      <button v-if="$pwa.needRefresh" @click="$pwa.updateServiceWorker()">
        Reload
      </button>
      <button @click="$pwa.cancelPrompt()">Close</button>
    </div>
    <div
      v-if="
        $pwa?.showInstallPrompt && !$pwa?.offlineReady && !$pwa?.needRefresh
      "
      class="pwa-toast"
      role="alert"
    >
      <div class="message">
        <span> Install PWA </span>
      </div>
      <button @click="$pwa.install()">Install</button>
      <button @click="$pwa.cancelInstall()">Cancel</button>
    </div>
  </ClientOnly>
  <DynamicDialog />
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import ProjectViewWrapper from '~/components/viewer/ProjectViewWrapper.vue';
import { useProjectRefs } from '~/composables/store/project';
import { useSettingRefs } from '~/composables/store/settings';
import { setupLibrary } from '~/composables/viewer/useViewerLibrary';

const { $pwa } = useNuxtApp();
const { store, buildModified } = useProjectRefs();
const { lightThemeUI } = useSettingRefs();

definePageMeta({
  layout: false,
});

onMounted(() => {
  console.log(
    `pwa(isInstalled=${$pwa?.isPWAInstalled}, offlineReady=${$pwa?.offlineReady}, needRefresh=${$pwa?.needRefresh}, showInstallPrompt=${$pwa?.showInstallPrompt})`,
  );
});

// Run the library setup on page load
await setupLibrary();

function setBodyTheme(lightTheme: boolean) {
  if (lightTheme) {
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.classList.add('light-theme');
  } else {
    document.documentElement.classList.remove('light-theme');
    document.documentElement.classList.add('dark-theme');
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', (event: BeforeUnloadEvent) => {
    if (buildModified.value) {
      event.preventDefault();
      return true;
    } else {
      return false;
    }
  });

  const lightTheme = lightThemeUI.value;
  setBodyTheme(lightTheme);
});

watch(
  () => lightThemeUI.value,
  (newValue: boolean) => {
    setBodyTheme(newValue);
  },
);
</script>

<style lang="scss">
html {
  font-size: 16px;
}

.dialog-container {
  min-height: 50vh;
  margin-top: 5em;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .dialog {
    border: 2px solid black;
    border-radius: 10px;
    padding: 10px;
  }
}

@media screen and (max-width: 768px) {
  .dialog {
    width: 100% !important;
    max-width: 100%;
  }
}
</style>
