import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PaxDemoScreen from './src/features/demo/PaxDemoScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <PaxDemoScreen />
    </SafeAreaProvider>
  );
}

export default App;
