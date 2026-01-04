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
import { styles } from './styles';

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
    return `${base}|`;
  });

  const typeProps = useAnimatedProps(() => ({ text: typedText.value }) as any);

  const typeStyle = useAnimatedStyle(() => {
    return {
      opacity: typeProgress.value,
    };
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.section}>
        <NitroText style={styles.mainTitle}>🎬 NitroText Animations</NitroText>
        <NitroText style={styles.subtitle}>
          Powered by react-native-reanimated
        </NitroText>
      </View>

      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>JS Thread Block Test</NitroText>
        <NitroText style={styles.description}>
          Tap the button to block JS for 20s. The call counter should keep
          ticking if it is running on the UI thread.
        </NitroText>
        <Pressable
          onPress={blockJsThread}
          style={({ pressed }) => [
            localStyles.blockButton,
            pressed && localStyles.blockButtonPressed,
          ]}
        >
          <NitroText style={localStyles.blockButtonText}>Block JS Thread</NitroText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Animated Typewriter</NitroText>
        <NitroText style={styles.description}>
          Text updates via animatedProps without JS-driven re-renders
        </NitroText>

        <View style={localStyles.typeRow}>
          <AnimatedNitroText
            animatedProps={typeProps}
            style={[localStyles.counterText, typeStyle]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
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

