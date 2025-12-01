// tests/TaskDetailScreen.test.tsx
import React from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import TaskDetailScreen from '../src/view/TaskDetailScreen';
import { Task } from '../src/model/entities/task';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

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

const mockUseTaskDetail = jest.fn();
jest.mock('../src/viewmodel/useTaskDetail', () => ({
  useTaskDetail: (...args: unknown[]) => mockUseTaskDetail(...args),
}));

describe('TaskDetailScreen', () => {
  const route = { params: { taskId: 99 } } as any;
  const navigation = {
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
  } as any;

  const baseTask: Task = {
    id: 99,
    title: 'Ler documentos',
    description: 'Estudar casos de uso',
    completed: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('exibe indicador de carregamento quando task ainda não foi carregada', () => {
    mockUseTaskDetail.mockReturnValue({
      task: null,
      loading: true,
      error: null,
      loadTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { UNSAFE_getAllByType } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
  });

  test('mostra fallback e chama loadTask ao tentar novamente', () => {
    const loadTaskMock = jest.fn();
    mockUseTaskDetail.mockReturnValue({
      task: null,
      loading: false,
      error: 'Erro ao carregar a tarefa',
      loadTask: loadTaskMock,
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('Tentar novamente'));
    expect(loadTaskMock).toHaveBeenCalledWith(99);
  });

  test('renderiza dados da tarefa e alterna status de conclusão', async () => {
    const updateTaskMock = jest.fn().mockResolvedValue(undefined);
    const loadTaskMock = jest.fn().mockResolvedValue(undefined);

    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      updateTask: updateTaskMock,
      loadTask: loadTaskMock,
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    const primaryButton = getByText('Marcar como Concluída');

    await act(async () => {
      fireEvent.press(primaryButton);
    });

    expect(updateTaskMock).toHaveBeenCalledWith({ ...baseTask, completed: true });
    expect(loadTaskMock).toHaveBeenCalledWith(99);
  });

  test('habilita modo edição e salva alterações com trims', async () => {
    const updateTaskMock = jest.fn().mockResolvedValue(undefined);
    const loadTaskMock = jest.fn().mockResolvedValue(undefined);

    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      updateTask: updateTaskMock,
      loadTask: loadTaskMock,
      deleteTask: jest.fn(),
    });

    const { getByText, getByPlaceholderText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('Editar tarefa'));

    const titleInput = getByPlaceholderText('Título da tarefa');
    const descriptionInput = getByPlaceholderText('Descreva detalhes importantes');

    fireEvent.changeText(titleInput, '  Novo título  ');
    fireEvent.changeText(descriptionInput, '  Nova descrição  ');

    await act(async () => {
      fireEvent.press(getByText('Salvar Alterações'));
    });

    expect(updateTaskMock).toHaveBeenCalledWith({
      ...baseTask,
      title: 'Novo título',
      description: 'Nova descrição',
    });
    expect(loadTaskMock).toHaveBeenCalledWith(99);

    await waitFor(() => {
      expect(getByText('Editar tarefa')).toBeTruthy();
    });
  });

  test('exibe mensagem de feedback quando erro é recebido', () => {
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: 'Falha ao atualizar',
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    expect(getByText('Falha ao atualizar')).toBeTruthy();
  });

  test('mostra erro ao tentar alternar conclusão quando updateTask falha', async () => {
    const updateTaskMock = jest.fn().mockRejectedValue(new Error('Falhou'));
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      updateTask: updateTaskMock,
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByText, findByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    await act(async () => {
      fireEvent.press(getByText('Marcar como Concluída'));
    });

    expect(await findByText('Erro ao atualizar a tarefa.')).toBeTruthy();
    expect(updateTaskMock).toHaveBeenCalledTimes(1);
  });

  test('mantém mensagem do serviço quando salvar falha durante edição', async () => {
    const errorMessage = 'Título inválido';
    const updateTaskMock = jest.fn().mockRejectedValue(new Error(errorMessage));
    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      updateTask: updateTaskMock,
      loadTask: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByPlaceholderText, getByText, findByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('Editar tarefa'));
    fireEvent.changeText(getByPlaceholderText('Título da tarefa'), 'Título qualquer');
    fireEvent.changeText(
      getByPlaceholderText('Descreva detalhes importantes'),
      'Descrição qualquer'
    );

    await act(async () => {
      fireEvent.press(getByText('Salvar Alterações'));
    });

    expect(await findByText(errorMessage)).toBeTruthy();
    expect(updateTaskMock).toHaveBeenCalledTimes(1);
  });

  test('confirma exclusão e navega de volta para a lista', async () => {
    const deleteTaskMock = jest.fn().mockResolvedValue(undefined);

    mockUseTaskDetail.mockReturnValue({
      task: baseTask,
      loading: false,
      error: null,
      updateTask: jest.fn(),
      loadTask: jest.fn(),
      deleteTask: deleteTaskMock,
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getByText } = render(
      <TaskDetailScreen navigation={navigation} route={route} />
    );

    fireEvent.press(getByText('trash-outline'));

    const [, , buttons] = alertSpy.mock.calls[0];
    const confirmButton = buttons?.find((button) => button.text === 'Excluir');

    await act(async () => {
      await confirmButton?.onPress?.();
    });

    expect(deleteTaskMock).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('TaskList');

    alertSpy.mockRestore();
  });
});
