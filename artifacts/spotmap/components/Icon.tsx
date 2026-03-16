import React from "react";
import { Platform } from "react-native";

export type IconName =
  | "map"
  | "map-outline"
  | "user"
  | "location"
  | "flash"
  | "trash"
  | "flame"
  | "close"
  | "tag"
  | "clock"
  | "map-pin"
  | "navigation"
  | "check-circle"
  | "alert-circle"
  | "leaf"
  | "star"
  | "star-filled"
  | "trophy"
  | "diamond"
  | "crown"
  | "check";

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

function WebIcon({ name, size = 24, color = "currentColor" }: IconProps) {
  const style = { width: size, height: size, color, flexShrink: 0 };

  switch (name) {
    case "map": {
      const { FiMap } = require("react-icons/fi");
      return <FiMap style={style} />;
    }
    case "map-outline": {
      const { FiMap } = require("react-icons/fi");
      return <FiMap style={style} />;
    }
    case "user": {
      const { FiUser } = require("react-icons/fi");
      return <FiUser style={style} />;
    }
    case "location": {
      const { FiMapPin } = require("react-icons/fi");
      return <FiMapPin style={style} />;
    }
    case "flash": {
      const { FiZap } = require("react-icons/fi");
      return <FiZap style={style} />;
    }
    case "trash": {
      const { FiTrash2 } = require("react-icons/fi");
      return <FiTrash2 style={style} />;
    }
    case "flame": {
      const { FiZap } = require("react-icons/fi");
      return <FiZap style={style} />;
    }
    case "close": {
      const { FiX } = require("react-icons/fi");
      return <FiX style={style} />;
    }
    case "tag": {
      const { FiTag } = require("react-icons/fi");
      return <FiTag style={style} />;
    }
    case "clock": {
      const { FiClock } = require("react-icons/fi");
      return <FiClock style={style} />;
    }
    case "map-pin": {
      const { FiMapPin } = require("react-icons/fi");
      return <FiMapPin style={style} />;
    }
    case "navigation": {
      const { FiNavigation } = require("react-icons/fi");
      return <FiNavigation style={style} />;
    }
    case "check-circle": {
      const { FiCheckCircle } = require("react-icons/fi");
      return <FiCheckCircle style={style} />;
    }
    case "alert-circle": {
      const { FiAlertCircle } = require("react-icons/fi");
      return <FiAlertCircle style={style} />;
    }
    case "leaf": {
      const { FiFeather } = require("react-icons/fi");
      return <FiFeather style={style} />;
    }
    case "star": {
      const { FiStar } = require("react-icons/fi");
      return <FiStar style={style} />;
    }
    case "star-filled": {
      const { IoStar } = require("react-icons/io5");
      return <IoStar style={style} />;
    }
    case "trophy": {
      const { FiAward } = require("react-icons/fi");
      return <FiAward style={style} />;
    }
    case "diamond": {
      const { IoMdDiamond } = require("react-icons/io");
      return <IoMdDiamond style={style} />;
    }
    case "crown": {
      const { GiImperialCrown } = require("react-icons/gi");
      return <GiImperialCrown style={style} />;
    }
    case "check": {
      const { FiCheck } = require("react-icons/fi");
      return <FiCheck style={style} />;
    }
    default:
      return null;
  }
}

function NativeIcon({ name, size = 24, color = "#fff" }: IconProps) {
  const { Feather, Ionicons } = require("@expo/vector-icons");

  switch (name) {
    case "map":
      return <Feather name="map" size={size} color={color} />;
    case "map-outline":
      return <Ionicons name="map-outline" size={size} color={color} />;
    case "user":
      return <Feather name="user" size={size} color={color} />;
    case "location":
      return <Ionicons name="location-outline" size={size} color={color} />;
    case "flash":
      return <Ionicons name="flash" size={size} color={color} />;
    case "trash":
      return <Feather name="trash-2" size={size} color={color} />;
    case "flame":
      return <Ionicons name="flame" size={size} color={color} />;
    case "close":
      return <Feather name="x" size={size} color={color} />;
    case "tag":
      return <Feather name="tag" size={size} color={color} />;
    case "clock":
      return <Feather name="clock" size={size} color={color} />;
    case "map-pin":
      return <Feather name="map-pin" size={size} color={color} />;
    case "navigation":
      return <Feather name="navigation" size={size} color={color} />;
    case "check-circle":
      return <Ionicons name="checkmark-circle" size={size} color={color} />;
    case "alert-circle":
      return <Feather name="alert-circle" size={size} color={color} />;
    case "leaf":
      return <Feather name="feather" size={size} color={color} />;
    case "star":
    case "star-filled":
      return <Ionicons name="star" size={size} color={color} />;
    case "trophy":
      return <Feather name="award" size={size} color={color} />;
    case "diamond":
      return <Ionicons name="diamond" size={size} color={color} />;
    case "crown":
      return <Ionicons name="trophy" size={size} color={color} />;
    case "check":
      return <Feather name="check" size={size} color={color} />;
    default:
      return null;
  }
}

export function Icon(props: IconProps) {
  if (Platform.OS === "web") {
    return <WebIcon {...props} />;
  }
  return <NativeIcon {...props} />;
}
