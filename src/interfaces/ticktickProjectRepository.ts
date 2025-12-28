export type TickTickProjectSummary = {
  id: string;
  name: string;
  closed: boolean;
};

export type TickTickProjectListStatus = "ready" | "missing-token" | "error";

export type TickTickProjectListResult = {
  projects: TickTickProjectSummary[];
  status: TickTickProjectListStatus;
};

export interface TickTickProjectRepository {
  listProjects(): Promise<TickTickProjectListResult>;
}
