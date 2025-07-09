// screens/HomeTab.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CartScreen from './tabs/CartScreen';
import HomeTabHome from './tabs/HomeTabHome';
import OffersScreen from './tabs/OfferScreen';
import ProfileScreen from './tabs/Profile';

const Tab = createBottomTabNavigator();

export default function Hometab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Offers') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#0071CE',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 80, // Fixed height
          paddingBottom: 8,
          paddingTop: 3,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 12,
          marginBottom: 7
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarHideOnKeyboard: true,
      })}
      initialRouteName="Home"
    >
      <Tab.Screen 
        name="Home" 
        component={HomeTabHome}
        options={{
          tabBarLabel: 'Home',
          tabBarBadge: null,
        }}
      />
      <Tab.Screen 
        name="Offers" 
        component={OffersScreen}
        options={{
          tabBarLabel: 'Offers',
          tabBarBadge: 'New',
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            marginLeft: 4,
          },
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}