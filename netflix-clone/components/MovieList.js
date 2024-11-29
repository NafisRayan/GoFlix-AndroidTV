import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';
import { useNavigation } from '@react-navigation/native';

export default function MovieList({ title }) {
  const navigation = useNavigation();

  const handleMoviePress = (movie) => {
    navigation.navigate('Player', {
      title: 'Sample Movie',
      videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' // Example video URL
    });
  };

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
          <TouchableOpacity 
            key={item} 
            style={{ padding: horizontalScale(8) }}
            onPress={() => handleMoviePress(item)}
          >
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