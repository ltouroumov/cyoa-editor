import { assoc, clone, isNil } from 'ramda';

import { useEditorStore } from '~/composables/editor/useEditorStore';
import { DefaultProject } from '~/composables/project/defaults';
import { importProject } from '~/composables/project/import';
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

    await createEmptyVersion(projectId);
  }

  async function createEmptyVersion(
    projectId: number,
  ): Promise<EditorProjectVersion> {
    const version: Omit<EditorProjectVersion, 'id'> = {
      projectId: projectId,
      createdAt: new Date(),
      data: clone(DefaultProject),
    };

    const versionId = await dexie.projects_versions.put(version);
    await dexie.projects.update(projectId, {
      currentVersionId: versionId,
    });

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

    editorStore.project = project;
    editorStore.status = 'loading';
    projectStore.loadData(version.data);
    editorStore.status = 'ready';
  }

  async function unloadProject() {
    editorStore.project = null;
    editorStore.status = 'loading';
    projectStore.clearData();
    editorStore.status = 'ready';
  }

  return {
    createEmptyProject,
    createEmptyVersion,
    importProjectFile,
    loadProject,
    unloadProject,
  };
}
