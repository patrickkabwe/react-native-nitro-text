import React from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import type { Fragment } from "./specs/nitro-text.nitro";

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
        fontSize: s.fontSize,
        fontWeight: normalizeWeight(s.fontWeight),
        fontStyle: s.fontStyle,
        lineHeight: s.lineHeight,
        textAlign: s.textAlign as any,
        textTransform: s.textTransform as any,
    };
}

export function flattenChildrenToFragments(
    children: React.ReactNode,
    parentStyle?: TextStyle
): Fragment[] {
    const frags: Fragment[] = [];
    const push = (text: string, _?: TextStyle) => {
        if (!text) return;
        const base = styleToFragment(parentStyle);
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
            frags.push(...flattenChildrenToFragments(nested, mergedStyle as any));
        }
    });

    return frags;
}

export function createStyleFromPropsStyle(style: StyleProp<TextStyle>): {
    color: string | undefined;
    textAlign: TextStyle['textAlign'] | undefined;
    textTransform: TextStyle['textTransform'] | undefined;
} {
    const flat = StyleSheet.flatten(style) || {};
    const colorProp = flat.color as string | undefined;
    const textAlign = flat.textAlign as TextStyle['textAlign'] | undefined;
    const textTransform = flat.textTransform as TextStyle['textTransform'] | undefined;
    return { color: colorProp, textAlign, textTransform };
}
