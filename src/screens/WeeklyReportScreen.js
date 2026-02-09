import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getWeeklyReport } from '../services/api';
import { commonStyles, colors, spacing } from '../styles/common';

const WeeklyReportScreen = ({ route, navigation }) => {
  const { routineId } = route.params;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeeklyReport(routineId);
      setReport(data);
    } catch (err) {
      console.error('Error fetching weekly report:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReport();
    }, [routineId])
  );

  const handleReload = () => {
    fetchReport();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer} testID="loading-container">
        <ActivityIndicator size="large" color={colors.primary} testID="loading-indicator" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.centeredContainer} testID="error-container">
        <Text style={[commonStyles.text, { marginBottom: spacing.md, textAlign: 'center' }]}>
          Error loading weekly report
        </Text>
        <Text style={[commonStyles.textSecondary, { marginBottom: spacing.lg, textAlign: 'center' }]}>
          {error.response?.data?.message || error.message || 'Failed to load report'}
        </Text>
        <TouchableOpacity
          testID="reload-button"
          onPress={handleReload}
          style={commonStyles.button}
        >
          <Text style={commonStyles.buttonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={commonStyles.centeredContainer} testID="not-found-container">
        <Text style={commonStyles.textSecondary}>Report not found</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container} testID="weekly-report-screen">
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.md }}>
        {/* Week Information */}
        <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
          <Text style={commonStyles.title}>Weekly Report</Text>
          <Text style={[commonStyles.text, { marginTop: spacing.sm }]}>
            Week: {formatDate(report.weekStartDate)}
          </Text>
          {report.hasSnapshot && report.snapshotCreatedAt && (
            <Text style={[commonStyles.textSecondary, { marginTop: spacing.xs }]}>
              Snapshot created: {formatDate(report.snapshotCreatedAt)}
            </Text>
          )}
        </View>

        {/* Exercise Totals */}
        {report.exerciseTotals && report.exerciseTotals.length > 0 && (
          <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.lg }} testID="exercise-totals-section">
            <Text style={[commonStyles.subtitle, { marginBottom: spacing.md }]}>
              Exercise Totals
            </Text>
            {report.exerciseTotals.map((exercise, index) => (
              <View
                key={`${exercise.exerciseName}-${exercise.muscleGroup?.id || index}`}
                style={[commonStyles.card, { marginBottom: spacing.sm }]}
                testID={`exercise-total-${exercise.exerciseName}`}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.subtitle}>{exercise.exerciseName || 'Unknown Exercise'}</Text>
                    <Text style={commonStyles.textSecondary}>
                      {exercise.muscleGroup?.name || 'Unknown Muscle Group'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', marginLeft: spacing.md }}>
                    <Text style={[commonStyles.text, { color: colors.primary }]}>
                      {exercise.totalReps} reps
                    </Text>
                    <Text style={[commonStyles.text, { color: colors.primary }]}>
                      {exercise.totalWeight} kg
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Muscle Group Totals */}
        {report.muscleGroupTotals && report.muscleGroupTotals.length > 0 ? (
          <View style={{ marginHorizontal: spacing.md }}>
            <Text style={[commonStyles.subtitle, { marginBottom: spacing.md }]}>
              Muscle Group Totals
            </Text>
            {report.muscleGroupTotals.map((item, index) => (
              <View
                key={item.muscleGroup?.id || index}
                style={[commonStyles.card, { marginBottom: spacing.sm }]}
                testID={`muscle-group-${item.muscleGroup?.id || index}`}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.subtitle}>{item.muscleGroup?.name || 'Unknown'}</Text>
                    {item.muscleGroup?.description && (
                      <Text style={commonStyles.textSecondary}>{item.muscleGroup.description}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[commonStyles.title, { color: colors.primary }]}>
                      {item.totalSets}
                    </Text>
                    <Text style={commonStyles.textSecondary}>sets</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[commonStyles.card, { alignItems: 'center' }]} testID="empty-state">
            <Text style={[commonStyles.text, { marginBottom: spacing.sm }]}>
              No snapshot available
            </Text>
            <Text style={commonStyles.textSecondary}>
              Create a snapshot to view your weekly report
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default WeeklyReportScreen;
