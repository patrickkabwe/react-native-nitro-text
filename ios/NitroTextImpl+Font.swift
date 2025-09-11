//
//  NitroTextImpl+Font.swift
//  Pods
//
//  Font-related helpers for NitroTextImpl.
//

import UIKit

extension NitroTextImpl {
    static func fontWeightFromString(_ s: FontWeight) -> UIFont.Weight {
        switch s {
        case .ultralight:
            return .ultraLight
        case .thin:
            return .thin
        case .light:
            return .light
        case .regular:
            return .regular
        case .medium:
            return .medium
        case .semibold:
            return .semibold
        case .bold:
            return .bold
        case .heavy:
            return .heavy
        case .black:
            return .black
        default:
            return .regular
        }
    }
}

