import 'package:flutter/material.dart';

// Colors
const Color primaryColor = Color(0xFF2563eb);
const Color secondaryColor = Color(0xFF34d399);
const Color accentColor = Color(0xFFf9f506);

// App theme
ThemeData getAppTheme() {
  return ThemeData(
    primaryColor: primaryColor,
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
    ),
  );
}
