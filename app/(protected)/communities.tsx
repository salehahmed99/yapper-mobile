import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function CommunitiesPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Communities (placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, color: 'blue' },
});
