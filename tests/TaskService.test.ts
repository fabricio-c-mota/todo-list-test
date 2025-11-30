// tests/TaskService.test.ts
import { Task } from '../src/model/entities/task';
import { IRepository } from '../src/model/repository/ITaskRepository';
import { TaskService, localTaskService } from '../src/model/service/TaskService';

// Mock do Repository
const createMockRepository = (): jest.Mocked<IRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('TaskService', () => {
  let mockRepository: jest.Mocked<IRepository>;
  let taskService: TaskService;

  const sampleTask: Task = { id: 1, title: 'Task 1', description: 'Desc 1', completed: false };

  beforeEach(() => {
    mockRepository = createMockRepository();
    taskService = new TaskService(mockRepository);
    jest.clearAllMocks();
  });

  describe('instância singleton', () => {
    test('localTaskService deve ser uma instância de TaskService', () => {
      expect(localTaskService).toBeDefined();
      expect(localTaskService).toBeInstanceOf(TaskService);
    });

    test('localTaskService deve implementar ITaskService', () => {
      expect(typeof localTaskService.getAllTasks).toBe('function');
      expect(typeof localTaskService.getTaskById).toBe('function');
      expect(typeof localTaskService.createTask).toBe('function');
      expect(typeof localTaskService.updateTask).toBe('function');
      expect(typeof localTaskService.deleteTask).toBe('function');
      expect(typeof localTaskService.toggleTaskCompletion).toBe('function');
      expect(typeof localTaskService.getCompletedTasks).toBe('function');
      expect(typeof localTaskService.getPendingTasks).toBe('function');
    });
  });

  describe('getAllTasks', () => {
    test('deve retornar todas as tasks do repository', async () => {
      const tasks: Task[] = [sampleTask, { id: 2, title: 'T2', description: 'D2', completed: true }];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getAllTasks();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(tasks);
    });

    test('deve retornar array vazio quando não há tasks', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await taskService.getAllTasks();

      expect(result).toEqual([]);
    });

    test('deve chamar findAll do repository apenas uma vez', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await taskService.getAllTasks();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTaskById', () => {
    test('deve retornar task pelo id', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);

      const result = await taskService.getTaskById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleTask);
    });

    test('deve propagar erro quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      await expect(taskService.getTaskById(999)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('deve passar o id correto para o repository', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);

      await taskService.getTaskById(42);

      expect(mockRepository.findById).toHaveBeenCalledWith(42);
    });
  });

  describe('createTask', () => {
    test('deve criar task com título e descrição válidos', async () => {
      mockRepository.save.mockResolvedValue();

      await taskService.createTask('Novo Título', 'Nova Descrição');

      expect(mockRepository.save).toHaveBeenCalledWith({
        id: 0,
        title: 'Novo Título',
        description: 'Nova Descrição',
        completed: false,
      });
    });

    test('deve fazer trim no título e descrição', async () => {
      mockRepository.save.mockResolvedValue();

      await taskService.createTask('  Título  ', '  Descrição  ');

      expect(mockRepository.save).toHaveBeenCalledWith({
        id: 0,
        title: 'Título',
        description: 'Descrição',
        completed: false,
      });
    });

    test('deve lançar erro quando título está vazio', async () => {
      await expect(taskService.createTask('', 'Descrição')).rejects.toThrow('Tarefa sem título.');
    });

    test('deve lançar erro quando título é apenas espaços', async () => {
      await expect(taskService.createTask('   ', 'Descrição')).rejects.toThrow('Tarefa sem título.');
    });

    test('deve lançar erro quando descrição está vazia', async () => {
      await expect(taskService.createTask('Título', '')).rejects.toThrow('Tarefa sem descrição.');
    });

    test('deve lançar erro quando descrição é apenas espaços', async () => {
      await expect(taskService.createTask('Título', '   ')).rejects.toThrow('Tarefa sem descrição.');
    });

    test('deve criar task com completed = false por padrão', async () => {
      mockRepository.save.mockResolvedValue();

      await taskService.createTask('T', 'D');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ completed: false })
      );
    });

    test('deve criar task com id = 0 para o repository atribuir', async () => {
      mockRepository.save.mockResolvedValue();

      await taskService.createTask('T', 'D');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 0 })
      );
    });

    test('não deve chamar save quando validação falha no título', async () => {
      try {
        await taskService.createTask('', 'D');
      } catch {}

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    test('não deve chamar save quando validação falha na descrição', async () => {
      try {
        await taskService.createTask('T', '');
      } catch {}

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    test('deve lançar erro quando título é null/undefined', async () => {
      await expect(taskService.createTask(null as any, 'D')).rejects.toThrow('Tarefa sem título.');
      await expect(taskService.createTask(undefined as any, 'D')).rejects.toThrow('Tarefa sem título.');
    });

    test('deve lançar erro quando descrição é null/undefined', async () => {
      await expect(taskService.createTask('T', null as any)).rejects.toThrow('Tarefa sem descrição.');
      await expect(taskService.createTask('T', undefined as any)).rejects.toThrow('Tarefa sem descrição.');
    });
  });

  describe('updateTask', () => {
    test('deve atualizar task com dados válidos', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.update.mockResolvedValue();

      const updated: Task = { id: 1, title: 'Atualizado', description: 'Nova Desc', completed: true };
      await taskService.updateTask(updated);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith({
        id: 1,
        title: 'Atualizado',
        description: 'Nova Desc',
        completed: true,
      });
    });

    test('deve fazer trim no título e descrição ao atualizar', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.update.mockResolvedValue();

      const updated: Task = { id: 1, title: '  Título  ', description: '  Desc  ', completed: false };
      await taskService.updateTask(updated);

      expect(mockRepository.update).toHaveBeenCalledWith({
        id: 1,
        title: 'Título',
        description: 'Desc',
        completed: false,
      });
    });

    test('deve lançar erro quando título está vazio', async () => {
      const task: Task = { id: 1, title: '', description: 'Desc', completed: false };
      await expect(taskService.updateTask(task)).rejects.toThrow('Tarefa sem título.');
    });

    test('deve lançar erro quando descrição está vazia', async () => {
      const task: Task = { id: 1, title: 'Título', description: '', completed: false };
      await expect(taskService.updateTask(task)).rejects.toThrow('Tarefa sem descrição.');
    });

    test('deve lançar erro quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      const task: Task = { id: 999, title: 'T', description: 'D', completed: false };
      await expect(taskService.updateTask(task)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('deve lançar erro quando título é apenas espaços', async () => {
      const task: Task = { id: 1, title: '   ', description: 'D', completed: false };
      await expect(taskService.updateTask(task)).rejects.toThrow('Tarefa sem título.');
    });

    test('deve lançar erro quando descrição é apenas espaços', async () => {
      const task: Task = { id: 1, title: 'T', description: '   ', completed: false };
      await expect(taskService.updateTask(task)).rejects.toThrow('Tarefa sem descrição.');
    });

    test('não deve chamar findById quando validação de título falha', async () => {
      const task: Task = { id: 1, title: '', description: 'D', completed: false };
      
      try {
        await taskService.updateTask(task);
      } catch {}

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    test('não deve chamar update quando validação falha', async () => {
      const task: Task = { id: 1, title: '', description: 'D', completed: false };
      
      try {
        await taskService.updateTask(task);
      } catch {}

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('não deve chamar update quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      try {
        await taskService.updateTask({ id: 999, title: 'T', description: 'D', completed: false });
      } catch {}

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('deve manter o valor de completed da task', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.update.mockResolvedValue();

      await taskService.updateTask({ id: 1, title: 'T', description: 'D', completed: true });
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ completed: true })
      );

      await taskService.updateTask({ id: 1, title: 'T', description: 'D', completed: false });
      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ completed: false })
      );
    });

    test('deve manter o id original da task', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.update.mockResolvedValue();

      await taskService.updateTask({ id: 42, title: 'T', description: 'D', completed: false });

      expect(mockRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 })
      );
    });
  });

  describe('deleteTask', () => {
    test('deve deletar task existente', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.delete.mockResolvedValue();

      await taskService.deleteTask(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test('deve lançar erro ao deletar task inexistente', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      await expect(taskService.deleteTask(999)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('não deve chamar delete quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      try {
        await taskService.deleteTask(999);
      } catch {}

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    test('deve verificar existência antes de deletar', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.delete.mockResolvedValue();

      await taskService.deleteTask(1);

      // Verifica ordem das chamadas
      expect(mockRepository.findById.mock.invocationCallOrder[0])
        .toBeLessThan(mockRepository.delete.mock.invocationCallOrder[0]);
    });

    test('deve passar id correto para findById e delete', async () => {
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.delete.mockResolvedValue();

      await taskService.deleteTask(42);

      expect(mockRepository.findById).toHaveBeenCalledWith(42);
      expect(mockRepository.delete).toHaveBeenCalledWith(42);
    });
  });

  describe('toggleTaskCompletion', () => {
    test('deve alternar completed de false para true', async () => {
      const task: Task = { id: 1, title: 'T', description: 'D', completed: false };
      mockRepository.findById.mockResolvedValue(task);
      mockRepository.update.mockResolvedValue();

      await taskService.toggleTaskCompletion(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith({ ...task, completed: true });
    });

    test('deve alternar completed de true para false', async () => {
      const task: Task = { id: 1, title: 'T', description: 'D', completed: true };
      mockRepository.findById.mockResolvedValue(task);
      mockRepository.update.mockResolvedValue();

      await taskService.toggleTaskCompletion(1);

      expect(mockRepository.update).toHaveBeenCalledWith({ ...task, completed: false });
    });

    test('deve lançar erro quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      await expect(taskService.toggleTaskCompletion(999)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('não deve chamar update quando task não existe', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Tarefa não encontrada!'));

      try {
        await taskService.toggleTaskCompletion(999);
      } catch {}

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('deve manter outros campos inalterados ao alternar', async () => {
      const task: Task = { id: 5, title: 'Título Original', description: 'Desc Original', completed: false };
      mockRepository.findById.mockResolvedValue(task);
      mockRepository.update.mockResolvedValue();

      await taskService.toggleTaskCompletion(5);

      expect(mockRepository.update).toHaveBeenCalledWith({
        id: 5,
        title: 'Título Original',
        description: 'Desc Original',
        completed: true,
      });
    });

    test('deve modificar diretamente o objeto task retornado', async () => {
      const task: Task = { id: 1, title: 'T', description: 'D', completed: false };
      mockRepository.findById.mockResolvedValue(task);
      mockRepository.update.mockResolvedValue();

      await taskService.toggleTaskCompletion(1);

      // O código modifica o objeto diretamente (task.completed = !task.completed)
      expect(task.completed).toBe(true);
    });
  });

  describe('getCompletedTasks', () => {
    test('deve retornar apenas tasks completas', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'T1', description: 'D1', completed: true },
        { id: 2, title: 'T2', description: 'D2', completed: false },
        { id: 3, title: 'T3', description: 'D3', completed: true },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getCompletedTasks();

      expect(result).toHaveLength(2);
      expect(result.every(t => t.completed)).toBe(true);
    });

    test('deve retornar array vazio quando não há tasks completas', async () => {
      const tasks: Task[] = [{ id: 1, title: 'T1', description: 'D1', completed: false }];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getCompletedTasks();

      expect(result).toEqual([]);
    });

    test('deve retornar array vazio quando não há tasks', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await taskService.getCompletedTasks();

      expect(result).toEqual([]);
    });

    test('deve retornar todas quando todas estão completas', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'T1', description: 'D1', completed: true },
        { id: 2, title: 'T2', description: 'D2', completed: true },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getCompletedTasks();

      expect(result).toHaveLength(2);
    });

    test('deve manter a ordem original das tasks', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'Primeira', description: 'D1', completed: true },
        { id: 2, title: 'Segunda', description: 'D2', completed: false },
        { id: 3, title: 'Terceira', description: 'D3', completed: true },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getCompletedTasks();

      expect(result[0].title).toBe('Primeira');
      expect(result[1].title).toBe('Terceira');
    });
  });

  describe('getPendingTasks', () => {
    test('deve retornar apenas tasks pendentes', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'T1', description: 'D1', completed: true },
        { id: 2, title: 'T2', description: 'D2', completed: false },
        { id: 3, title: 'T3', description: 'D3', completed: false },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getPendingTasks();

      expect(result).toHaveLength(2);
      expect(result.every(t => !t.completed)).toBe(true);
    });

    test('deve retornar array vazio quando não há tasks pendentes', async () => {
      const tasks: Task[] = [{ id: 1, title: 'T1', description: 'D1', completed: true }];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getPendingTasks();

      expect(result).toEqual([]);
    });

    test('deve retornar array vazio quando não há tasks', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await taskService.getPendingTasks();

      expect(result).toEqual([]);
    });

    test('deve retornar todas quando todas estão pendentes', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'T1', description: 'D1', completed: false },
        { id: 2, title: 'T2', description: 'D2', completed: false },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getPendingTasks();

      expect(result).toHaveLength(2);
    });

    test('deve manter a ordem original das tasks', async () => {
      const tasks: Task[] = [
        { id: 1, title: 'Primeira', description: 'D1', completed: true },
        { id: 2, title: 'Segunda', description: 'D2', completed: false },
        { id: 3, title: 'Terceira', description: 'D3', completed: false },
      ];
      mockRepository.findAll.mockResolvedValue(tasks);

      const result = await taskService.getPendingTasks();

      expect(result[0].title).toBe('Segunda');
      expect(result[1].title).toBe('Terceira');
    });
  });

  describe('integração TaskService com IRepository', () => {
    test('constructor deve aceitar qualquer implementação de IRepository', () => {
      const customRepo = createMockRepository();
      const service = new TaskService(customRepo);

      expect(service).toBeInstanceOf(TaskService);
    });

    test('deve usar o repository injetado para todas operações', async () => {
      mockRepository.findAll.mockResolvedValue([sampleTask]);
      mockRepository.findById.mockResolvedValue(sampleTask);
      mockRepository.save.mockResolvedValue();
      mockRepository.update.mockResolvedValue();
      mockRepository.delete.mockResolvedValue();

      await taskService.getAllTasks();
      await taskService.getTaskById(1);
      await taskService.createTask('T', 'D');
      await taskService.updateTask(sampleTask);
      await taskService.deleteTask(1);

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(mockRepository.findById).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalled();
    });
  });
});
