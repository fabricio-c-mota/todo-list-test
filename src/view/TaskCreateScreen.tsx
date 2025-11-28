import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { localTaskService } from '../model/service/TaskService';
import { useTaskCreate } from '../viewmodel/useTaskCreate';
import { useAppTheme } from './theme/ThemeContext';
import { AppTheme } from './theme/themes';
import { RootStackParamList } from './types';

export type TaskCreateScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskCreate'>;

export default function TaskCreateScreen({ navigation }: TaskCreateScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { loading, error, success, createTask, reset } = useTaskCreate(localTaskService);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (error) {
      setFeedback(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      navigation.goBack();
    }
  }, [success, navigation]);

  const handleSubmit = async () => {
    setFeedback(null);

    if (!title.trim() || !description.trim()) {
      setFeedback('Informe título e descrição.');
      return;
    }

    try {
      await createTask(title, description);
      setTitle('');
      setDescription('');
    } catch (submitError) {
      setFeedback('Não foi possível criar a tarefa.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Nova Tarefa</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Adcione um título"
              placeholderTextColor={theme.colors.muted}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Adicione mais detalhes sobre a tarefa"
              placeholderTextColor={theme.colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {feedback && <Text style={styles.feedback}>{feedback}</Text>}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <Text style={styles.submitLabel}>Criar Tarefa</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 24,
    },
    formWrapper: {
      backgroundColor: 'transparent',
      gap: 24,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 12,
    },
    fieldGroup: {
      gap: 12,
    },
    label: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.input,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.textPrimary,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    multiline: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
    feedback: {
      color: theme.colors.danger,
      fontSize: 14,
      textAlign: 'center',
    },
    submitButton: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    submitLabel: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
}
