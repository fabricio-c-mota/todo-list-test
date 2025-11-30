// tests/useTaskCreate.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { useTaskCreate } from '../src/viewmodel/useTaskCreate';
import { makeTaskService } from './utils/testUtils';

describe('useTaskCreate', () => {
  test('createTask sucesso seta success true', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskCreate(service));

    await act(async () => {
      await result.current.createTask('Título', 'Descrição');
    });

    expect(service.createTask).toHaveBeenCalledWith('Título', 'Descrição');
    expect(result.current.success).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('createTask em falha propaga mensagem de erro', async () => {
    const service = makeTaskService({ createTask: jest.fn().mockRejectedValue(new Error('falha criar')) });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderHook(() => useTaskCreate(service));

    await act(async () => {
      await result.current.createTask('T', 'D');
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('falha criar');
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  test('reset restaura estado inicial', async () => {
    const service = makeTaskService();
    const { result } = renderHook(() => useTaskCreate(service));

    await act(async () => {
      await result.current.createTask('T', 'D');
    });
    expect(result.current.success).toBe(true);

    act(() => result.current.reset());
    expect(result.current.success).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
