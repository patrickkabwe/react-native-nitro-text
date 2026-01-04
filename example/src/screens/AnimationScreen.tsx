import React, { useCallback, useEffect } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NitroText } from 'react-native-nitro-text';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedNitroText = Animated.createAnimatedComponent(NitroText);
const TYPE_MESSAGE =
  'NitroText animates text on the UI thread with animatedProps for smooth, high-frequency updates.';
const TYPE_FONT_SIZE = 16;
const TYPE_LINE_HEIGHT = 24;

export function AnimationScreen() {
  const typeProgress = useSharedValue(0);

  useEffect(() => {
    typeProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3400, easing: Easing.linear }),
        withDelay(
          600,
          withTiming(0, { duration: 2400, easing: Easing.linear }),
        ),
      ),
      -1,
      false,
    );
  }, [typeProgress]);

  const blockJsThread = useCallback(() => {
    const start = Date.now();
    while (Date.now() - start < 20000) {}
  }, []);

  const typedText = useDerivedValue(() => {
    const visible = Math.floor(typeProgress.value * (TYPE_MESSAGE.length + 1));
    const base = TYPE_MESSAGE.slice(0, visible);
    return base;
  });

  const typeProps = useAnimatedProps(() => ({ text: typedText.value }) as any);

  const typeStyle = useAnimatedStyle(() => {
    return {
      opacity: typeProgress.value,
    };
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <NitroText style={styles.headerTitle}>NitroText Animations</NitroText>
        <NitroText style={styles.headerSubtitle}>
          Powered by react-native-reanimated
        </NitroText>
      </View>

      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>JS Thread Block Test</NitroText>
        <NitroText style={styles.sectionDescription}>
          Tap the button to block JS for 20s. The call counter should keep
          ticking if it is running on the UI thread.
        </NitroText>
        <Pressable
          onPress={blockJsThread}
          style={({ pressed }) => [
            styles.blockButton,
            pressed && styles.blockButtonPressed,
          ]}
        >
          <NitroText style={styles.blockButtonText}>Block JS Thread</NitroText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Animated Typewriter</NitroText>
        <NitroText style={styles.sectionDescription}>
          Text updates via animatedProps without JS-driven re-renders
        </NitroText>

        <View style={styles.typeRow}>
          <AnimatedNitroText
            animatedProps={typeProps}
            style={[styles.counterText, typeStyle]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 16,
  },
  counterContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterText: {
    fontSize: TYPE_FONT_SIZE,
    fontWeight: '800',
    lineHeight: TYPE_LINE_HEIGHT,
    color: '#1a202c',
    textAlign: 'left',
    letterSpacing: 0,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    includeFontPadding: false,
  },
  typeRow: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  blockButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  blockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

