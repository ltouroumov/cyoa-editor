<template>
  <div class="fade modal" :class="{ show: show }">
    <div class="modal-dialog" :class="size ?? 'modal-lg'">
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
    </div>
  </div>
  <div
    v-show="show"
    class="fade show modal-backdrop"
    @click="$emit('close')"
  ></div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'close'): void;
}>();

defineProps<{
  show: boolean;
  size?: string;
}>();
</script>

<style scoped lang="scss">
div.modal {
  pointer-events: none;

  &.show {
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .modal-dialog {
    display: flex;
    align-items: stretch;
    justify-content: stretch;

    flex: 1 1 100%;
    pointer-events: auto;
  }

  .modal-body {
    display: flex;
    overflow: auto;
    flex-direction: column;
  }

  .modal-80 {
    --bs-modal-width: 80%;
  }
}

// @import '~/assets/css/bootstrap/_config.scss';
//
//div.modal {
//  .modal-dialog {
//    padding: 0;
//    border: 0;
//    background: none;
//
//    width: 80%;
//    height: 80%;
//  }
//
//  &.show .modal-dialog {
//    position: fixed;
//    display: flex;
//    align-items: stretch;
//    justify-content: stretch;
//  }
//
//  .modal-body {
//    display: flex;
//    overflow: auto;
//    flex-direction: column;
//  }
//}
//
//@media screen and (max-width: 768px) {
//  dialog.modal-window {
//    width: 100%;
//    height: 100%;
//    max-width: 100%;
//    max-height: 100%;
//
//    .modal-content {
//      border-radius: 0;
//    }
//  }
//}
</style>
