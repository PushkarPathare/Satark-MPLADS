/**
 * Visual Progress & Analytics Dashboard
 * Requirement:
 * 1. The public works projects directory should be shown first, with NO graph shown initially.
 * 2. When the user clicks on a project, the dedicated interactive progress graph for that project is seen.
 */

import React, { useState, useEffect } from 'react';
import { Project, Contractor } from '../../types';
import { DEMO_CONTRACTORS } from '../../data/mockData';
import { ProjectDirectoryList } from './ProjectDirectoryList';
import { ProjectIndividualGraphView } from './ProjectIndividualGraphView';

interface ProjectProgressGraphViewProps {
  projects: Project[];
  contractors?: Contractor[];
  initialProjectId?: string | null;
  initialCompanyId?: string | null;
  onSelectProject: (project: Project) => void;
  onOpenMBook?: (projectCode: string) => void;
}

export const ProjectProgressGraphView: React.FC<ProjectProgressGraphViewProps> = ({
  projects,
  contractors = DEMO_CONTRACTORS,
  initialProjectId = null,
  initialCompanyId = null,
  onSelectProject,
  onOpenMBook,
}) => {
  // Primary state: null means show Projects Directory first (NO graph displayed)
  const [selectedProject, setSelectedProject] = useState<Project | null>(() => {
    if (initialProjectId) {
      return projects.find((p) => p.id === initialProjectId || p.code === initialProjectId) || null;
    }
    return null;
  });

  // Keep state synchronized if parent specifies an initialProjectId
  useEffect(() => {
    if (initialProjectId) {
      const match = projects.find((p) => p.id === initialProjectId || p.code === initialProjectId);
      if (match) setSelectedProject(match);
    }
  }, [initialProjectId, projects]);

  // If no project is selected yet: Show Projects Directory first with NO graph
  if (!selectedProject) {
    return (
      <ProjectDirectoryList
        projects={projects}
        contractors={contractors}
        onSelectProjectForGraph={(proj) => setSelectedProject(proj)}
        onOpenEvidence={onSelectProject}
        onOpenMBook={onOpenMBook}
      />
    );
  }

  // Once a project is clicked: Show the dedicated Visual Progress Graphs for that project
  return (
    <ProjectIndividualGraphView
      project={selectedProject}
      allProjects={projects}
      contractors={contractors}
      onBackToProjects={() => setSelectedProject(null)}
      onSelectAnotherProject={(proj) => setSelectedProject(proj)}
      onOpenEvidence={onSelectProject}
      onOpenMBook={onOpenMBook}
    />
  );
};
