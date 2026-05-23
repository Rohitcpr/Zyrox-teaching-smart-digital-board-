import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from '../src/components/home/HomeScreen';

export default function HomeRoute() {
  return (
    <>
      <StatusBar style="light" hidden />
      <HomeScreen />
    </>
  );
}
