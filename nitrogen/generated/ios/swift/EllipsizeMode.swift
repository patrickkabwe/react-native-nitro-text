///
/// EllipsizeMode.swift
/// Manually added to mirror generated enum bridging for NitroText.
///

/**
 * Represents the JS union `EllipsizeMode`, backed by a C++ enum.
 */
public typealias EllipsizeMode = margelo.nitro.nitrotext.EllipsizeMode

public extension EllipsizeMode {
  init?(fromString string: String) {
    switch string {
      case "head": self = .head
      case "middle": self = .middle
      case "tail": self = .tail
      case "clip": self = .clip
      default: return nil
    }
  }

  var stringValue: String {
    switch self {
      case .head: return "head"
      case .middle: return "middle"
      case .tail: return "tail"
      case .clip: return "clip"
    }
  }
}

