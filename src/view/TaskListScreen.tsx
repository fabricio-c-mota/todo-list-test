import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ListRenderItem,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Task } from '../model/entities/task';
import { localTaskService } from '../model/service/TaskService';
import { useTasks } from '../viewmodel/useTasks';
import { useAppTheme } from './theme/ThemeContext';
import { AppTheme } from './theme/themes';
import { RootStackParamList } from './types';

export type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ navigation }: TaskListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { tasks, loading, error, refresh, deleteTask } = useTasks(localTaskService);
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);
  const iconColor = theme.colors.textPrimary;
  const mutedColor = theme.colors.muted;
  const checkIconColor = theme.colors.primaryContrast;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return tasks;
    }

    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const handleDelete = (id: number) => {
    Alert.alert('Excluir tarefa', 'Tem certeza de que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(id);
          } catch (deleteError) {
            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
          }
        },
      },
    ]);
  };

  const renderTaskItem: ListRenderItem<Task> = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      style={[styles.card, item.completed && styles.cardCompleted]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
          {item.completed && <Ionicons name="checkmark" size={16} color={checkIconColor} />}
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, item.completed && styles.cardTitleCompleted]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <TouchableOpacity hitSlop={8} onPress={() => handleDelete(item.id)}>
          <Ionicons name="ellipsis-vertical" size={18} color={mutedColor} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Tarefas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            hitSlop={8}
            accessibilityLabel="Alternar tema"
          >
            <Ionicons
              name={theme.mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={22}
              color={iconColor}
            />
          </TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color={iconColor} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={mutedColor} style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar tarefas"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonLabel}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item: Task) => String(item.id)}
          renderItem={renderTaskItem}
          contentContainerStyle={filteredTasks.length ? styles.listContent : styles.listEmptyContent}
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={48}
                color={mutedColor}
              />
              <Text style={styles.emptyTitle}>Nenhuma tarefa encontrada</Text>
              <Text style={styles.emptySubtitle}>Crie uma nova tarefa para começar.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TaskCreate')}
      >
        <Ionicons name="add" size={30} color={theme.colors.fabIcon} />
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme: AppTheme, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: topInset + 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    headerTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '600',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 16,
    },
    listContent: {
      paddingBottom: 100,
      gap: 12,
    },
    listEmptyContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardCompleted: {
      opacity: 0.6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    cardTitleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.muted,
    },
    cardSubtitle: {
      marginTop: 4,
      color: theme.colors.muted,
      fontSize: 14,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.checkboxBorder,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    emptyTitle: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      color: theme.colors.muted,
      fontSize: 14,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.fabBackground,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 14,
    },
    retryButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: theme.colors.warning,
    },
    retryButtonLabel: {
      color: theme.mode === 'dark' ? theme.colors.background : theme.colors.textPrimary,
      fontWeight: '600',
    },
  });
}
