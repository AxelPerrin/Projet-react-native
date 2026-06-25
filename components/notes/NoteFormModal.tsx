import { memo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Input } from '@/components/ui/Input';
import { theme } from '@/lib/theme';

export type NoteFormMode = 'create' | 'edit';

interface NoteFormModalProps {
  visible: boolean;
  mode: NoteFormMode;
  title: string;
  description: string;
  formError: string | null;
  isSubmitting: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function NoteFormModalComponent({
  visible,
  mode,
  title,
  description,
  formError,
  isSubmitting,
  onChangeTitle,
  onChangeDescription,
  onClose,
  onSubmit,
}: NoteFormModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable accessibilityLabel="Fermer" onPress={onClose} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
              <View style={styles.handle} />

              <Text style={styles.modalTitle}>
                {mode === 'create' ? 'Nouvelle note' : 'Modifier la note'}
              </Text>

              {formError ? <ErrorMessage message={formError} /> : null}

              <View style={styles.fields}>
                <Input
                  editable={!isSubmitting}
                  label="Titre"
                  onChangeText={onChangeTitle}
                  placeholder="Titre de la note"
                  value={title}
                />

                <Input
                  editable={!isSubmitting}
                  label="Description (optionnel)"
                  multiline
                  numberOfLines={4}
                  onChangeText={onChangeDescription}
                  placeholder="Description…"
                  style={styles.textArea}
                  textAlignVertical="top"
                  value={description}
                />
              </View>

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
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
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
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    gap: theme.spacing.md,
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
  fields: {
    gap: theme.spacing.md,
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
