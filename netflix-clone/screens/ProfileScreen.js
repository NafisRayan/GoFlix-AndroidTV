import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleOptionPress = (option) => {
    switch (option.title) {
      case 'Downloads':
        navigation.navigate('Downloads');
        break;
      case 'My List':
        // TODO: Implement My List screen navigation
        Alert.alert('Coming Soon', 'My List feature is coming soon!');
        break;
      case 'App Settings':
        // TODO: Implement Settings screen navigation
        Alert.alert('Coming Soon', 'Settings feature is coming soon!');
        break;
      case 'Help':
        // TODO: Implement Help screen navigation
        Alert.alert('Coming Soon', 'Help feature is coming soon!');
        break;
      case 'Sign Out':
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
              onPress: () => {
                // TODO: Implement actual sign out logic here
                Alert.alert('Signed Out', 'You have been signed out successfully');
                // navigation.navigate('Auth'); // Navigate to auth screen when implemented
              },
            },
          ],
          { cancelable: true }
        );
        break;
      default:
        if (option.badge) {
          Alert.alert('Notifications', `You have ${option.badge} new notifications`);
        }
    }
  };

  const options = [
    { icon: 'notifications-outline', title: 'Notifications', badge: '2' },
    { icon: 'download-outline', title: 'Downloads', route: 'Downloads' },
    { icon: 'list-outline', title: 'My List' },
    { icon: 'settings-outline', title: 'App Settings' },
    { icon: 'help-circle-outline', title: 'Help' },
    { icon: 'log-out-outline', title: 'Sign Out' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View style={{
        padding: horizontalScale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(8)
      }}>
        <Text className="text-white font-bold"
          style={{
            fontSize: moderateScale(24)
          }}
        >
          Profile
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <TouchableOpacity 
            className="bg-gray-800 rounded-full p-8 mb-4"
            onPress={() => Alert.alert('Profile Picture', 'Profile picture update coming soon!')}
          >
            <Ionicons name="person-outline" size={moderateScale(48)} color="gray" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-semibold">GoFlix User</Text>
        </View>

        <View className="px-4">
          {options.map((option, index) => (
            <TouchableOpacity 
              key={option.title}
              className="flex-row items-center py-4 border-b border-gray-800"
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={option.icon} 
                size={moderateScale(24)} 
                color="gray" 
              />
              <Text className="text-white text-lg ml-4 flex-1">
                {option.title}
              </Text>
              {option.badge && (
                <View className="bg-red-600 rounded-full px-2 py-1">
                  <Text className="text-white text-sm">{option.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={moderateScale(20)} color="gray" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 