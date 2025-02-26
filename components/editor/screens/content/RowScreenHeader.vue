<template>
  <div class="flex flex-col gap-2">
    <Fluid>
      <div class="flex flex-col gap-2 justify-stretch">
        <div class="flex flex-row gap-2">
          <IftaLabel class="grow">
            <InputText v-model.lazy="row.name" />
            <label>Name</label>
          </IftaLabel>
          <IftaLabel>
            <InputText v-model="row.id" disabled />
            <label>ID</label>
          </IftaLabel>
        </div>

        <Tabs value="header" :dt="{ tabpanel: { padding: '1rem 0' } }">
          <TabList>
            <Tab value="header">Header</Tab>
            <Tab value="layout">Layout</Tab>
            <Tab value="requirements">Requirements</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="header">
              <RowHeaderForm :row-id="rowId" />
            </TabPanel>
            <TabPanel value="layout">
              <RowLayoutForm :row-id="rowId" />
            </TabPanel>
            <TabPanel value="requirements">
              <RowRequirementsForm :row-id="rowId" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </Fluid>
  </div>
</template>

<script setup lang="ts">
import RowRequirementsForm from '~/components/editor/screens/content/row/RowRequirementsForm.vue';
import type { RowObject } from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { useProjectStore } from '~/composables/project/useProjectStore';

const projectStore = useProjectStore();
const props = defineProps<{
  rowId: string;
}>();

const row = computed((): RowObject => {
  return projectStore.get(props.rowId, ObjectType.row)!;
});
</script>
