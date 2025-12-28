import type { TickTickProjectListResult } from "@/interfaces/ticktickProjectRepository";
import { TickTickProjectRepositoryImpl } from "@/infrastructure/ticktickRepository";

const repository = new TickTickProjectRepositoryImpl();

export async function listTickTickProjects(): Promise<TickTickProjectListResult> {
  return repository.listProjects();
}
