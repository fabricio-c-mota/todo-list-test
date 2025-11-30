// tests/LocalTaskRepository.test.ts
import { Task } from '../src/model/entities/task';
import { LocalRepository, localTaskRepository } from '../src/model/repository/LocalTaskRepository';

describe('LocalRepository', () => {
  let repository: LocalRepository;

  beforeEach(() => {
    repository = new LocalRepository();
  });

  describe('instância singleton', () => {
    test('localTaskRepository deve ser uma instância de IRepository', () => {
      expect(localTaskRepository).toBeDefined();
      expect(typeof localTaskRepository.findAll).toBe('function');
      expect(typeof localTaskRepository.findById).toBe('function');
      expect(typeof localTaskRepository.save).toBe('function');
      expect(typeof localTaskRepository.update).toBe('function');
      expect(typeof localTaskRepository.delete).toBe('function');
    });
  });

  describe('save', () => {
    test('deve salvar uma task com id auto-incrementado', async () => {
      const task: Task = { id: 0, title: 'Task 1', description: 'Desc 1', completed: false };

      await repository.save(task);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(1);
      expect(tasks[0].title).toBe('Task 1');
    });

    test('deve incrementar id para múltiplas tasks', async () => {
      const task1: Task = { id: 0, title: 'Task 1', description: 'Desc 1', completed: false };
      const task2: Task = { id: 0, title: 'Task 2', description: 'Desc 2', completed: false };

      await repository.save(task1);
      await repository.save(task2);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(2);
    });

    test('deve manter id se já existir', async () => {
      const task: Task = { id: 99, title: 'Task', description: 'Desc', completed: false };

      await repository.save(task);

      const tasks = await repository.findAll();
      expect(tasks[0].id).toBe(99);
    });

    test('deve salvar task com todos os campos corretamente', async () => {
      const task: Task = { id: 0, title: 'Título', description: 'Descrição', completed: true };

      await repository.save(task);

      const tasks = await repository.findAll();
      expect(tasks[0]).toMatchObject({
        title: 'Título',
        description: 'Descrição',
        completed: true,
      });
    });

    test('deve continuar incrementando id após salvar task com id manual', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false }); // id = 1
      await repository.save({ id: 50, title: 'T2', description: 'D2', completed: false }); // id = 50 (manual)
      await repository.save({ id: 0, title: 'T3', description: 'D3', completed: false }); // id = 2

      const tasks = await repository.findAll();
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(50);
      expect(tasks[2].id).toBe(2);
    });
  });

  describe('findAll', () => {
    test('deve retornar array vazio quando não há tasks', async () => {
      const tasks = await repository.findAll();
      expect(tasks).toEqual([]);
    });

    test('deve retornar todas as tasks salvas', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: true });

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
    });

    test('deve retornar tasks na ordem em que foram salvas', async () => {
      await repository.save({ id: 0, title: 'Primeira', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'Segunda', description: 'D2', completed: false });
      await repository.save({ id: 0, title: 'Terceira', description: 'D3', completed: false });

      const tasks = await repository.findAll();
      expect(tasks[0].title).toBe('Primeira');
      expect(tasks[1].title).toBe('Segunda');
      expect(tasks[2].title).toBe('Terceira');
    });

    test('deve retornar referência ao array interno', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });

      const tasks1 = await repository.findAll();
      const tasks2 = await repository.findAll();

      expect(tasks1).toBe(tasks2);
    });
  });

  describe('findById', () => {
    test('deve retornar a task pelo id', async () => {
      await repository.save({ id: 0, title: 'Task', description: 'Desc', completed: false });

      const task = await repository.findById(1);

      expect(task.title).toBe('Task');
      expect(task.id).toBe(1);
    });

    test('deve lançar erro quando task não existe', async () => {
      await expect(repository.findById(999)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('deve encontrar task com id específico entre várias', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });
      await repository.save({ id: 0, title: 'T3', description: 'D3', completed: false });

      const task = await repository.findById(2);

      expect(task.title).toBe('T2');
    });

    test('deve retornar task com todos os campos corretos', async () => {
      await repository.save({ id: 0, title: 'Título', description: 'Descrição', completed: true });

      const task = await repository.findById(1);

      expect(task).toEqual({
        id: 1,
        title: 'Título',
        description: 'Descrição',
        completed: true,
      });
    });

    test('deve lançar erro com mensagem correta', async () => {
      try {
        await repository.findById(123);
        fail('Deveria ter lançado erro');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Tarefa não encontrada!');
      }
    });
  });

  describe('update', () => {
    test('deve atualizar uma task existente', async () => {
      await repository.save({ id: 0, title: 'Original', description: 'Desc', completed: false });

      const updated: Task = { id: 1, title: 'Atualizado', description: 'Nova Desc', completed: true };
      await repository.update(updated);

      const task = await repository.findById(1);
      expect(task.title).toBe('Atualizado');
      expect(task.description).toBe('Nova Desc');
      expect(task.completed).toBe(true);
    });

    test('deve lançar erro ao atualizar task inexistente', async () => {
      const task: Task = { id: 999, title: 'T', description: 'D', completed: false };
      await expect(repository.update(task)).rejects.toThrow('Tarefa não encontrada!');
    });

    test('deve atualizar apenas a task específica', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });
      await repository.save({ id: 0, title: 'T3', description: 'D3', completed: false });

      await repository.update({ id: 2, title: 'Atualizado', description: 'Nova', completed: true });

      const tasks = await repository.findAll();
      expect(tasks[0].title).toBe('T1');
      expect(tasks[1].title).toBe('Atualizado');
      expect(tasks[2].title).toBe('T3');
    });

    test('deve substituir completamente a task no índice correto', async () => {
      await repository.save({ id: 0, title: 'Original', description: 'Original', completed: false });

      const newTask: Task = { id: 1, title: 'Novo', description: 'Novo', completed: true };
      await repository.update(newTask);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(newTask);
    });

    test('deve manter a posição da task no array após update', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });

      await repository.update({ id: 1, title: 'T1 Atualizado', description: 'D1', completed: false });

      const tasks = await repository.findAll();
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(2);
    });
  });

  describe('delete', () => {
    test('deve remover uma task existente', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });

      await repository.delete(1);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(2);
    });

    test('deve não fazer nada ao deletar id inexistente', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });

      await repository.delete(999);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(1);
    });

    test('deve remover task do meio do array', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });
      await repository.save({ id: 0, title: 'T3', description: 'D3', completed: false });

      await repository.delete(2);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe(1);
      expect(tasks[1].id).toBe(3);
    });

    test('deve permitir deletar todas as tasks', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });

      await repository.delete(1);
      await repository.delete(2);

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(0);
    });

    test('deve não lançar erro ao deletar id inexistente', async () => {
      await expect(repository.delete(999)).resolves.not.toThrow();
    });

    test('findById deve lançar erro após deletar a task', async () => {
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.delete(1);

      await expect(repository.findById(1)).rejects.toThrow('Tarefa não encontrada!');
    });
  });

  describe('integração entre operações', () => {
    test('deve manter consistência após múltiplas operações', async () => {
      // Salvar
      await repository.save({ id: 0, title: 'T1', description: 'D1', completed: false });
      await repository.save({ id: 0, title: 'T2', description: 'D2', completed: false });
      
      // Atualizar
      await repository.update({ id: 1, title: 'T1 Updated', description: 'D1', completed: true });
      
      // Deletar
      await repository.delete(2);
      
      // Adicionar nova
      await repository.save({ id: 0, title: 'T3', description: 'D3', completed: false });

      const tasks = await repository.findAll();
      expect(tasks).toHaveLength(2);
      expect(tasks[0]).toEqual({ id: 1, title: 'T1 Updated', description: 'D1', completed: true });
      expect(tasks[1]).toEqual({ id: 3, title: 'T3', description: 'D3', completed: false });
    });

    test('constructor deve inicializar com array vazio e nextId = 1', async () => {
      const newRepo = new LocalRepository();
      
      const tasks = await newRepo.findAll();
      expect(tasks).toEqual([]);
      
      await newRepo.save({ id: 0, title: 'T', description: 'D', completed: false });
      const savedTasks = await newRepo.findAll();
      expect(savedTasks[0].id).toBe(1);
    });
  });
});
