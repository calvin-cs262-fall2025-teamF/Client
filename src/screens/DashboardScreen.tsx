import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { targetCompanies } from '../data/companiesData';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

export default function DashboardScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { applications, weeklyGoal } = useSelector((state: RootState) => state.applications);
  const { targetCompanies: userTargetCompanies } = useSelector((state: RootState) => state.userTargetCompanies);

  const currentWeekStart = startOfWeek(new Date());
  const currentWeekEnd = endOfWeek(new Date());

  const weeklyApplications = applications.filter(app => {
    const appDate = parseISO(app.appliedDate);
    return isWithinInterval(appDate, { start: currentWeekStart, end: currentWeekEnd });
  });

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'Applied').length,
    interviews: applications.filter(app => app.status === 'Interview').length,
    weeklyProgress: weeklyApplications.length,
    weeklyGoal,
    trendingUp: weeklyApplications.length > weeklyGoal * 0.7, // Simple trending logic
  };

  const progressPercentage = Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear any stored user data
              if (currentUser) {
                await AsyncStorage.removeItem(`user_${currentUser.name.toLowerCase()}`);
              }
              // Dispatch logout action
              dispatch(logout());
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Get user's target companies data
  const userTargetCompanyIds = userTargetCompanies.map(tc => tc.companyId);
  const myTargetCompaniesData = targetCompanies.filter(company =>
    userTargetCompanyIds.includes(company.id)
  );

  // Calculate target company application stats
  const targetCompanyApplications = applications.filter(app =>
    myTargetCompaniesData.some(company =>
      company.name.toLowerCase() === app.company.toLowerCase()
    )
  );

  const StatCard = ({ title, value, subtitle, icon, color, trendingUp }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        {trendingUp !== undefined && (
          <Ionicons
            name={trendingUp ? 'trending-up' : 'trending-down'}
            size={16}
            color={trendingUp ? '#059669' : '#dc2626'}
          />
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back, {currentUser?.name}!</Text>
            <Text style={styles.subtitle}>Here's your job search progress</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#6b7280" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          icon="briefcase-outline"
          color="#3b82f6"
          trendingUp={stats.trendingUp}
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications}
          subtitle="Awaiting response"
          icon="time-outline"
          color="#f59e0b"
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          subtitle="In progress"
          icon="people-outline"
          color="#059669"
        />
        <View style={[styles.statCard, styles.progressCard, { borderLeftColor: '#8b5cf6' }]}>
          <View style={styles.statHeader}>
            <Ionicons name="analytics-outline" size={24} color="#8b5cf6" />
            <Text style={styles.progressText}>
              {stats.weeklyProgress}/{stats.weeklyGoal}
            </Text>
          </View>
          <Text style={styles.statTitle}>Weekly Goal Progress</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}% complete</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('JobTracker')}
        >
          <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
          <Text style={styles.actionButtonText}>Add New Application</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Targets')}
        >
          <Ionicons name="business-outline" size={24} color="#059669" />
          <Text style={styles.actionButtonText}>Explore Target Companies</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Target Companies Widget */}
      {myTargetCompaniesData.length > 0 && (
        <View style={styles.targetCompaniesSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>My Target Companies</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Targets')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.targetCompaniesScroll}>
            {myTargetCompaniesData.slice(0, 5).map((company) => {
              const companyApplications = targetCompanyApplications.filter(app =>
                company.name.toLowerCase() === app.company.toLowerCase()
              );
              return (
                <TouchableOpacity
                  key={company.id}
                  style={styles.targetCompanyCard}
                  onPress={() => navigation.navigate('Targets')}
                >
                  <Text style={styles.targetCompanyLogo}>{company.logo}</Text>
                  <Text style={styles.targetCompanyName}>{company.name}</Text>
                  <View style={styles.targetCompanyStats}>
                    <Text style={styles.targetCompanyStatsText}>
                      {companyApplications.length} application{companyApplications.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={styles.addTargetCard}
              onPress={() => navigation.navigate('Targets')}
            >
              <Ionicons name="add" size={24} color="#6b7280" />
              <Text style={styles.addTargetText}>Discover More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {applications.length > 0 && (
        <View style={styles.recentApplications}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          {applications.slice(0, 3).map((app) => (
            <View key={app.id} style={styles.applicationItem}>
              <View style={[styles.companyAvatar, { backgroundColor: getAvatarColor(app.company) }]}>
                <Text style={styles.avatarText}>{app.company.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.applicationInfo}>
                <Text style={styles.companyName}>{app.company}</Text>
                <Text style={styles.roleName}>{app.role}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusStyle(app.status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(app.status)]}>
                  {app.status}
                </Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('JobTracker')}
          >
            <Text style={styles.viewAllText}>View All Applications</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const getAvatarColor = (company: string) => {
  const colors = ['#3b82f6', '#059669', '#f59e0b', '#8b5cf6', '#dc2626', '#06b6d4'];
  const index = company.length % colors.length;
  return colors[index];
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Applied':
      return { backgroundColor: '#dbeafe' };
    case 'Interview':
      return { backgroundColor: '#d1fae5' };
    case 'Offer':
      return { backgroundColor: '#fef3c7' };
    case 'Rejected':
      return { backgroundColor: '#fee2e2' };
    default:
      return { backgroundColor: '#f3f4f6' };
  }
};

const getStatusTextStyle = (status: string) => {
  switch (status) {
    case 'Applied':
      return { color: '#1e40af' };
    case 'Interview':
      return { color: '#065f46' };
    case 'Offer':
      return { color: '#92400e' };
    case 'Rejected':
      return { color: '#b91c1c' };
    default:
      return { color: '#374151' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  signOutText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsGrid: {
    padding: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressCard: {
    paddingBottom: 24,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  targetCompaniesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  targetCompaniesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  targetCompanyCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  targetCompanyLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  targetCompanyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  targetCompanyStats: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  targetCompanyStatsText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  addTargetCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addTargetText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  recentApplications: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  applicationItem: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  companyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  applicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roleName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
});