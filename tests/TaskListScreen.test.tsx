// tests/TaskListScreen.test.tsx
import React from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

import TaskListScreen from '../src/view/TaskListScreen';
import { Task } from '../src/model/entities/task';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
  };
});

const mockUseFocusEffect = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => mockUseFocusEffect(callback),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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

const mockUseTasks = jest.fn();
jest.mock('../src/viewmodel/useTasks', () => ({
  useTasks: (...args: unknown[]) => mockUseTasks(...args),
}));

describe('TaskListScreen', () => {
  const navigationMock = {
    navigate: jest.fn(),
  };

  const routeMock = {} as any;

  const baseTasks: Task[] = [
    { id: 1, title: 'Comprar pão', description: 'Passar na padaria', completed: false },
    { id: 2, title: 'Estudar testes', description: 'Ler documentação', completed: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockToggleTheme.mockClear();
    mockUseFocusEffect.mockImplementation((callback: () => void) => {
      callback();
    });
  });

  test('renderiza tarefas e navega para detalhes ao tocar', () => {
    const refreshMock = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: refreshMock,
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    expect(getByText('Comprar pão')).toBeTruthy();
    expect(getByText('Estudar testes')).toBeTruthy();
    expect(refreshMock).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Comprar pão'));
    expect(navigationMock.navigate).toHaveBeenCalledWith('TaskDetail', { taskId: 1 });
  });

  test('filtra tarefas de acordo com o texto da busca', () => {
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByPlaceholderText, queryByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    const searchInput = getByPlaceholderText('Buscar tarefas');
    fireEvent.changeText(searchInput, 'comprar');

    expect(queryByText('Comprar pão')).toBeTruthy();
    expect(queryByText('Estudar testes')).toBeNull();
  });

  test('filtra tarefas usando a descrição quando título não combina', () => {
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByPlaceholderText, queryByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    const searchInput = getByPlaceholderText('Buscar tarefas');
    fireEvent.changeText(searchInput, 'padaria');

    expect(queryByText('Comprar pão')).toBeTruthy();
    expect(queryByText('Estudar testes')).toBeNull();
  });

  test('exibe indicador de carregamento quando loading está ativo', () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: true,
      error: null,
      refresh: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { UNSAFE_getAllByType } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
  });

  test('renderiza estado vazio quando não há tarefas', () => {
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    expect(getByText('Nenhuma tarefa encontrada')).toBeTruthy();
    expect(getByText('Crie uma nova tarefa para começar.')).toBeTruthy();
  });

  test('mostra erro e permite tentar novamente', () => {
    const refreshMock = jest.fn();
    mockUseTasks.mockReturnValue({
      tasks: [],
      loading: false,
      error: 'Erro ao carregar',
      refresh: refreshMock,
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    fireEvent.press(getByText('Tentar novamente'));
    expect(refreshMock).toHaveBeenCalledTimes(2);
  });

  test('confirma exclusão e chama deleteTask', async () => {
    const deleteTaskMock = jest.fn().mockResolvedValue(undefined);
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: deleteTaskMock,
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getAllByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    const menuButtons = getAllByText('ellipsis-vertical');
    fireEvent.press(menuButtons[0]);
    expect(alertSpy).toHaveBeenCalled();

    const [, , buttons] = alertSpy.mock.calls[0];
    const confirmButton = buttons?.find((button) => button.text === 'Excluir');
    expect(confirmButton).toBeDefined();

    await act(async () => {
      await confirmButton?.onPress?.();
    });

    expect(deleteTaskMock).toHaveBeenCalledWith(1);
    alertSpy.mockRestore();
  });

  test('exibe alerta de erro quando exclusão falha', async () => {
    const deleteTaskMock = jest.fn().mockRejectedValue(new Error('Falhou'));
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: deleteTaskMock,
    });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { getAllByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    fireEvent.press(getAllByText('ellipsis-vertical')[0]);

    const [, , buttons] = alertSpy.mock.calls[0];
    const confirmButton = buttons?.find((button) => button.text === 'Excluir');

    await act(async () => {
      await confirmButton?.onPress?.();
    });

    const errorAlert = alertSpy.mock.calls.find(([title]) => title === 'Erro');
    expect(errorAlert).toBeDefined();
    alertSpy.mockRestore();
  });

  test('aciona toggleTheme ao tocar no botão de alternância de tema', () => {
    mockUseTasks.mockReturnValue({
      tasks: baseTasks,
      loading: false,
      error: null,
      refresh: jest.fn(),
      deleteTask: jest.fn(),
    });

    const { getByText } = render(
      <TaskListScreen navigation={navigationMock as any} route={routeMock} />
    );

    fireEvent.press(getByText('moon-outline'));
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
