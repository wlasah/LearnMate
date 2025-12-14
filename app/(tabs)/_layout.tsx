// navigation layout for bottom tabs
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '../../components/haptic-tab';
import { useTheme } from '../../contexts/ThemeContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.headerBg,
          borderTopWidth: 1,
          borderWidth: 0.5,
          borderColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          elevation: 10,
          shadowColor: colors.border,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '800',
          
          
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/bottom-navigation/home.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain', transform: [{ scale: focused ? 1.08 : 1 }], opacity: focused ? 1 : 0.85 }} 
            />
          ),
          tabBarLabel: 'Home',
          tabBarLabelStyle: {
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ focused }) => (
            <>
              <Image 
                source={require('../../assets/images/homescreen/white circle.png')}
                style={{ width: 33, height: 33, resizeMode: 'contain', transform: [{ scale: focused ? 1.06 : 1 }], opacity: focused ? 1 : 0.85 }} 
              />
              <Image 
                source={require('../../assets/images/bottom-navigation/progress.png')}
                style={{ width: 40, height: 40, resizeMode: 'contain', position: 'absolute', transform: [{ scale: focused ? 1.06 : 1 }], opacity: focused ? 1 : 0.9 }} 
              />
            </>
          ),
          tabBarLabel: 'Progress',
          tabBarLabelStyle: {
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/bottom-navigation/study.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain', transform: [{ scale: focused ? 1.08 : 1 }], opacity: focused ? 1 : 0.85 }} 
            />
          ),
          tabBarLabel: 'Study',
          tabBarLabelStyle: {
            color: colors.text,
          },
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarButton: (props) => <HapticTab {...props} />,
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/images/bottom-navigation/account.png')}
              style={{ width: 40, height: 40, resizeMode: 'contain', transform: [{ scale: focused ? 1.08 : 1 }], opacity: focused ? 1 : 0.85 }} 
            />
          ),
          tabBarLabel: 'Account',
          tabBarLabelStyle: {
            color: colors.text,
          },
        }}
      />
    </Tabs>
  );
}