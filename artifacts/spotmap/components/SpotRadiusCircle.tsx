import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Circle } from "react-native-maps";

import { Colors } from "@/constants/colors";

interface SpotRadiusCircleProps {
  latitude: number;
  longitude: number;
  radius: number;
  color?: string;
}

export function SpotRadiusCircle({
  latitude,
  longitude,
  radius,
  color = Colors.primary,
}: SpotRadiusCircleProps) {
  return (
    <Circle
      center={{ latitude, longitude }}
      radius={radius}
      fillColor={`${color}18`}
      strokeColor={`${color}60`}
      strokeWidth={1.5}
    />
  );
}
