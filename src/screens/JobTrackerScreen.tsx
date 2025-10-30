import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addApplication, updateApplication, deleteApplication, setWeeklyGoal } from '../store/applicationsSlice';
import { Application, ApplicationStatus } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import COLORS from '../constants/colors';

export default function JobTrackerScreen() {
  const dispatch = useDispatch();
  const { applications, weeklyGoal } = useSelector((state: RootState) => state.applications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    notes: '',
  });

  const [goalInput, setGoalInput] = useState(weeklyGoal.toString());

  const filteredApplications = applications.filter(app =>
    filterStatus === 'All' || app.status === filterStatus
  );

  const statusCounts = {
    Applied: applications.filter(app => app.status === 'Applied').length,
    Interview: applications.filter(app => app.status === 'Interview').length,
    Offer: applications.filter(app => app.status === 'Offer').length,
    Rejected: applications.filter(app => app.status === 'Rejected').length,
  };

  const handleAddApplication = () => {
    if (!formData.company || !formData.role) {
      Alert.alert('Error', 'Please fill in company and role fields');
      return;
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      company: formData.company,
      role: formData.role,
      location: formData.location || 'Not specified',
      status: 'Applied',
      appliedDate: new Date().toISOString(),
      notes: formData.notes,
    };

    dispatch(addApplication(newApplication));
    setFormData({ company: '', role: '', location: '', notes: '' });
    setShowAddModal(false);
  };

  const handleUpdateStatus = (applicationId: string, newStatus: ApplicationStatus) => {
    dispatch(updateApplication({ id: applicationId, updates: { status: newStatus } }));
  };

  const handleDeleteApplication = (applicationId: string) => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteApplication(applicationId)) },
      ]
    );
  };

  const handleUpdateGoal = () => {
    const newGoal = parseInt(goalInput);
    if (newGoal >= 1 && newGoal <= 50) {
      dispatch(setWeeklyGoal(newGoal));
      setShowGoalModal(false);
    } else {
      Alert.alert('Error', 'Weekly goal must be between 1 and 50');
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied': return COLORS.primary;
      case 'Interview': return '#059669';
      case 'Offer': return '#f59e0b';
      case 'Rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getNextStatus = (currentStatus: ApplicationStatus): ApplicationStatus | null => {
    switch (currentStatus) {
      case 'Applied': return 'Interview';
      case 'Interview': return 'Offer';
      default: return null;
    }
  };

  const ApplicationCard = ({ application }: { application: Application }) => {
    const nextStatus = getNextStatus(application.status);

    return (
      <View style={styles.applicationCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.companyAvatar, { backgroundColor: getAvatarColor(application.company) }]}>
            <Text style={styles.avatarText}>
              {application.company.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.companyName}>{application.company}</Text>
            <Text style={styles.roleName}>{application.role}</Text>
            <Text style={styles.locationText}>{application.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteApplication(application.id)}
            accessibilityLabel={`Delete application for ${application.company}`}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
              <Text style={styles.statusText}>{application.status}</Text>
            </View>
            <Text style={styles.appliedDate}>
              Applied {format(new Date(application.appliedDate), 'MMM dd, yyyy')}
            </Text>
          </View>

          {application.notes && (
            <Text style={styles.notes}>{application.notes}</Text>
          )}
        </View>

        <View style={styles.cardActions}>
          {nextStatus && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: getStatusColor(nextStatus) }]}
              onPress={() => handleUpdateStatus(application.id, nextStatus)}
              accessibilityLabel={`Move ${application.company} application to ${nextStatus} status`}
              accessibilityRole="button"
            >
              <Text style={styles.actionButtonText}>Move to {nextStatus}</Text>
            </TouchableOpacity>
          )}
          {application.status !== 'Rejected' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus(application.id, 'Rejected')}
              accessibilityLabel={`Mark ${application.company} application as rejected`}
              accessibilityRole="button"
            >
              <Text style={styles.rejectButtonText}>Mark Rejected</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Job Tracker</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.goalButton}
              onPress={() => setShowGoalModal(true)}
              accessibilityLabel="Set weekly application goal"
              accessibilityRole="button"
            >
              <Ionicons name="analytics-outline" size={20} color="#8b5cf6" />
              <Text style={styles.goalButtonText}>Goal: {weeklyGoal}/week</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsOverview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            <TouchableOpacity
              style={[styles.statChip, filterStatus === 'All' && styles.activeChip]}
              onPress={() => setFilterStatus('All')}
              accessibilityLabel={`Show all applications, ${applications.length} total`}
              accessibilityRole="tab"
              accessibilityState={{ selected: filterStatus === 'All' }}
            >
              <Text style={[styles.statChipText, filterStatus === 'All' && styles.activeChipText]}>
                All ({applications.length})
              </Text>
            </TouchableOpacity>
            {Object.entries(statusCounts).map(([status, count]) => (
              <TouchableOpacity
                key={status}
                style={[styles.statChip, filterStatus === status && styles.activeChip]}
                onPress={() => setFilterStatus(status as ApplicationStatus)}
                accessibilityLabel={`Show ${status.toLowerCase()} applications, ${count} total`}
                accessibilityRole="tab"
                accessibilityState={{ selected: filterStatus === status }}
              >
                <Text style={[styles.statChipText, filterStatus === status && styles.activeChipText]}>
                  {status} ({count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.applicationsList}>
          {filteredApplications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>No applications yet</Text>
              <Text style={styles.emptyStateText}>
                {filterStatus === 'All'
                  ? 'Start tracking your job applications by adding your first one!'
                  : `No applications with status "${filterStatus}"`
                }
              </Text>
              {filterStatus === 'All' && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => setShowAddModal(true)}
                  accessibilityLabel="Add your first job application"
                  accessibilityRole="button"
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.emptyStateButtonText}>Add Your First Application</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          accessibilityLabel="Add new job application"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Add Application Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Application</Text>
            <TouchableOpacity onPress={handleAddApplication}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Company *</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="Enter company name"
            />

            <Text style={styles.inputLabel}>Role *</Text>
            <TextInput
              style={styles.input}
              value={formData.role}
              onChangeText={(text) => setFormData({ ...formData, role: text })}
              placeholder="Enter role title"
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Enter location"
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Add any notes about this application"
              multiline
              numberOfLines={4}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Weekly Goal Modal */}
      <Modal visible={showGoalModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.goalModal}>
            <Text style={styles.goalModalTitle}>Set Weekly Goal</Text>
            <Text style={styles.goalModalSubtitle}>How many applications per week?</Text>
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              placeholder="Enter goal (1-50)"
            />
            <View style={styles.goalModalActions}>
              <TouchableOpacity
                style={styles.goalCancelButton}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.goalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goalSaveButton}
                onPress={handleUpdateGoal}
              >
                <Text style={styles.goalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getAvatarColor = (company: string) => {
  const colors = [COLORS.primary, '#059669', '#f59e0b', '#8b5cf6', '#dc2626', '#06b6d4'];
  const index = company.length % colors.length;
  return colors[index];
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 6,
    minHeight: 44,
    minWidth: 44,
  },
  goalButtonText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statsOverview: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsScroll: {
    paddingHorizontal: 20,
  },
  statChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  statChipText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeChipText: {
    color: 'white',
  },
  applicationsList: {
    flex: 1,
    padding: 20,
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  applicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  roleName: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  deleteButton: {
    padding: 12,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appliedDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  notes: {
    fontSize: 14,
    color: '#374151',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
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
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    height: 100,
    textAlignVertical: 'top',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 280,
  },
  goalModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  goalModalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  goalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  goalModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  goalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  goalCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  goalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  goalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});