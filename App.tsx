import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import HomeScreen from './screens/HomeScreen';

function ThemedApp() {
  const { colors } = useTheme();
  return (
    <>
      <StatusBar style={colors.statusBar} />
      <BookmarkProvider>
        <HomeScreen />
      </BookmarkProvider>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}
