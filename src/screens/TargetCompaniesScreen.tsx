import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { targetCompanies } from '../data/companiesData';
import { CompanyRecommendation, RoleType, ChecklistItem } from '../types';
import { CompanyTargetCard } from '../components/CompanyTargetCard';
import { RootState } from '../store';
import { addTargetCompany, removeTargetCompany } from '../store/userTargetCompaniesSlice';
import { format } from 'date-fns';
import DropdownSelector from '../components/DropdownSelector';
import COLORS from '../constants/colors';

export default function TargetCompaniesScreen() {
  const dispatch = useDispatch();
  const { targetCompanies: userTargetCompanies } = useSelector((state: RootState) => state.userTargetCompanies);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecommendation | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleType>('Full-time');
  const [activeTab, setActiveTab] = useState<'timeline' | 'events' | 'courses' | 'checklist'>('timeline');
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Get user's target company IDs
  const userTargetCompanyIds = userTargetCompanies.map(tc => tc.companyId);

  // Filter companies based on user's targets
  const myTargetCompanies = targetCompanies.filter(company =>
    userTargetCompanyIds.includes(company.id)
  );

  // Get available companies for the dropdown
  const availableCompanies = targetCompanies.filter(company =>
    !userTargetCompanyIds.includes(company.id)
  );
  const companyOptions = availableCompanies.map(company => company.name).concat(['Other']);

  const handleToggleTarget = (companyId: string) => {
    if (userTargetCompanyIds.includes(companyId)) {
      dispatch(removeTargetCompany(companyId));
    } else {
      dispatch(addTargetCompany({ companyId }));
    }
  };

  const handleAddCompany = (selectedCompanies: string | string[]) => {
    const companies = Array.isArray(selectedCompanies) ? selectedCompanies : [selectedCompanies];

    companies.forEach(companyName => {
      if (companyName === 'Other') {
        // Handle custom company input
        return;
      }

      // Find the company in our target companies list
      const company = targetCompanies.find(c => c.name === companyName);
      if (company && !userTargetCompanyIds.includes(company.id)) {
        dispatch(addTargetCompany({ companyId: company.id }));
      }
    });

    setShowAddCompanyModal(false);
  };

  const handleAddCustomCompany = () => {
    if (!newCompanyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    // For now, we'll just show an alert since custom companies need more complex handling
    Alert.alert('Custom Company', `"${newCompanyName}" will be added to your target list. This feature will be enhanced in a future update.`);
    setNewCompanyName('');
    setShowAddCompanyModal(false);
  };

  const renderMyTargetsSection = () => {
    if (myTargetCompanies.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyStateTitle}>No Target Companies Yet</Text>
          <Text style={styles.emptyStateText}>
            Add companies to your target list to get personalized insights and preparation materials.
          </Text>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => setShowAddCompanyModal(true)}
          >
            <Text style={styles.discoverButtonText}>Add Companies</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.companiesList}>
        {myTargetCompanies.map((company) => (
          <CompanyTargetCard
            key={company.id}
            company={company}
            selectedRole={selectedRole}
            isTargeted={true}
            onPress={() => setSelectedCompany(company)}
            onToggleTarget={() => handleToggleTarget(company.id)}
            showAddButton={false}
          />
        ))}
      </ScrollView>
    );
  };


  const renderCompanyDetails = () => {
    if (!selectedCompany) return null;

    switch (activeTab) {
      case 'timeline':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Application Timeline</Text>
            {Object.entries(selectedCompany.applicationTimeline).map(([role, timeline]) => (
              <View key={role} style={styles.timelineItem}>
                <Text style={styles.roleType}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
                <Text style={styles.timelineDate}>{timeline}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Company Size</Text>
              <Text style={styles.infoValue}>{selectedCompany.companyInfo.size}</Text>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Culture & Values</Text>
              <View style={styles.tagContainer}>
                {selectedCompany.companyInfo.culture.map((value, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Benefits</Text>
              <View style={styles.tagContainer}>
                {selectedCompany.companyInfo.benefits.map((benefit, index) => (
                  <View key={index} style={[styles.tag, styles.benefitTag]}>
                    <Text style={[styles.tagText, styles.benefitTagText]}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Interview Process</Text>
              {selectedCompany.companyInfo.interviewProcess.map((step, index) => (
                <View key={index} style={styles.processStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'events':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Upcoming Events & Programs</Text>
            {selectedCompany.events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <View style={[styles.eventTypeTag, getEventTypeStyle(event.type)]}>
                    <Text style={[styles.eventTypeText, getEventTypeTextStyle(event.type)]}>
                      {event.type}
                    </Text>
                  </View>
                  <Text style={styles.eventDate}>
                    {format(new Date(event.date), 'MMM dd, yyyy')}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDescription}>{event.description}</Text>
                {event.registrationLink && (
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>Register</Text>
                    <Ionicons name="open-outline" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        );

      case 'courses':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Recommended Courses</Text>
            {selectedCompany.recommendedCourses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={[styles.levelBadge, getLevelStyle(course.level)]}>
                    <Text style={[styles.levelText, getLevelTextStyle(course.level)]}>
                      {course.level}
                    </Text>
                  </View>
                </View>
                <Text style={styles.courseProvider}>by {course.provider}</Text>
                <Text style={styles.courseDuration}>Duration: {course.duration}</Text>
                <View style={styles.skillsContainer}>
                  {course.skills.map((skill, index) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.courseButton}>
                  <Text style={styles.courseButtonText}>View Course</Text>
                  <Ionicons name="open-outline" size={16} color="#059669" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      case 'checklist':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Preparation Checklist</Text>
            {['Interview Prep', 'Portfolio', 'Culture Study', 'Technical Skills'].map((category) => {
              const items = selectedCompany.preparationChecklist.filter(item => item.category === category);
              if (items.length === 0) return null;

              return (
                <View key={category} style={styles.checklistCategory}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  {items.map((item) => (
                    <View key={item.id} style={styles.checklistItem}>
                      <TouchableOpacity style={styles.checkbox}>
                        {item.completed && (
                          <Ionicons name="checkmark" size={16} color="#059669" />
                        )}
                      </TouchableOpacity>
                      <View style={styles.checklistContent}>
                        <Text style={[styles.checklistTitle, item.completed && styles.completedTitle]}>
                          {item.title}
                        </Text>
                        <Text style={styles.checklistDescription}>{item.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Target Companies</Text>

        {/* Header info */}
        <View style={styles.headerInfo}>
          <Text style={styles.targetCount}>{myTargetCompanies.length} Target {myTargetCompanies.length === 1 ? 'Company' : 'Companies'}</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['Internship', 'Full-time', 'Contractor', 'Co-op'] as RoleType[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleTab, selectedRole === role && styles.activeRoleTab]}
                onPress={() => setSelectedRole(role)}
              >
                <Text style={[styles.roleTabText, selectedRole === role && styles.activeRoleTabText]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* My Targets Content */}
      {renderMyTargetsSection()}

      {/* Company Details Modal */}
      <Modal
        visible={selectedCompany !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedCompany && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedCompany(null)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
              <View style={styles.modalCompanyInfo}>
                <Text style={styles.modalCompanyLogo}>{selectedCompany.logo}</Text>
                <Text style={styles.modalCompanyName}>{selectedCompany.name}</Text>
              </View>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.tabBar}>
              {[
                { key: 'timeline', label: 'Timeline', icon: 'calendar-outline' },
                { key: 'events', label: 'Events', icon: 'megaphone-outline' },
                { key: 'courses', label: 'Courses', icon: 'school-outline' },
                { key: 'checklist', label: 'Checklist', icon: 'checkmark-circle-outline' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={20}
                    color={activeTab === tab.key ? COLORS.primary : '#6b7280'}
                  />
                  <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.modalContent}>
              {renderCompanyDetails()}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowAddCompanyModal(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Add Company Modal */}
      <Modal
        visible={showAddCompanyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.addCompanyModalContainer}>
          <View style={styles.addCompanyModalHeader}>
            <TouchableOpacity onPress={() => setShowAddCompanyModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.addCompanyModalTitle}>Add Target Company</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.addCompanyModalContent}>
            <DropdownSelector
              label="Select Companies"
              options={companyOptions}
              value={[]}
              onValueChange={handleAddCompany}
              placeholder="Choose companies to add"
              multiSelect={true}
              allowOther={true}
            />

            <Text style={styles.orText}>or</Text>

            <Text style={styles.customCompanyLabel}>Add Custom Company</Text>
            <TextInput
              style={styles.customCompanyInput}
              value={newCompanyName}
              onChangeText={setNewCompanyName}
              placeholder="Enter company name"
            />
            <TouchableOpacity
              style={[styles.addCustomButton, !newCompanyName.trim() && styles.disabledButton]}
              onPress={handleAddCustomCompany}
              disabled={!newCompanyName.trim()}
            >
              <Text style={[styles.addCustomButtonText, !newCompanyName.trim() && styles.disabledButtonText]}>Add Custom Company</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getEventTypeStyle = (type: string) => {
  switch (type) {
    case 'Tech Talk': return { backgroundColor: '#dbeafe' };
    case 'Workshop': return { backgroundColor: '#d1fae5' };
    case 'Networking': return { backgroundColor: '#fef3c7' };
    case 'Info Session': return { backgroundColor: '#e0e7ff' };
    default: return { backgroundColor: '#f3f4f6' };
  }
};

const getEventTypeTextStyle = (type: string) => {
  switch (type) {
    case 'Tech Talk': return { color: '#1e40af' };
    case 'Workshop': return { color: '#065f46' };
    case 'Networking': return { color: '#92400e' };
    case 'Info Session': return { color: '#3730a3' };
    default: return { color: '#374151' };
  }
};

const getLevelStyle = (level: string) => {
  switch (level) {
    case 'Beginner': return { backgroundColor: '#d1fae5' };
    case 'Intermediate': return { backgroundColor: '#fef3c7' };
    case 'Advanced': return { backgroundColor: '#fee2e2' };
    default: return { backgroundColor: '#f3f4f6' };
  }
};

const getLevelTextStyle = (level: string) => {
  switch (level) {
    case 'Beginner': return { color: '#065f46' };
    case 'Intermediate': return { color: '#92400e' };
    case 'Advanced': return { color: '#b91c1c' };
    default: return { color: '#374151' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  roleSelector: {
    marginBottom: 16,
  },
  roleTab: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeRoleTab: {
    backgroundColor: COLORS.primary,
  },
  roleTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeRoleTabText: {
    color: 'white',
  },
  headerInfo: {
    marginBottom: 16,
  },
  targetCount: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  companiesList: {
    flex: 1,
    padding: 20,
  },
  discoverContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
    lineHeight: 24,
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noResultsState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  closeButton: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalCompanyInfo: {
    alignItems: 'center',
  },
  modalCompanyLogo: {
    fontSize: 24,
    marginBottom: 4,
  },
  modalCompanyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 50,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  tabContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  roleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  timelineDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#3730a3',
    fontWeight: '500',
  },
  benefitTag: {
    backgroundColor: '#d1fae5',
  },
  benefitTagText: {
    color: '#065f46',
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  courseCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  courseProvider: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 10,
    color: '#374151',
  },
  courseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  courseButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  checklistCategory: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  checklistDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
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
  addCompanyModalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  addCompanyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  addCompanyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addCompanyModalContent: {
    padding: 20,
  },
  orText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: '500',
  },
  customCompanyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  customCompanyInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  addCustomButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addCustomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
});