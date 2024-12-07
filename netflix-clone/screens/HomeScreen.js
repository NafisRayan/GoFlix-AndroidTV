import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import MovieList from '../components/MovieList';
import Header from '../components/Header';
import { verticalScale } from '../utils/dimensions';

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll import the JSON directly
    const fetchData = async () => {
      try {
        const data = require('../db.json');
        setCategories(data.categories);
      } catch (error) {
        console.error('Error loading movies:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: verticalScale(20)
        }}
      >
        <Header />
        <View style={{ gap: verticalScale(20) }}>
          {categories.map((category) => (
            <MovieList 
              key={category.id}
              title={category.title}
              movies={category.movies}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 