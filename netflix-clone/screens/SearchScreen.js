import { View, Text, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View style={{ 
        margin: horizontalScale(16),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8)
      }}>
        <View className="flex-row items-center bg-gray-800 rounded-lg"
          style={{
            padding: moderateScale(12)
          }}
        >
          <Ionicons name="search" size={moderateScale(20)} color="gray" />
          <TextInput
            className="flex-1 text-white ml-2"
            style={{
              fontSize: moderateScale(16)
            }}
            placeholder="Search movies, TV shows..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={moderateScale(20)} color="gray" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        className="px-4"
        contentContainerStyle={{
          paddingBottom: verticalScale(20)
        }}
      >
        <Text className="text-gray-400 text-center"
          style={{
            marginTop: verticalScale(16),
            fontSize: moderateScale(14)
          }}
        >
          Search for your favorite movies and TV shows
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
} 