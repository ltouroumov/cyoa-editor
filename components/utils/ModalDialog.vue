<template>
  <dialog
    ref="dialog"
    class="modal-window text-light"
    :class="{ show: show }"
    @cancel="onCancel"
  >
    <div v-if="show" class="modal-content">
      <div class="modal-header">
        <slot name="header" />
        <button
          type="button"
          class="btn-close btn-sm"
          aria-label="Close"
          @click="$emit('close')"
        ></button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const props = defineProps<{
  show: boolean;
}>();

const dialog = ref<HTMLDialogElement>();

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      dialog.value?.showModal();
    } else {
      dialog.value?.close();
    }
  },
);

const onCancel = (event: Event) => {
  event.preventDefault();
  emit('close');
};
</script>

<style scoped lang="scss">
@import '~/assets/css/bootstrap/_config.scss';

dialog.modal-window {
  --bs-modal-zindex: #{$zindex-modal};
  --bs-modal-width: #{$modal-md};
  --bs-modal-padding: #{$modal-inner-padding};
  --bs-modal-margin: #{$modal-dialog-margin};
  --bs-modal-color: #{$modal-content-color};
  --bs-modal-bg: #{$modal-content-bg};
  --bs-modal-border-color: #{$modal-content-border-color};
  --bs-modal-border-width: #{$modal-content-border-width};
  --bs-modal-border-radius: #{$modal-content-border-radius};
  --bs-modal-box-shadow: #{$modal-content-box-shadow-xs};
  --bs-modal-inner-border-radius: #{$modal-content-inner-border-radius};
  --bs-modal-header-padding-x: #{$modal-header-padding-x};
  --bs-modal-header-padding-y: #{$modal-header-padding-y};
  --bs-modal-header-padding: #{$modal-header-padding}; // Todo in v6: Split this padding into x and y
  --bs-modal-header-border-color: #{$modal-header-border-color};
  --bs-modal-header-border-width: #{$modal-header-border-width};
  --bs-modal-title-line-height: #{$modal-title-line-height};
  --bs-modal-footer-gap: #{$modal-footer-margin-between};
  --bs-modal-footer-bg: #{$modal-footer-bg};
  --bs-modal-footer-border-color: #{$modal-footer-border-color};
  --bs-modal-footer-border-width: #{$modal-footer-border-width};

  --bs-backdrop-zindex: #{$zindex-modal-backdrop};
  --bs-backdrop-bg: #{$modal-backdrop-bg};
  --bs-backdrop-opacity: #{$modal-backdrop-opacity};

  padding: 0;
  border: 0;
  background: none;

  //min-width: var(--bs-modal-width);
  //min-height: $modal-sm;
  width: 80%;
  height: 80%;

  display: none;
  overflow: hidden;

  overscroll-behavior: contain;

  &.show {
    position: fixed;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  &::backdrop {
    background: var(--bs-backdrop-bg);
    opacity: var(--bs-backdrop-opacity);
    overscroll-behavior: contain;
  }

  .modal-body {
    display: flex;
    overflow: auto;
    flex-direction: column;
  }
}

@media screen and (max-width: 768px) {
  dialog.modal-window {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;

    .modal-content {
      border-radius: 0;
    }
  }
}
</style>
