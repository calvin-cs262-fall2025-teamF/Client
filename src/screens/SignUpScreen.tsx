import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { initializeTargetCompaniesFromSignup } from '../store/userTargetCompaniesSlice';
import { User } from '../types';
import { CompanyMatcher } from '../utils/companyMatching';
import { targetCompanies } from '../data/companiesData';
import DropdownSelector from '../components/DropdownSelector';
import { MAJORS, TARGET_ROLES, TARGET_INDUSTRIES, TARGET_LOCATIONS } from '../constants/formOptions';
import * as DocumentPicker from 'expo-document-picker';

interface PersonalInfo {
  name: string;
  linkedinProfile: string;
}

interface Education {
  university: string;
  major: string;
  graduationYear: string;
}

interface CareerPreferences {
  targetCompanies: string[];
  targetRoles: string[];
  targetIndustries: string[];
  targetLocations: string[];
}

export default function SignUpScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumeUri, setResumeUri] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    linkedinProfile: '',
  });

  const [education, setEducation] = useState<Education>({
    university: '',
    major: '',
    graduationYear: '',
  });

  const [careerPreferences, setCareerPreferences] = useState<CareerPreferences>({
    targetCompanies: [],
    targetRoles: [],
    targetIndustries: [],
    targetLocations: [],
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets[0]) {
        setResumeUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!personalInfo.name || !education.university || !education.major) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Smart company matching for selected companies
    const companyTexts = careerPreferences.targetCompanies.join(', ');
    const matchedCompanyIds = CompanyMatcher.getMatchedCompanyIds(companyTexts);
    const unmatchedCompanies = CompanyMatcher.getUnmatchedCompanies(companyTexts);

    const newUser: User = {
      id: Date.now().toString(),
      name: personalInfo.name,
      linkedinProfile: personalInfo.linkedinProfile,
      university: education.university,
      major: education.major,
      graduationYear: parseInt(education.graduationYear) || new Date().getFullYear(),
      targetCompanies: [...matchedCompanyIds, ...unmatchedCompanies],
      targetRoles: careerPreferences.targetRoles,
      targetIndustries: careerPreferences.targetIndustries,
      targetLocations: careerPreferences.targetLocations,
      resumeUri: resumeUri || undefined,
      weeklyGoal: 5,
      createdAt: new Date().toISOString(),
    };

    dispatch(setUser(newUser));

    // Initialize user target companies with matched company IDs
    if (matchedCompanyIds.length > 0) {
      dispatch(initializeTargetCompaniesFromSignup(matchedCompanyIds));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.name}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, name: text })}
              placeholder="Enter your full name"
            />
            <Text style={styles.inputLabel}>LinkedIn Profile</Text>
            <TextInput
              style={styles.input}
              value={personalInfo.linkedinProfile}
              onChangeText={(text) => setPersonalInfo({ ...personalInfo, linkedinProfile: text })}
              placeholder="linkedin.com/in/yourprofile"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Education</Text>
            <Text style={styles.inputLabel}>University *</Text>
            <TextInput
              style={styles.input}
              value={education.university}
              onChangeText={(text) => setEducation({ ...education, university: text })}
              placeholder="Enter your university"
            />
            <DropdownSelector
              label="Major"
              options={MAJORS}
              value={education.major}
              onValueChange={(value) => setEducation({ ...education, major: value as string })}
              placeholder="Select your major"
              multiSelect={false}
              allowOther={true}
              required={true}
            />
            <Text style={styles.inputLabel}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={education.graduationYear}
              onChangeText={(text) => setEducation({ ...education, graduationYear: text })}
              placeholder="2024"
              keyboardType="numeric"
            />
          </View>
        );

      case 3:
        const companyOptions = targetCompanies.map(company => company.name).concat(['Other']);

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Career Preferences</Text>

            <DropdownSelector
              label="Target Companies"
              options={companyOptions}
              value={careerPreferences.targetCompanies}
              onValueChange={(value) => setCareerPreferences({ ...careerPreferences, targetCompanies: value as string[] })}
              placeholder="Select target companies"
              multiSelect={true}
              allowOther={true}
            />

            <DropdownSelector
              label="Target Roles"
              options={TARGET_ROLES}
              value={careerPreferences.targetRoles}
              onValueChange={(value) => setCareerPreferences({ ...careerPreferences, targetRoles: value as string[] })}
              placeholder="Select target roles"
              multiSelect={true}
              allowOther={true}
            />

            <DropdownSelector
              label="Target Industries"
              options={TARGET_INDUSTRIES}
              value={careerPreferences.targetIndustries}
              onValueChange={(value) => setCareerPreferences({ ...careerPreferences, targetIndustries: value as string[] })}
              placeholder="Select target industries"
              multiSelect={true}
              allowOther={true}
            />

            <DropdownSelector
              label="Target Locations"
              options={TARGET_LOCATIONS}
              value={careerPreferences.targetLocations}
              onValueChange={(value) => setCareerPreferences({ ...careerPreferences, targetLocations: value as string[] })}
              placeholder="Select target locations"
              multiSelect={true}
              allowOther={true}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Resume Upload (Optional)</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Text style={styles.uploadButtonText}>
                {resumeUri ? 'Resume Selected ✓' : 'Upload Resume (PDF)'}
              </Text>
            </TouchableOpacity>
            {resumeUri && (
              <Text style={styles.uploadStatus}>Resume ready to upload</Text>
            )}
            <Text style={styles.note}>
              You can upload your resume now or skip this step and add it later from your profile.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Step {currentStep} of 4</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${(currentStep / 4) * 100}%` }]} />
        </View>
      </View>

      {renderStep()}

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {currentStep < 4 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Create Account</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
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
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadStatus: {
    color: '#059669',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    padding: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#3b82f6',
    fontSize: 16,
  },
});