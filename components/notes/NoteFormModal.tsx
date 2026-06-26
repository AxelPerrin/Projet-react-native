import { memo, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { formatDueDate } from '@/lib/format';
import { NOTE_CATEGORY_LABELS, toIsoDateOnly } from '@/lib/noteUtils';
import { theme } from '@/lib/theme';
import type { NoteCategory } from '@/types/note';

export type NoteFormMode = 'create' | 'edit';

const CATEGORIES: NoteCategory[] = ['course', 'homework', 'exam'];

interface NoteFormModalProps {
  visible: boolean;
  mode: NoteFormMode;
  title: string;
  description: string;
  category: NoteCategory;
  dueDate: Date | null;
  completed: boolean;
  formError: string | null;
  isSubmitting: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeCategory: (value: NoteCategory) => void;
  onChangeDueDate: (value: Date | null) => void;
  onChangeCompleted: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function NoteFormModalComponent({
  visible,
  mode,
  title,
  description,
  category,
  dueDate,
  completed,
  formError,
  isSubmitting,
  onChangeTitle,
  onChangeDescription,
  onChangeCategory,
  onChangeDueDate,
  onChangeCompleted,
  onClose,
  onSubmit,
}: NoteFormModalProps) {
  const insets = useSafeAreaInsets();
  const [dateInput, setDateInput] = useState('');
  const [dateInputError, setDateInputError] = useState<string | null>(null);

  // Initialise the text field from the current dueDate whenever the modal opens/closes.
  // Runs only on `visible` changes to avoid feedback-loops with onChangeDueDate.
  useEffect(() => {
    if (visible) {
      if (dueDate) {
        const dd = String(dueDate.getDate()).padStart(2, '0');
        const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
        const yyyy = String(dueDate.getFullYear());
        setDateInput(`${dd}/${mm}/${yyyy}`);
      } else {
        setDateInput('');
      }
      setDateInputError(null);
    } else {
      setDateInput('');
      setDateInputError(null);
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateInput = (text: string) => {
    // Keep only digits, cap at 8 (DDMMYYYY)
    const digits = text.replace(/\D/g, '').slice(0, 8);

    // Auto-insert slashes: DD / MM / YYYY
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }

    setDateInput(formatted);
    setDateInputError(null);

    if (digits.length === 8) {
      const day = parseInt(digits.slice(0, 2), 10);
      const month = parseInt(digits.slice(2, 4), 10);
      const year = parseInt(digits.slice(4, 8), 10);

      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
        setDateInputError('Date invalide');
        onChangeDueDate(null);
        return;
      }

      // JavaScript Date validates day-in-month automatically (e.g. 30/02 overflows)
      const date = new Date(year, month - 1, day);
      if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
      ) {
        setDateInputError('Date invalide');
        onChangeDueDate(null);
        return;
      }

      onChangeDueDate(date);
    } else if (digits.length === 0) {
      onChangeDueDate(null);
    }
  };

  const clearDueDate = () => {
    setDateInput('');
    setDateInputError(null);
    onChangeDueDate(null);
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Fermer"
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          pointerEvents="box-none"
          style={styles.keyboardView}
        >
          <View
            style={[styles.content, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}
          >
            <View style={styles.handle} />

            <Text style={styles.modalTitle}>
              {mode === 'create' ? 'Nouvelle entrée' : "Modifier l'entrée"}
            </Text>

            {formError ? <ErrorMessage message={formError} /> : null}

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              <View style={styles.fields}>
                <Input
                  editable={!isSubmitting}
                  label="Titre"
                  onChangeText={onChangeTitle}
                  placeholder="Ex. Dissertation d'histoire"
                  value={title}
                />

                <View style={styles.field}>
                  <Text style={styles.label}>Catégorie</Text>
                  <View style={styles.categoryRow}>
                    {CATEGORIES.map((option) => {
                      const isSelected = category === option;

                      return (
                        <Pressable
                          key={option}
                          disabled={isSubmitting}
                          onPress={() => onChangeCategory(option)}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSelected && styles.categoryChipTextActive,
                            ]}
                          >
                            {NOTE_CATEGORY_LABELS[option]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Date limite (optionnel)</Text>
                  <View style={styles.dateRow}>
                    <TextInput
                      editable={!isSubmitting}
                      keyboardType="numeric"
                      maxLength={10}
                      onChangeText={handleDateInput}
                      placeholder="JJ/MM/AAAA"
                      placeholderTextColor={theme.colors.textTertiary}
                      style={[
                        styles.dateInput,
                        !!dateInputError && styles.dateInputInvalid,
                        isSubmitting && styles.dateInputDisabled,
                      ]}
                      value={dateInput}
                    />
                    {dateInput.length > 0 ? (
                      <Button
                        disabled={isSubmitting}
                        onPress={clearDueDate}
                        size="compact"
                        title="Effacer"
                        variant="secondary"
                      />
                    ) : null}
                  </View>
                  {dateInputError ? (
                    <Text style={styles.dateError}>{dateInputError}</Text>
                  ) : dueDate ? (
                    <Text style={styles.dateParsed}>
                      {formatDueDate(toIsoDateOnly(dueDate))}
                    </Text>
                  ) : null}
                </View>

                {mode === 'edit' ? (
                  <View style={styles.toggleRow}>
                    <View style={styles.toggleText}>
                      <Text style={styles.label}>Terminé</Text>
                      <Text style={styles.toggleHint}>
                        Marquer cette entrée comme terminée
                      </Text>
                    </View>
                    <Switch
                      disabled={isSubmitting}
                      onValueChange={onChangeCompleted}
                      thumbColor={theme.colors.surface}
                      trackColor={{
                        false: theme.colors.border,
                        true: theme.colors.success,
                      }}
                      value={completed}
                    />
                  </View>
                ) : null}

                <Input
                  editable={!isSubmitting}
                  label="Description (optionnel)"
                  multiline
                  numberOfLines={4}
                  onChangeText={onChangeDescription}
                  placeholder="Détails, consignes, lieu…"
                  style={styles.textArea}
                  textAlignVertical="top"
                  value={description}
                />
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <Button
                disabled={isSubmitting}
                onPress={onClose}
                style={styles.actionButton}
                title="Annuler"
                variant="secondary"
              />
              <Button
                disabled={isSubmitting}
                loading={isSubmitting}
                onPress={onSubmit}
                style={styles.actionButton}
                title={mode === 'create' ? 'Créer' : 'Enregistrer'}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export const NoteFormModal = memo(NoteFormModalComponent);

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    gap: theme.spacing.md,
    maxHeight: '92%',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.full,
    height: 4,
    marginBottom: theme.spacing.sm,
    width: 36,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  scroll: {
    flexGrow: 0,
  },
  fields: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  field: {
    gap: theme.spacing.xs + 2,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dateInput: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    flex: 1,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: theme.sizes.inputMinHeight,
    paddingHorizontal: theme.spacing.md,
  },
  dateInputInvalid: {
    borderColor: theme.colors.error,
  },
  dateInputDisabled: {
    opacity: 0.55,
  },
  dateError: {
    ...theme.typography.caption,
    color: theme.colors.error,
  },
  dateParsed: {
    ...theme.typography.caption,
    color: theme.colors.success,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleText: {
    flex: 1,
    gap: 2,
    marginRight: theme.spacing.md,
  },
  toggleHint: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  textArea: {
    backgroundColor: theme.colors.background,
    minHeight: 112,
    paddingTop: theme.spacing.sm + 4,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});
