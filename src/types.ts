export interface ProjectProfile {
  id: string;
  name: string;
  isEfCore: boolean;
  startupProject: string;
  targetProject: string;
  dbContext: string;
  dbContexts: string[];
  migrationName: string;
  extraFlags: string;
}

export const defaultProfile: ProjectProfile = {
  id: 'default',
  name: 'Default Project',
  isEfCore: true,
  startupProject: 'MyApi.csproj',
  targetProject: 'MyInfrastructure.csproj',
  dbContext: 'ApplicationDbContext',
  dbContexts: ['ApplicationDbContext'],
  migrationName: 'InitialCreate',
  extraFlags: '',
};
