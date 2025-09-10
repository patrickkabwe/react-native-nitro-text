//
//  ColorParser.swift
//  Pods
//
//  Created by Patrick Kabwe on 9/1/2025.
//

import UIKit

enum ColorParser {
    // Public entry
    static func parse(_ input: String?) -> UIColor? {
        guard var s = input?.trimmingCharacters(in: .whitespacesAndNewlines), !s.isEmpty else {
            return nil
        }
        s = s.lowercased()

        // 1) Try decimal ARGB (existing pipeline)
        if let color = parseDecimalARGB(s) {
            return color
        }

        // 2) Try named colors
        if let color = namedColors[s] {
            return color
        }

        // 3) Try hex forms (#rgb, #rgba, #rrggbb, #rrggbbaa) or 0x...
        if let color = parseHex(s) {
            return color
        }

        // 4) Try rgb()/rgba()
        if let color = parseRGBFunction(s) {
            return color
        }

        return nil
    }

    // MARK: - Decimal ARGB (e.g. "4278190080")
    private static func parseDecimalARGB(_ s: String) -> UIColor? {
        // Only digits? Try parse as Int32
        guard s.range(of: "^[0-9]+$", options: .regularExpression) != nil else { return nil }
        if let val = Int32(s) {
            return Self.color(fromARGB: val)
        }
        // If it's bigger than Int32 but still decimal, clamp into UInt32 then reinterpret
        if let u = UInt32(s) {
            // reinterpret as Int32 bit pattern
            let i = Int32(bitPattern: u)
            return Self.color(fromARGB: i)
        }
        return nil
    }
    
    private static func color(fromARGB number: Int32) -> UIColor? {
        let a = CGFloat((number >> 24) & 0xFF) / 255.0
        let r = CGFloat((number >> 16) & 0xFF) / 255.0
        let g = CGFloat((number >> 8) & 0xFF) / 255.0
        let b = CGFloat(number & 0xFF) / 255.0
        return UIColor(red: r, green: g, blue: b, alpha: a == 0 ? 1.0 : a)
    }

    // MARK: - Named colors (extend as needed)
    private static let namedColors: [String: UIColor] = [
        "black": .black,
        "white": .white,
        "red": .red,
        "green": .green,
        "blue": .blue,
        "yellow": .yellow,
        "cyan": .cyan,
        "magenta": .magenta,
        "gray": .gray,
        "grey": .gray,
        "lightgray": .lightGray,
        "lightgrey": .lightGray,
        "darkgray": .darkGray,
        "darkgrey": .darkGray,
        "orange": .orange,
        "purple": .purple,
        "brown": .brown,
        "clear": .clear
    ]

    // MARK: - Hex parsing
    private static func parseHex(_ s: String) -> UIColor? {
        var hex = s
        if hex.hasPrefix("#") {
            hex.removeFirst()
        } else if hex.hasPrefix("0x") {
            hex.removeFirst(2)
        }

        // Expand #RGB or #RGBA into full length
        if hex.count == 3 {
            // rgb -> rrggbb
            hex = hex.map { "\($0)\($0)" }.joined()
        } else if hex.count == 4 {
            // rgba -> rrggbbaa
            hex = hex.map { "\($0)\($0)" }.joined()
        }

        switch hex.count {
        case 6:
            // rrggbb
            guard let rgb = UInt32(hex, radix: 16) else { return nil }
            let r = CGFloat((rgb >> 16) & 0xFF) / 255.0
            let g = CGFloat((rgb >> 8) & 0xFF) / 255.0
            let b = CGFloat(rgb & 0xFF) / 255.0
            return UIColor(red: r, green: g, blue: b, alpha: 1.0)
        case 8:
            // rrggbbaa (CSS common) OR aarrggbb (occasionally used)
            guard let rgba = UInt32(hex, radix: 16) else { return nil }

            // Heuristic: If the highest byte is alpha for aarrggbb, then a is often 0xFF for opaque.
            // Try to detect format by assuming if alpha byte is 0x00..0xFF either way; we prefer rrggbbaa first (web common).
            // rrggbbaa:
            let r1 = CGFloat((rgba >> 24) & 0xFF) / 255.0
            let g1 = CGFloat((rgba >> 16) & 0xFF) / 255.0
            let b1 = CGFloat((rgba >> 8) & 0xFF) / 255.0
            let a1 = CGFloat(rgba & 0xFF) / 255.0

            // aarrggbb:
            let a2 = CGFloat((rgba >> 24) & 0xFF) / 255.0
            let r2 = CGFloat((rgba >> 16) & 0xFF) / 255.0
            let g2 = CGFloat((rgba >> 8) & 0xFF) / 255.0
            let b2 = CGFloat(rgba & 0xFF) / 255.0

            if a1 == 0.0, a2 != 0.0 {
                return UIColor(red: r2, green: g2, blue: b2, alpha: a2)
            } else {
                return UIColor(red: r1, green: g1, blue: b1, alpha: a1)
            }
        default:
            return nil
        }
    }

    // MARK: - rgb()/rgba()
    private static func parseRGBFunction(_ s: String) -> UIColor? {
        // Supports:
        // rgb(r, g, b)
        // rgba(r, g, b, a)
        // r,g,b can be 0-255 or percentages (e.g., 50%)
        // a can be 0-1 or 0%-100%
        guard s.hasPrefix("rgb") else { return nil }

        // Extract content inside parentheses
        guard let open = s.firstIndex(of: "("), let close = s.lastIndex(of: ")"), open < close else { return nil }
        let inside = s[s.index(after: open)..<close]
        let parts = inside.split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
        guard parts.count == 3 || parts.count == 4 else { return nil }

        func parseComponent(_ comp: String) -> CGFloat? {
            if comp.hasSuffix("%") {
                let numString = String(comp.dropLast())
                guard let percent = Double(numString) else { return nil }
                return CGFloat(max(0.0, min(100.0, percent)) / 100.0)
            } else {
                guard let val = Double(comp) else { return nil }
                return CGFloat(max(0.0, min(255.0, val)) / 255.0)
            }
        }

        func parseAlpha(_ comp: String) -> CGFloat? {
            if comp.hasSuffix("%") {
                let numString = String(comp.dropLast())
                guard let percent = Double(numString) else { return nil }
                return CGFloat(max(0.0, min(100.0, percent)) / 100.0)
            } else {
                guard let val = Double(comp) else { return nil }
                return CGFloat(max(0.0, min(1.0, val)))
            }
        }

        guard let r = parseComponent(parts[0]),
              let g = parseComponent(parts[1]),
              let b = parseComponent(parts[2]) else { return nil }

        let a: CGFloat
        if parts.count == 4 {
            guard let alpha = parseAlpha(parts[3]) else { return nil }
            a = alpha
        } else {
            a = 1.0
        }

        return UIColor(red: r, green: g, blue: b, alpha: a)
    }
}

