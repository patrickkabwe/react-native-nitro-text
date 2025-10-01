import React from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";
import type { Fragment, RichTextStyle, RichTextStyleRule } from "./types";

export function normalizeWeight(
    w?: TextStyle['fontWeight']
): Fragment['fontWeight'] | undefined {
    if (!w) return undefined;

    if (typeof w === 'string' && isNaN(Number(w))) {
        return w as Fragment['fontWeight'];
    }

    const n = Number(w);

    switch (n) {
        case 100:
            return 'ultralight';
        case 200:
            return 'light';
        case 300:
            return 'thin';
        case 400:
            return 'regular';
        case 500:
            return 'medium';
        case 600:
            return 'semibold';
        case 700:
            return 'bold';
        case 800:
            return 'heavy';
        case 900:
            return 'black';
        default:
            return 'regular';
    }

}

export function styleToFragment(style: StyleProp<TextStyle> | undefined): Partial<Fragment> {
    const s = StyleSheet.flatten(style) || {};
    return {
        fontColor: s.color as string | undefined,
        fragmentBackgroundColor: s.backgroundColor as string | undefined,
        fontSize: s.fontSize,
        fontWeight: normalizeWeight(s.fontWeight),
        fontStyle: s.fontStyle,
        fontFamily: s.fontFamily,
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

// Keys used to determine whether two adjacent fragments can be merged
const MERGE_KEYS: (keyof Fragment)[] = [
    'selectionColor',
    'fontSize',
    'fontWeight',
    'fontColor',
    'fragmentBackgroundColor',
    'fontStyle',
    'fontFamily',
    'lineHeight',
    'letterSpacing',
    'textAlign',
    'textTransform',
    'textDecorationLine',
    'textDecorationColor',
    'textDecorationStyle',
];

// Pick fragment-like props from an element's props (outside of style)
function pickFragmentOverrides(props: any): Partial<Fragment> {
    if (!props || typeof props !== 'object') return {};
    const out: Partial<Fragment> = {};
    for (const k of MERGE_KEYS) {
        if (props[k] !== undefined) (out as any)[k] = props[k];
    }
    return out;
}

function canMerge(a: Partial<Fragment>, b: Partial<Fragment>): boolean {
    for (const k of MERGE_KEYS) {
        if (a[k] !== b[k]) return false;
    }
    return true;
}

function pushFragment(out: Fragment[], text: string, attrs: Partial<Fragment>) {
    if (!text) return;
    const last = out[out.length - 1];
    if (last && canMerge(last, attrs)) {
        last.text = (last.text || "") + text;
        return;
    }
    out.push({ text, ...attrs });
}

function flattenInto(
    out: Fragment[],
    children: React.ReactNode,
    parentStyle?: TextStyle,
    fragmentConfig?: ReturnType<typeof getFragmentConfig>,
    inheritedOverrides: Partial<Fragment> = {}
) {
    React.Children.forEach(children, (child) => {
        if (child == null || child === false) return;
        if (typeof child === 'string' || typeof child === 'number') {
            const base = styleToFragment(parentStyle);
            const merged: Partial<Fragment> = { ...base, ...inheritedOverrides };
            if (!fragmentConfig?.shouldApplyBackground && merged.fragmentBackgroundColor) {
                delete merged.fragmentBackgroundColor;
            }
            pushFragment(out, String(child), merged);
            return;
        }
        if (React.isValidElement(child)) {
            const { children: nested, style: childStyle, ...restProps } = child.props as any;
            const mergedStyle = [parentStyle, childStyle];
            const ownOverrides = pickFragmentOverrides(restProps);
            const mergedOverrides = { ...inheritedOverrides, ...ownOverrides };
            flattenInto(out, nested, mergedStyle as any, getFragmentConfig(childStyle), mergedOverrides);
        }
    });
}

export function flattenChildrenToFragments(
    children: React.ReactNode,
    parentStyle?: TextStyle,
    fragmentConfig?: ReturnType<typeof getFragmentConfig>
): Fragment[] {
    const out: Fragment[] = [];
    flattenInto(out, children, parentStyle, fragmentConfig, {});
    return out;
}

function styleToRichTextStyle(style: StyleProp<TextStyle> | undefined): RichTextStyle {
    const flat = StyleSheet.flatten(style) || {};
    const fragmentAttrs = styleToFragment(flat);
    return {
        ...fragmentAttrs,
        marginTop: flat.marginTop as number | undefined,
        marginBottom: flat.marginBottom as number | undefined,
        marginLeft: flat.marginLeft as number | undefined,
        marginRight: flat.marginRight as number | undefined,
    };
}

export function buildRichTextStyleRules(
    styles?: Record<string, StyleProp<TextStyle>>
): RichTextStyleRule[] | undefined {
    if (!styles) return undefined;
    const entries = Object.entries(styles);
    if (entries.length === 0) return undefined;
    const rules: RichTextStyleRule[] = [];
    for (const [selector, style] of entries) {
        const normalized = styleToRichTextStyle(style);
        rules.push({ selector, style: normalized });
    }
    return rules;
}
