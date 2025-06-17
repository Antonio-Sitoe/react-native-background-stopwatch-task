import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Clock, TrendingUp } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';

export default function HistoryScreen() {
  const { sessions, formatTime, getWeeklyTotal, getAverageSession } = useTimerStore();

  const weeklyTotal = getWeeklyTotal();
  const averageSession = getAverageSession();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Timer History</Text>
          <Text style={styles.subtitle}>Track your service sessions</Text>
        </View>

        <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
          {sessions.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color="#C6C6C8" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptySubtitle}>Start your first timer to see history here</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Clock size={24} color="#007AFF" strokeWidth={2} />
                </View>
                <View style={styles.historyDetails}>
                  <Text style={styles.historyDuration}>{formatTime(session.duration)}</Text>
                  <Text style={styles.historyDate}>{session.date}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  session.type === 'Completed' ? styles.completedBadge : styles.stoppedBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    session.type === 'Completed' ? styles.completedText : styles.stoppedText
                  ]}>
                    {session.type}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {sessions.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TrendingUp size={24} color="#34C759" strokeWidth={2} />
              <Text style={styles.statValue}>{formatTime(weeklyTotal)}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={24} color="#007AFF" strokeWidth={2} />
              <Text style={styles.statValue}>{formatTime(averageSession)}</Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  historyList: {
    flex: 1,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C6C6C8',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyDuration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#E8F5E8',
  },
  stoppedBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    color: '#34C759',
  },
  stoppedText: {
    color: '#FF9500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
});