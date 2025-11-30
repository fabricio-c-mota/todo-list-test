// tests/useTasks.test.ts
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTasks } from '../src/viewmodel/useTasks';
import { makeTaskService, sampleTask } from './utils/testUtils';

describe('useTasks', () => {
  test('carrega tasks ao montar (refresh) — loading e tasks', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTasks(service));

    // Act & Assert
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  test('refresh: quando getAllTasks falha, seta error', async () => {
    const service = makeTaskService({ getAllTasks: jest.fn().mockRejectedValue(new Error('falha carregar')) });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTasks(service));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Erro ao carregar as tarefas');

    consoleErrorSpy.mockRestore();
  });

  test('deleteTask: chama service.deleteTask(id) e recarrega', async () => {
    const getAllMock = jest.fn()
      .mockResolvedValueOnce([sampleTask])
      .mockResolvedValueOnce([]); 
    const service = makeTaskService({ getAllTasks: getAllMock, deleteTask: jest.fn().mockResolvedValue(undefined) });

    const { result } = renderHook(() => useTasks(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteTask(sampleTask.id);
    });

    expect(service.deleteTask).toHaveBeenCalledWith(sampleTask.id);
    expect(getAllMock).toHaveBeenCalledTimes(2);
    expect(result.current.tasks).toHaveLength(0);
  });

  test('toggleComplete: chama toggleTaskCompletion(id) e recarrega', async () => {
    const getAllMock = jest.fn()
      .mockResolvedValueOnce([sampleTask])
      .mockResolvedValueOnce([{ ...sampleTask, completed: true }]);
    const service = makeTaskService({ getAllTasks: getAllMock, toggleTaskCompletion: jest.fn().mockResolvedValue(undefined) });

    const { result } = renderHook(() => useTasks(service));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleComplete(sampleTask.id);
    });

    expect(service.toggleTaskCompletion).toHaveBeenCalledWith(sampleTask.id);
    expect(getAllMock).toHaveBeenCalledTimes(2);
    expect(result.current.tasks[0].completed).toBe(true);
  });
});
