import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import {
  addResume,
  deleteResume,
  setPrimaryResume,
  updateResumeName,
  startResumeTailoring,
  completeTailoring,
} from '../store/resumeSlice';
import { Resume, TailoredResume } from '../types';
import ResumeTailoringProcessor from '../components/ResumeTailoringProcessor';
import COLORS from '../constants/colors';

export default function ResumeScreen() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { resumes, tailoredResumes, isProcessing } = useSelector((state: RootState) => state.resume);

  const [showTailoringModal, setShowTailoringModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedResumeForRename, setSelectedResumeForRename] = useState<Resume | null>(null);
  const [newResumeName, setNewResumeName] = useState('');

  const [tailoringForm, setTailoringForm] = useState({
    selectedResumeId: '',
    companyName: '',
    positionTitle: '',
    jobDescription: '',
  });

  const primaryResume = resumes.find(resume => resume.isPrimary);

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        if (!currentUser) {
          Alert.alert('Error', 'User not found');
          return;
        }

        const newResume: Resume = {
          id: Date.now().toString(),
          name: file.name.replace('.pdf', ''),
          fileName: file.name,
          fileUri: file.uri,
          uploadedAt: new Date().toISOString(),
          isPrimary: resumes.length === 0, // First resume becomes primary
          tailoredVersions: [],
        };

        dispatch(addResume(newResume));
        Alert.alert('Success', 'Resume uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume');
    }
  };

  const handleDeleteResume = (resumeId: string) => {
    const resume = resumes.find(r => r.id === resumeId);
    if (!resume) return;

    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${resume.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteResume(resumeId)),
        },
      ]
    );
  };

  const handleSetPrimary = (resumeId: string) => {
    dispatch(setPrimaryResume(resumeId));
  };

  const handleRenameResume = () => {
    if (!selectedResumeForRename || !newResumeName.trim()) return;

    dispatch(updateResumeName({
      id: selectedResumeForRename.id,
      name: newResumeName.trim(),
    }));

    setShowRenameModal(false);
    setSelectedResumeForRename(null);
    setNewResumeName('');
  };

  const openRenameModal = (resume: Resume) => {
    setSelectedResumeForRename(resume);
    setNewResumeName(resume.name);
    setShowRenameModal(true);
  };

  const handleStartTailoring = () => {
    if (!tailoringForm.selectedResumeId || !tailoringForm.companyName.trim() ||
        !tailoringForm.positionTitle.trim() || !tailoringForm.jobDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    dispatch(startResumeTailoring({
      resumeId: tailoringForm.selectedResumeId,
      companyName: tailoringForm.companyName.trim(),
      positionTitle: tailoringForm.positionTitle.trim(),
      jobDescription: tailoringForm.jobDescription.trim(),
    }));

    setShowTailoringModal(false);
    setShowProcessingModal(true);
  };

  const handleTailoringComplete = () => {
    const tailoredResume: TailoredResume = {
      id: Date.now().toString(),
      originalResumeId: tailoringForm.selectedResumeId,
      companyName: tailoringForm.companyName,
      positionTitle: tailoringForm.positionTitle,
      jobDescription: tailoringForm.jobDescription,
      tailoredAt: new Date().toISOString(),
      processingStatus: 'completed',
    };

    dispatch(completeTailoring(tailoredResume));
    setShowProcessingModal(false);

    // Reset form
    setTailoringForm({
      selectedResumeId: '',
      companyName: '',
      positionTitle: '',
      jobDescription: '',
    });

    Alert.alert('Success', 'Resume tailored successfully!');
  };

  const ResumeCard = ({ resume }: { resume: Resume }) => (
    <View style={styles.resumeCard}>
      <View style={styles.resumeHeader}>
        <View style={styles.resumeInfo}>
          <View style={styles.resumeNameContainer}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <Text style={styles.resumeName}>{resume.name}</Text>
            {resume.isPrimary && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </View>
          <Text style={styles.resumeDate}>
            Uploaded {format(new Date(resume.uploadedAt), 'MMM dd, yyyy')}
          </Text>
          {resume.tailoredVersions && resume.tailoredVersions.length > 0 && (
            <Text style={styles.tailoredCount}>
              {resume.tailoredVersions.length} tailored version{resume.tailoredVersions.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.resumeActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openRenameModal(resume)}
          >
            <Ionicons name="pencil" size={16} color="#6b7280" />
          </TouchableOpacity>
          {!resume.isPrimary && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSetPrimary(resume.id)}
            >
              <Ionicons name="star-outline" size={16} color="#f59e0b" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteResume(resume.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const TailoredResumeCard = ({ tailored }: { tailored: TailoredResume }) => {
    const originalResume = resumes.find(r => r.id === tailored.originalResumeId);

    return (
      <View style={styles.tailoredCard}>
        <View style={styles.tailoredHeader}>
          <Ionicons name="document" size={20} color="#059669" />
          <Text style={styles.tailoredTitle}>
            {tailored.positionTitle} at {tailored.companyName}
          </Text>
        </View>
        <Text style={styles.tailoredSubtitle}>
          Based on: {originalResume?.name || 'Unknown Resume'}
        </Text>
        <Text style={styles.tailoredDate}>
          Tailored {format(new Date(tailored.tailoredAt), 'MMM dd, yyyy')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resume Manager</Text>
          <Text style={styles.subtitle}>Upload and tailor your resumes for specific jobs</Text>
        </View>

        {/* Primary Resume Section */}
        {primaryResume && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Resume</Text>
            <ResumeCard resume={primaryResume} />
          </View>
        )}

        {/* Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Resume</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadResume}>
            <Ionicons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={styles.uploadButtonText}>Upload PDF Resume</Text>
            <Text style={styles.uploadSubtext}>PDF files only</Text>
          </TouchableOpacity>
        </View>

        {/* All Resumes Section */}
        {resumes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Resumes ({resumes.length})</Text>
            {resumes.map(resume => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </View>
        )}

        {/* Resume Tailoring Section */}
        {resumes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resume Tailoring</Text>
            <TouchableOpacity
              style={styles.tailorButton}
              onPress={() => setShowTailoringModal(true)}
            >
              <Ionicons name="construct-outline" size={24} color="white" />
              <Text style={styles.tailorButtonText}>Tailor Resume for Job</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tailoring History */}
        {tailoredResumes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tailoring History ({tailoredResumes.length})</Text>
            {tailoredResumes.map(tailored => (
              <TailoredResumeCard key={tailored.id} tailored={tailored} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {resumes.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>No resumes uploaded</Text>
            <Text style={styles.emptyStateText}>
              Upload your first resume to get started with resume tailoring
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Tailoring Modal */}
      <Modal
        visible={showTailoringModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTailoringModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tailor Resume</Text>
            <TouchableOpacity onPress={handleStartTailoring}>
              <Text style={styles.saveButton}>Start Tailoring</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Select Resume *</Text>
            <View style={styles.resumeSelector}>
              {resumes.map(resume => (
                <TouchableOpacity
                  key={resume.id}
                  style={[
                    styles.resumeOption,
                    tailoringForm.selectedResumeId === resume.id && styles.selectedResumeOption,
                  ]}
                  onPress={() => setTailoringForm({ ...tailoringForm, selectedResumeId: resume.id })}
                >
                  <Ionicons
                    name={tailoringForm.selectedResumeId === resume.id ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={tailoringForm.selectedResumeId === resume.id ? COLORS.primary : "#9ca3af"}
                  />
                  <Text style={[
                    styles.resumeOptionText,
                    tailoringForm.selectedResumeId === resume.id && styles.selectedResumeOptionText,
                  ]}>
                    {resume.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Company Name *</Text>
            <TextInput
              style={styles.input}
              value={tailoringForm.companyName}
              onChangeText={(text) => setTailoringForm({ ...tailoringForm, companyName: text })}
              placeholder="Enter company name"
            />

            <Text style={styles.inputLabel}>Position Title *</Text>
            <TextInput
              style={styles.input}
              value={tailoringForm.positionTitle}
              onChangeText={(text) => setTailoringForm({ ...tailoringForm, positionTitle: text })}
              placeholder="Enter position title"
            />

            <Text style={styles.inputLabel}>Job Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={tailoringForm.jobDescription}
              onChangeText={(text) => setTailoringForm({ ...tailoringForm, jobDescription: text })}
              placeholder="Paste the job description here..."
              multiline
              numberOfLines={8}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renameModal}>
            <Text style={styles.renameModalTitle}>Rename Resume</Text>
            <TextInput
              style={styles.renameInput}
              value={newResumeName}
              onChangeText={setNewResumeName}
              placeholder="Enter new name"
              autoFocus
            />
            <View style={styles.renameModalActions}>
              <TouchableOpacity
                style={styles.cancelRenameButton}
                onPress={() => setShowRenameModal(false)}
              >
                <Text style={styles.cancelRenameText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveRenameButton}
                onPress={handleRenameResume}
              >
                <Text style={styles.saveRenameText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Modal */}
      <ResumeTailoringProcessor
        visible={showProcessingModal}
        onComplete={handleTailoringComplete}
        companyName={tailoringForm.companyName}
        positionTitle={tailoringForm.positionTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  resumeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resumeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resumeInfo: {
    flex: 1,
  },
  resumeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  primaryBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
  },
  resumeDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  tailoredCount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  tailorButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  tailorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tailoredCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  tailoredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tailoredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  tailoredSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  tailoredDate: {
    fontSize: 12,
    color: '#059669',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  resumeSelector: {
    gap: 12,
  },
  resumeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedResumeOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#eff6ff',
  },
  resumeOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  selectedResumeOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  renameModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelRenameButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  cancelRenameText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  saveRenameButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  saveRenameText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});