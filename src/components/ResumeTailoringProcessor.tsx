import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResumeTailoringProcessorProps {
  visible: boolean;
  onComplete: () => void;
  companyName: string;
  positionTitle: string;
}

export default function ResumeTailoringProcessor({
  visible,
  onComplete,
  companyName,
  positionTitle,
}: ResumeTailoringProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const steps = [
    'Analyzing job description...',
    'Matching skills and keywords...',
    'Optimizing resume content...',
    'Finalizing tailored resume...',
  ];

  useEffect(() => {
    if (visible) {
      // Reset animations
      setProgress(0);
      setCurrentStep(0);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Progress simulation
      const totalTime = 3000; // 3 seconds
      const stepTime = totalTime / steps.length;

      let currentProgress = 0;
      let stepIndex = 0;

      const progressInterval = setInterval(() => {
        currentProgress += 1;
        setProgress(currentProgress);

        // Update step every 25% progress
        const newStepIndex = Math.floor((currentProgress / 100) * steps.length);
        if (newStepIndex !== stepIndex && newStepIndex < steps.length) {
          stepIndex = newStepIndex;
          setCurrentStep(stepIndex);
        }

        if (currentProgress >= 100) {
          clearInterval(progressInterval);

          // Small delay before completion
          setTimeout(() => {
            // Exit animation
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
              }),
            ]).start(() => {
              onComplete();
            });
          }, 500);
        }
      }, totalTime / 100);

      return () => {
        clearInterval(progressInterval);
      };
    }
  }, [visible, onComplete, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.title}>Tailoring Resume</Text>
            <Text style={styles.subtitle}>
              Customizing for {positionTitle} at {companyName}
            </Text>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>

            {/* Current Step */}
            <View style={styles.stepContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.stepText}>
                {steps[currentStep] || 'Processing...'}
              </Text>
            </View>
          </View>

          {/* Steps Indicator */}
          <View style={styles.stepsIndicator}>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepIndicatorContainer}>
                <View
                  style={[
                    styles.stepIndicator,
                    {
                      backgroundColor: index <= currentStep ? '#3b82f6' : '#e5e7eb',
                    },
                  ]}
                >
                  {index < currentStep ? (
                    <Ionicons name="checkmark" size={12} color="white" />
                  ) : index === currentStep ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: index <= currentStep ? '#374151' : '#9ca3af',
                    },
                  ]}
                >
                  {step.replace('...', '')}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  stepsIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
});