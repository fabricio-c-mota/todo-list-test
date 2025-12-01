import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { localTaskService } from '../model/service/TaskService';
import { useTaskDetail } from '../viewmodel/useTaskDetail';
import { useAppTheme } from './theme/ThemeContext';
import { AppTheme } from './theme/themes';
import { RootStackParamList } from './types';

export type TaskDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { taskId } = route.params;
  const { task, loading, error, updateTask, deleteTask, loadTask } = useTaskDetail(
    localTaskService,
    taskId
  );
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    setFeedback(error ?? null);
  }, [error]);

  useEffect(() => {
    if (task) {
      setFormTitle(task.title);
      setFormDescription(task.description);
    }
  }, [task]);

  const handleToggleEditing = useCallback(() => {
    if (!task) {
      return;
    }

    setFeedback(null);

    if (isEditing) {
      setIsEditing(false);
      setFormTitle(task.title);
      setFormDescription(task.description);
    } else {
      setIsEditing(true);
    }
  }, [isEditing, task]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Tarefa' : 'Detalhes da Tarefa',
      headerRight: undefined,
    });
  }, [navigation, isEditing]);

  const handleToggleComplete = async () => {
    if (!task || isEditing) {
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      await updateTask({ ...task, completed: !task.completed });
      await loadTask(task.id);
    } catch (toggleError) {
      setFeedback('Erro ao atualizar a tarefa.');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!task) {
      return;
    }

    const trimmedTitle = formTitle.trim();
    const trimmedDescription = formDescription.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setFeedback('Informe título e descrição.');
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      await updateTask({ ...task, title: trimmedTitle, description: trimmedDescription });
      await loadTask(task.id);
      setIsEditing(false);
    } catch (saveError) {
      if (saveError instanceof Error && saveError.message) {
        setFeedback(saveError.message);
      } else {
        setFeedback('Erro ao atualizar a tarefa.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir tarefa', 'Deseja realmente excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            setIsEditing(false);
            await deleteTask();
            navigation.navigate('TaskList');
          } catch (deleteError) {
            setFeedback('Erro ao excluir a tarefa.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading && !task) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centerContent}>
        <Ionicons name="alert-circle-outline" size={40} color={theme.colors.danger} />
        <Text style={styles.feedbackText}>{feedback ?? 'Tarefa não encontrada.'}</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={() => loadTask(taskId)}>
          <Text style={styles.reloadLabel}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryActionLabel = isEditing
    ? 'Salvar Alterações'
    : task.completed
    ? 'Marcar como Pendente'
    : 'Marcar como Concluída';

  const spinnerColor = isEditing
    ? theme.colors.primary
    : task.completed
    ? theme.colors.warning
    : theme.colors.success;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, task.completed ? styles.badgeCompleted : styles.badgePending]}>
              <Ionicons
                name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={task.completed ? theme.colors.success : theme.colors.warning}
              />
              <Text style={[styles.statusLabel, task.completed && styles.statusLabelCompleted]}>
                {task.completed ? 'Concluída' : 'Pendente'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleDelete} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <TextInput
            style={[styles.input, styles.titleInput]}
            value={formTitle}
            onChangeText={setFormTitle}
            placeholder="Título da tarefa"
            placeholderTextColor={theme.colors.muted}
          />
        ) : (
          <Text style={styles.title}>{task.title}</Text>
        )}

        <Text style={styles.sectionLabel}>Descrição</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={formDescription}
            onChangeText={setFormDescription}
            placeholder="Descreva detalhes importantes"
            placeholderTextColor={theme.colors.muted}
            multiline
            numberOfLines={6}
          />
        ) : (
          <Text style={styles.description}>{task.description}</Text>
        )}

        {feedback && <Text style={styles.feedbackText}>{feedback}</Text>}

        <TouchableOpacity
          style={[styles.secondaryButton, isEditing && styles.secondaryButtonActive]}
          onPress={handleToggleEditing}
          disabled={busy}
        >
          <Text style={[styles.secondaryButtonLabel, isEditing && styles.secondaryButtonLabelActive]}>
            {isEditing ? 'Cancelar edição' : 'Editar tarefa'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isEditing && (task.completed ? styles.primaryButtonWarning : styles.primaryButtonSuccess),
          ]}
          onPress={isEditing ? handleSave : handleToggleComplete}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={spinnerColor} />
          ) : (
            <Text
              style={[
                styles.buttonLabel,
                !isEditing && (task.completed ? styles.buttonLabelWarning : styles.buttonLabelSuccess),
              ]}
            >
              {primaryActionLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
      padding: 24,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 24,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusRow: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 0,
      paddingVertical: 0,
      paddingBottom: 4,
    },
    badgeCompleted: {
      borderBottomWidth: 2,
      borderColor: theme.colors.success,
    },
    badgePending: {
      borderBottomWidth: 2,
      borderColor: theme.colors.warning,
    },
    statusLabel: {
      color: theme.colors.warning,
      fontWeight: '600',
    },
    statusLabelCompleted: {
      color: theme.colors.success,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: '700',
    },
    sectionLabel: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: '600',
    },
    description: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    input: {
      backgroundColor: theme.colors.input,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.textPrimary,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    titleInput: {
      fontSize: 20,
      fontWeight: '700',
    },
    descriptionInput: {
      minHeight: 160,
      textAlignVertical: 'top',
    },
    feedbackText: {
      color: theme.colors.danger,
      fontSize: 14,
    },
    reloadButton: {
      marginTop: 16,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
    },
    reloadLabel: {
      color: theme.colors.primaryContrast,
      fontWeight: '600',
    },
    secondaryButton: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.muted,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    secondaryButtonActive: {
      borderColor: theme.colors.primary,
    },
    secondaryButtonLabel: {
      color: theme.colors.muted,
      fontSize: 14,
      fontWeight: '600',
    },
    secondaryButtonLabelActive: {
      color: theme.colors.primary,
    },
    primaryButton: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    primaryButtonSuccess: {
      borderColor: theme.colors.success,
    },
    primaryButtonWarning: {
      borderColor: theme.colors.warning,
    },
    buttonLabel: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonLabelSuccess: {
      color: theme.colors.success,
    },
    buttonLabelWarning: {
      color: theme.colors.warning,
    },
    centerContent: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 24,
    },
  });
}
