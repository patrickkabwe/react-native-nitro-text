import React from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import type { Fragment } from "./types";

export function normalizeWeight(
    w?: TextStyle['fontWeight']
): Fragment['fontWeight'] | undefined {
    if (!w) return undefined;
    if (typeof w === "string") return w as any;
    const n = Number(w);
    return n >= 100 && n <= 900 && n % 100 === 0 ? (String(n) as any) : undefined;
}

export function styleToFragment(style: StyleProp<TextStyle> | undefined): Partial<Fragment> {
    const s = StyleSheet.flatten(style) || {};
    return {
        fontColor: s.color as string | undefined,
        fragmentBackgroundColor: s.backgroundColor as string | undefined,
        fontSize: s.fontSize,
        fontWeight: normalizeWeight(s.fontWeight),
        fontStyle: s.fontStyle,
        fontFamily: s.fontFamily as string | undefined,
        lineHeight: s.lineHeight,
        letterSpacing: s.letterSpacing,
        textAlign: s.textAlign,
        textTransform: s.textTransform,
        textDecorationLine: s.textDecorationLine,
        textDecorationColor: s.textDecorationColor as string | undefined,
        textDecorationStyle: s.textDecorationStyle,
    };
}


function getFragmentConfig(style: TextStyle): {
    shouldApplyBackground: boolean;
    shouldApplyBorder: boolean;
} {
    const flat = StyleSheet.flatten(style) || {};
    const hasBackground = !!flat.backgroundColor;
    const hasBorder = !!flat.borderColor || !!flat.borderWidth;
    return {
        shouldApplyBackground: hasBackground,
        shouldApplyBorder: hasBorder,
    };
}

export function flattenChildrenToFragments(
    children: React.ReactNode,
    parentStyle?: TextStyle,
    fragmentConfig?: ReturnType<typeof getFragmentConfig>
): Fragment[] {
    const frags: Fragment[] = [];
    const push = (text: string, style?: TextStyle) => {
        if (!text) return;
        const base = styleToFragment(style);
        if (!fragmentConfig?.shouldApplyBackground && base.fragmentBackgroundColor) {
            delete base.fragmentBackgroundColor;
        }
        frags.push({ text, ...base } as Fragment);
    };

    React.Children.forEach(children, (child) => {
        if (child == null || child === false) return;
        if (typeof child === 'string' || typeof child === 'number') {
            push(String(child), parentStyle);
            return;
        }
        if (React.isValidElement(child)) {
            const { children: nested, style: childStyle } = child.props as any;
            const mergedStyle = [parentStyle, childStyle];

            frags.push(
                ...flattenChildrenToFragments(
                    nested,
                    mergedStyle as any,
                    getFragmentConfig(childStyle)
                )
            );
        }
    });

    return frags;
}


type StyleFromPropsStyle = {
    color: string | undefined;
    textAlign: TextStyle['textAlign'] | undefined;
    textTransform: TextStyle['textTransform'] | undefined;
    textDecorationLine: TextStyle['textDecorationLine'] | undefined;
    textDecorationColor: string | undefined;
    textDecorationStyle: TextStyle['textDecorationStyle'] | undefined;
}
