import { differenceInSeconds } from 'date-fns';
import { add as increment } from 'dexie';
import { assoc, clone, isNil } from 'ramda';

import { useEditorRouting } from '~/composables/editor/useEditorRouting';
import { useEditorStore } from '~/composables/editor/useEditorStore';
import { DefaultProject } from '~/composables/project/defaults';
import { importProject } from '~/composables/project/import';
import type { Project } from '~/composables/project/types/v2';
import { useProjectStore } from '~/composables/project/useProjectStore';
import type { EditorProjectVersion } from '~/composables/shared/tables/editor_projects';
import { useDexie } from '~/composables/shared/useDexie';

// at most, create a new version every 5 minutes
const UPDATE_DELTA_SECS = 300;

export function useEditorLibrary() {
  const $toast = useToast();

  const dexie = useDexie();
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();
  const { restoreFromHash, restoreStack } = useEditorRouting();

  async function createEmptyProject(name: string) {
    const projectId = await dexie.editor_projects.put({
      name: name,
      tags: [],
      currentVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const version = await createEmptyVersion(projectId);
    await dexie.editor_projects.update(projectId, {
      currentVersionId: version.id,
    });
  }

  async function createEmptyVersion(
    projectId: number,
  ): Promise<EditorProjectVersion> {
    return createVersion(projectId, DefaultProject);
  }

  async function createVersion(
    projectId: number,
    data: Project,
  ): Promise<EditorProjectVersion> {
    const version: Omit<EditorProjectVersion, 'id'> = {
      projectId: projectId,
      createdAt: new Date(),
      version: 1,
      data: clone(data),
    };

    const versionId = await dexie.editor_projects_versions.put(version);
    return assoc('id', versionId, version);
  }

  async function importProjectFile(projectData: any) {
    const { project, data } = await importProject(projectData);

    const projectId = await dexie.editor_projects.add(project);
    const versionId = await dexie.editor_projects_versions.add({
      projectId: projectId,
      data: data,
      createdAt: new Date(),
    });

    await dexie.editor_projects.update(projectId, {
      currentVersionId: versionId,
    });
  }

  async function loadProject(projectId: number, restoreNavigation = true) {
    const project = (await dexie.editor_projects.get(projectId))!;
    let version: EditorProjectVersion;
    if (isNil(project.currentVersionId)) {
      version = await createEmptyVersion(project.id);
    } else {
      version = (await dexie.editor_projects_versions.get(
        project.currentVersionId!,
      ))!;
    }

    await editorStore.withLoadingState(async () => {
      editorStore.project = project;
      editorStore.version = version;
      projectStore.importData(version.data);
      editorStore.mode = 'editor';

      // Restore navigation state from hash if enabled
      if (restoreNavigation) {
        const hashState = restoreFromHash();
        if (hashState.root) {
          editorStore.root = hashState.root as any;
        }
        restoreStack(hashState);
      }
    });
  }

  async function initializeFromHash() {
    const hashState = restoreFromHash();
    if (hashState.projectId) {
      const project = await dexie.editor_projects.get(hashState.projectId);
      if (project) {
        await loadProject(hashState.projectId, true);
      }
    }
  }

  async function unloadProject() {
    await editorStore.withLoadingState(async () => {
      projectStore.clearData();
      editorStore.project = null;
      editorStore.version = null;
      editorStore.mode = 'library';
      editorStore.clearStack('content');
    });
  }

  async function saveProject(options?: { notify?: boolean; eager?: boolean }) {
    await editorStore.withLoadingState(async () => {
      const projectId = editorStore.project!.id;
      const currentVersion = editorStore.version!;
      const updateDelta = differenceInSeconds(
        Date.now(),
        currentVersion.createdAt,
      );

      // check when the current version was created
      if (updateDelta < UPDATE_DELTA_SECS && !options?.eager) {
        // if the current version was created within the last 5 minutes,
        // update the current version
        console.log('performing lazy save');

        await dexie.editor_projects_versions.update(currentVersion.id, {
          data: clone(projectStore.exportData()),
          updatedAt: new Date(),
          version: increment(1),
        });
        await dexie.editor_projects.update(projectId, {
          updatedAt: new Date(),
        });
      } else {
        // otherwise, create a new version
        console.log('performing full save');
        const newVersion = await createVersion(
          projectId,
          projectStore.exportData(),
        );
        await dexie.editor_projects.update(projectId, {
          currentVersion: increment(1),
          currentVersionId: newVersion.id,
          updatedAt: new Date(),
        });

        editorStore.version = newVersion;
      }

      if (options?.notify) {
        $toast.add({
          severity: 'success',
          summary: 'Project saved',
          detail: 'Your project has been saved successfully.',
          life: 3000,
        });
      }
    });
  }

  return {
    createEmptyProject,
    importProjectFile,
    loadProject,
    unloadProject,
    saveProject,
    initializeFromHash,
  };
}
