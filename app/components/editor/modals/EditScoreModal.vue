<template>
  <div>
    <div>Edit Score</div>
    <div>{{ object }}</div>
  </div>
</template>

<script setup lang="ts">
import { useModalClient } from '~/components/editor/utils/useModalClient';
import type { ObjectScore } from '~/composables/project/types/v2/score';

type DialogInput = { score: ObjectScore };
type DialogResult = { update: ObjectScore };
const { data: object, close } = useModalClient<
  DialogInput,
  ObjectScore,
  DialogResult
>((input: DialogInput) => input.score);
</script>

<style scoped lang="scss"></style>
