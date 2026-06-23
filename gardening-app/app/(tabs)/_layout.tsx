import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Garden',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'clock.fill', android: 'history', web: 'history' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
