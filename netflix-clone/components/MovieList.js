import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';

export default function MovieList({ title }) {
  return (
    <View style={{ marginTop: verticalScale(16) }}>
      <Text className="text-white font-bold px-4 mb-2"
        style={{
          fontSize: moderateScale(18)
        }}
      >
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity key={item} style={{ padding: horizontalScale(8) }}>
            <View style={{
              width: horizontalScale(128),
              height: verticalScale(192),
            }} className="bg-gray-800 rounded-lg" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 