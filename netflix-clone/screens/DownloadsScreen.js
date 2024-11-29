import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';

export default function DownloadsScreen() {
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
          Downloads
        </Text>
      </View>
      
      <ScrollView className="flex-1 px-4">
        <View className="items-center justify-center flex-1"
          style={{
            marginTop: verticalScale(80)
          }}
        >
          <Ionicons 
            name="download-outline" 
            size={moderateScale(80)} 
            color="gray" 
          />
          <Text className="text-white font-semibold"
            style={{
              marginTop: verticalScale(16),
              fontSize: moderateScale(18)
            }}
          >
            No downloads available
          </Text>
          <Text className="text-gray-400 text-center"
            style={{
              marginTop: verticalScale(8),
              fontSize: moderateScale(14)
            }}
          >
            Movies and TV shows that you download appear here
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 