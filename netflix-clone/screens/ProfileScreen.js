import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';

export default function ProfileScreen() {
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
          <View className="bg-gray-800 rounded-full p-8 mb-4">
            <Ionicons name="person-outline" size={moderateScale(48)} color="gray" />
          </View>
          <Text className="text-white text-xl font-semibold">Netflix User</Text>
        </View>

        <View className="px-4">
          {options.map((option, index) => (
            <TouchableOpacity 
              key={option.title}
              className="flex-row items-center py-4 border-b border-gray-800"
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