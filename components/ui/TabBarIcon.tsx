import { StyleSheet, View } from 'react-native';

import { theme } from '@/lib/theme';

export type TabBarIconName = 'list' | 'calendar' | 'person';

interface TabBarIconProps {
  color: string;
  name: TabBarIconName;
  size?: number;
}

export function TabBarIcon({ color, name, size = 22 }: TabBarIconProps) {
  if (name === 'list') {
    return (
      <View style={[styles.iconBox, { height: size, width: size }]}>
        <View style={[styles.listLine, { backgroundColor: color }]} />
        <View style={[styles.listLine, { backgroundColor: color }]} />
        <View style={[styles.listLine, { backgroundColor: color, width: '70%' }]} />
      </View>
    );
  }

  if (name === 'calendar') {
    const daySize = Math.max(3, Math.round(size * 0.18));
    return (
      <View style={[styles.calendar, { borderColor: color, height: size, width: size }]}>
        <View style={[styles.calendarHeader, { backgroundColor: color }]} />
        <View style={styles.calendarGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View
              key={index}
              style={[styles.calendarDay, { backgroundColor: color, height: daySize, width: daySize }]}
            />
          ))}
        </View>
      </View>
    );
  }

  const headSize = Math.round(size * 0.38);
  return (
    <View style={[styles.iconBox, { height: size, width: size }]}>
      <View
        style={[
          styles.personHead,
          { backgroundColor: color, borderRadius: headSize / 2, height: headSize, width: headSize },
        ]}
      />
      <View style={[styles.personBody, { backgroundColor: color, width: size * 0.72 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLine: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    height: 2,
    marginVertical: 2,
    width: '100%',
  },
  calendar: {
    borderRadius: 4,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  calendarHeader: {
    height: '28%',
    width: '100%',
  },
  calendarGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    padding: 3,
  },
  calendarDay: {
    borderRadius: 1,
    opacity: 0.85,
  },
  personHead: {
    marginBottom: 2,
  },
  personBody: {
    borderTopLeftRadius: theme.radius.full,
    borderTopRightRadius: theme.radius.full,
    height: '42%',
  },
});
