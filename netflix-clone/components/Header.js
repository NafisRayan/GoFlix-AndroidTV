import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const navigation = useNavigation();

  return (
    <View className="flex-row justify-between items-center px-4 py-2">
      <Text className="text-red-600 text-3xl font-bold">NETFLIX</Text>
      <View className="flex-row space-x-4">
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
} 