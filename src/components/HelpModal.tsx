import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpContent } from '../data/helpContent';
import COLORS from '../constants/colors';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  content: HelpContent;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  visible,
  onClose,
  content,
}) => {
  const renderLine = (line: string, key: number) => {
    const trimmed = line.trimStart();

    // Detect bullet lines like "• Something" or "•Something"
    const isBullet = trimmed.startsWith('•');

    if (!isBullet) {
      return (
        <Text key={key} style={styles.paragraph}>
          {line}
        </Text>
      );
    }

    // Remove bullet symbol from the string so we can render it in its own column
    const bulletText = trimmed.replace(/^•\s*/, '');

    return (
      <View key={key} style={styles.bulletRow}>
        <Text style={styles.bulletSymbol}>•</Text>
        <Text style={styles.bulletText}>{bulletText}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{content.title}</Text>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {content.sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.content.map((line, lineIndex) =>
                renderLine(line, lineIndex)
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },

  // Normal paragraph text
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },

  // Bullet rows (fixes alignment when text wraps)
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletSymbol: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
});
