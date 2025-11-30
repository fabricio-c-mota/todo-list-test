// tests/utils/testUtils.ts
import { Task } from '../../src/model/entities/task';
import { ITaskService } from '../../src/model/service/ITaskService';

/**
 * Cria um fake service mínimo. Passe overrides para modificar métodos específicos.
 */
export function makeTaskService(overrides?: Partial<ITaskService>): ITaskService {
  const sample: Task = { id: 1, title: 'T1', description: 'D1', completed: false };

  const base: Partial<ITaskService> = {
    getAllTasks: jest.fn().mockResolvedValue([sample]),
    getTaskById: jest.fn().mockResolvedValue(sample),
    createTask: jest.fn().mockResolvedValue(undefined),
    updateTask: jest.fn().mockResolvedValue(undefined),
    deleteTask: jest.fn().mockResolvedValue(undefined),
    toggleTaskCompletion: jest.fn().mockResolvedValue(undefined),
    getCompletedTasks: jest.fn().mockResolvedValue([]),
    getPendingTasks: jest.fn().mockResolvedValue([sample]),
  };

  return { ...(base as ITaskService), ...(overrides as Partial<ITaskService>) } as ITaskService;
}

export const sampleTask: Task = { id: 1, title: 'T1', description: 'D1', completed: false };
