import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieList from '../components/MovieList';
import Header from '../components/Header';
import { verticalScale } from '../utils/dimensions';

export default function HomeScreen() {
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
          <MovieList title="Trending Now" />
          <MovieList title="Popular on GoFlix" />
          <MovieList title="My List" />
          <MovieList title="New Releases" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 