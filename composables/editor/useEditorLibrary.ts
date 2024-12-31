import { assoc, clone, isNil } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { DefaultProject } from '~/composables/project/defaults';
import { importProject } from '~/composables/project/import';
import type { Project } from '~/composables/project/types/v2';
import { useProjectStore } from '~/composables/project/useProjectStore';
import type { EditorProjectVersion } from '~/composables/shared/tables/projects';
import { useDexie } from '~/composables/shared/useDexie';

export function useEditorLibrary() {
  const dexie = useDexie();
  const editorStore = useEditorStore();
  const projectStore = useProjectStore();

  async function createEmptyProject(name: string) {
    const projectId = await dexie.projects.put({
      name: name,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const version = await createEmptyVersion(projectId);
    await dexie.projects.update(projectId, {
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
      data: clone(data),
    };

    const versionId = await dexie.projects_versions.put(version);
    return assoc('id', versionId, version);
  }

  async function importProjectFile(projectData: any) {
    const { project, data } = await importProject(projectData);

    const projectId = await dexie.projects.add(project);
    const versionId = await dexie.projects_versions.add({
      projectId: projectId,
      data: data,
      createdAt: new Date(),
    });

    await dexie.projects.update(projectId, {
      currentVersionId: versionId,
    });
  }

  async function loadProject(projectId: number) {
    const project = (await dexie.projects.get(projectId))!;
    let version: EditorProjectVersion;
    if (isNil(project.currentVersionId)) {
      version = await createEmptyVersion(project.id);
    } else {
      version = (await dexie.projects_versions.get(project.currentVersionId!))!;
    }

    await editorStore.withLoadingState(async () => {
      editorStore.project = project;
      editorStore.version = version;
      projectStore.importData(version.data);
      editorStore.mode = 'editor';
    });
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

  async function saveProject() {
    await editorStore.withLoadingState(async () => {
      const projectId = editorStore.project!.id;
      const version = await createVersion(projectId, projectStore.exportData());
      await dexie.projects.update(projectId, {
        currentVersionId: version.id,
      });
    });
  }

  return {
    createEmptyProject,
    importProjectFile,
    loadProject,
    unloadProject,
    saveProject,
  };
}
