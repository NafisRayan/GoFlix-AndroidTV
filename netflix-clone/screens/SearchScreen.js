import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useMemo } from 'react';
import { horizontalScale, verticalScale, moderateScale } from '../utils/dimensions';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const navigation = useNavigation();

  // Load all movies from database
  useEffect(() => {
    const loadMovies = () => {
      try {
        const data = require('../db.json');
        const movies = data.categories.reduce((acc, category) => {
          return [...acc, ...category.movies];
        }, []);
        setAllMovies(movies);
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    loadMovies();
  }, []);

  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allMovies]);

  // Handle movie selection
  const handleMoviePress = (movie) => {
    navigation.navigate('Player', {
      title: movie.title,
      videoUrl: movie.videoUrl,
      comments: movie.comments
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View style={{ 
        margin: horizontalScale(16),
        marginTop: verticalScale(8),
        marginBottom: verticalScale(25)
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
        {searchQuery.length === 0 ? (
          <Text className="text-gray-400 text-center"
            style={{
              marginTop: verticalScale(16),
              fontSize: moderateScale(14)
            }}
          >
            Search for your favorite movies and TV shows
          </Text>
        ) : filteredMovies.length === 0 ? (
          <Text className="text-gray-400 text-center"
            style={{
              marginTop: verticalScale(16),
              fontSize: moderateScale(14)
            }}
          >
            No results found for "{searchQuery}"
          </Text>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {filteredMovies.map((movie) => (
              <TouchableOpacity
                key={movie.id}
                onPress={() => handleMoviePress(movie)}
                style={{
                  width: '48%',
                  marginBottom: verticalScale(16)
                }}
              >
                <Image
                  source={{ uri: movie.imageUrl }}
                  style={{
                    width: '100%',
                    height: verticalScale(200),
                    borderRadius: moderateScale(8)
                  }}
                  className="mb-2"
                />
                <Text className="text-white"
                  style={{
                    fontSize: moderateScale(14)
                  }}
                  numberOfLines={2}
                >
                  {movie.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 