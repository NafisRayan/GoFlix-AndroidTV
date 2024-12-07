import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';
import { useNavigation } from '@react-navigation/native';

export default function MovieList({ title, movies = [] }) {
  const navigation = useNavigation();

  const handleMoviePress = (movie) => {
    navigation.navigate('Player', {
      title: movie.title,
      videoUrl: movie.videoUrl
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
        {movies.map((movie) => (
          <TouchableOpacity 
            key={movie.id} 
            style={{ padding: horizontalScale(8) }}
            onPress={() => handleMoviePress(movie)}
          >
            <Image 
              source={{ uri: movie.imageUrl }}
              style={{
                width: horizontalScale(128),
                height: verticalScale(192),
              }}
              className="rounded-lg"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 