// tests/useTaskDetail.test.ts
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTaskDetail } from '../src/viewmodel/useTaskDetail';
import { makeTaskService, sampleTask } from './utils/testUtils';

describe('useTaskDetail', () => {
  test('loadTask no mount carrega task quando taskId informado', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toEqual(sampleTask);
    expect(result.current.error).toBeNull();
  });

  test('updateTask chama service.updateTask e atualiza estado local', async () => {
    const service = makeTaskService({ updateTask: jest.fn().mockResolvedValue(undefined) });
    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updated = { ...sampleTask, title: 'Novo' };
    await act(async () => {
      await result.current.updateTask(updated);
    });

    expect(service.updateTask).toHaveBeenCalledWith(updated);
    expect(result.current.task).toEqual(updated);
  });

  test('deleteTask sem task carregada retorna erro apropriado', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskDetail(service)); // sem taskId
    await act(async () => {
      await result.current.deleteTask();
    });
    expect(result.current.error).toBe('Nenhuma tarefa carregada');
  });

  test('quando loadTask falha, seta error', async () => {
    const service = makeTaskService({ getTaskById: jest.fn().mockRejectedValue(new Error('falha')) });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTaskDetail(service, sampleTask.id));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.task).toBeNull();
    expect(result.current.error).toBe('Erro ao carregar a tarefa');

    consoleErrorSpy.mockRestore();
  });
});
