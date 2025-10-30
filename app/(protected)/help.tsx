import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HelpPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Help (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: 'blue' },
});
