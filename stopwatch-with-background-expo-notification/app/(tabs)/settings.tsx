import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Bell, Smartphone, Database, Info, ChevronRight } from 'lucide-react-native';
import { useTimerStore } from '@/stores/timerStore';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    backgroundMode,
    persistData,
    setNotificationsEnabled,
    setBackgroundMode,
    setPersistData,
  } = useTimerStore();

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        {
          icon: <Bell size={24} color="#007AFF" strokeWidth={2} />,
          title: 'Push Notifications',
          subtitle: 'Show timer status in notification bar',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Timer Settings',
      items: [
        {
          icon: <Smartphone size={24} color="#34C759" strokeWidth={2} />,
          title: 'Background Mode',
          subtitle: 'Continue timer when app is minimized',
          type: 'toggle',
          value: backgroundMode,
          onToggle: setBackgroundMode,
        },
        {
          icon: <Database size={24} color="#FF9500" strokeWidth={2} />,
          title: 'Persist Data',
          subtitle: 'Save timer state across app restarts',
          type: 'toggle',
          value: persistData,
          onToggle: setPersistData,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Info size={24} color="#8E8E93" strokeWidth={2} />,
          title: 'App Information',
          subtitle: 'Version 1.0.0',
          type: 'navigation',
          onPress: () => console.log('Show app info'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any, index: number) => {
    if (item.type === 'toggle') {
      return (
        <View key={index} style={styles.settingItem}>
          <View style={styles.settingIcon}>
            {item.icon}
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#C6C6C8', true: '#34C759' }}
            thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity key={index} style={styles.settingItem} onPress={item.onPress}>
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <ChevronRight size={20} color="#C6C6C8" strokeWidth={2} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your timer preferences</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {settingsGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.settingGroup}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <View style={styles.groupContainer}>
                {group.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
              </View>
            </View>
          ))}

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              Service Timer helps you track work sessions with background notifications
              and persistent storage across device restarts.
            </Text>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  settingGroup: {
    marginBottom: 32,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  footerInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    textAlign: 'center',
  },
});