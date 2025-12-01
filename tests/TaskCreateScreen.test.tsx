// tests/TaskCreateScreen.test.tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import TaskCreateScreen from '../src/view/TaskCreateScreen';

const mockToggleTheme = jest.fn();
jest.mock('../src/view/theme/ThemeContext', () => {
  const { lightTheme } = jest.requireActual('../src/view/theme/themes');
  return {
    useAppTheme: () => ({
      theme: lightTheme,
      mode: lightTheme.mode,
      toggleTheme: mockToggleTheme,
      setMode: jest.fn(),
    }),
  };
});

const mockUseTaskCreate = jest.fn();
jest.mock('../src/viewmodel/useTaskCreate', () => ({
  useTaskCreate: (...args: unknown[]) => mockUseTaskCreate(...args),
}));

describe('TaskCreateScreen', () => {
  const navigation = {
    goBack: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('envia dados válidos e limpa os campos', async () => {
    const createTaskMock = jest.fn().mockResolvedValue(undefined);
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: null,
      success: false,
      createTask: createTaskMock,
      reset: jest.fn(),
    });

    const { getByPlaceholderText, getByText } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Adcione um título'), 'Título válido');
    fireEvent.changeText(
      getByPlaceholderText('Adicione mais detalhes sobre a tarefa'),
      'Descrição válida'
    );

    await act(async () => {
      fireEvent.press(getByText('Criar Tarefa'));
    });

    expect(createTaskMock).toHaveBeenCalledWith('Título válido', 'Descrição válida');

    await waitFor(() => {
      expect(getByPlaceholderText('Adcione um título').props.value).toBe('');
      expect(getByPlaceholderText('Adicione mais detalhes sobre a tarefa').props.value).toBe('');
    });
  });

  test('mostra feedback quando campos obrigatórios faltam', () => {
    const createTaskMock = jest.fn();
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: null,
      success: false,
      createTask: createTaskMock,
      reset: jest.fn(),
    });

    const { getByText } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    fireEvent.press(getByText('Criar Tarefa'));

    expect(createTaskMock).not.toHaveBeenCalled();
    expect(getByText('Informe título e descrição.')).toBeTruthy();
  });

  test('exibe mensagem de erro proveniente do hook', () => {
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: 'Erro do serviço',
      success: false,
      createTask: jest.fn(),
      reset: jest.fn(),
    });

    const { getByText } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    expect(getByText('Erro do serviço')).toBeTruthy();
  });

  test('navega de volta quando success é verdadeiro', () => {
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: null,
      success: true,
      createTask: jest.fn(),
      reset: jest.fn(),
    });

    render(<TaskCreateScreen navigation={navigation} route={undefined as any} />);

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  test('chama reset ao desmontar o componente', () => {
    const resetMock = jest.fn();
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: null,
      success: false,
      createTask: jest.fn(),
      reset: resetMock,
    });

    const { unmount } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    unmount();

    expect(resetMock).toHaveBeenCalledTimes(1);
  });

  test('mostra indicador de carregamento enquanto loading é verdadeiro', () => {
    mockUseTaskCreate.mockReturnValue({
      loading: true,
      error: null,
      success: false,
      createTask: jest.fn(),
      reset: jest.fn(),
    });

    const { UNSAFE_getAllByType } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
  });

  test('mostra mensagem genérica quando createTask rejeita', async () => {
    const createTaskMock = jest.fn().mockRejectedValue(new Error('Falha no serviço'));
    mockUseTaskCreate.mockReturnValue({
      loading: false,
      error: null,
      success: false,
      createTask: createTaskMock,
      reset: jest.fn(),
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <TaskCreateScreen navigation={navigation} route={undefined as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Adcione um título'), 'Novo título');
    fireEvent.changeText(
      getByPlaceholderText('Adicione mais detalhes sobre a tarefa'),
      'Detalhes'
    );

    await act(async () => {
      fireEvent.press(getByText('Criar Tarefa'));
    });

    expect(await findByText('Não foi possível criar a tarefa.')).toBeTruthy();
    expect(createTaskMock).toHaveBeenCalledTimes(1);
  });
});
