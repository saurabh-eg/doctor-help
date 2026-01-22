import 'package:flutter/material.dart';
import '../config/constants.dart';

/// App Button Widget
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isDisabled;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double height;
  final EdgeInsets padding;
  final BorderRadius? borderRadius;
  final Widget? icon;
  final bool isSecondary;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.isDisabled = false,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height = 56,
    this.padding =
        const EdgeInsets.symmetric(horizontal: UIConstants.spacingLarge),
    this.borderRadius,
    this.icon,
    this.isSecondary = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SizedBox(
      width: width ?? double.infinity,
      height: height,
      child: ElevatedButton(
        onPressed: isDisabled || isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: isSecondary
              ? Colors.transparent
              : (backgroundColor ?? theme.primaryColor),
          foregroundColor:
              isSecondary ? theme.primaryColor : (textColor ?? Colors.white),
          disabledBackgroundColor: Colors.grey[300],
          padding: padding,
          shape: RoundedRectangleBorder(
            borderRadius:
                borderRadius ?? BorderRadius.circular(UIConstants.radiusLarge),
            side: isSecondary
                ? BorderSide(color: theme.primaryColor, width: 2)
                : BorderSide.none,
          ),
          elevation: 0,
        ),
        child: isLoading
            ? const SizedBox(
                height: 24,
                width: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[
                    icon!,
                    const SizedBox(width: UIConstants.spacingSmall),
                  ],
                  Text(
                    label,
                    style: theme.textTheme.labelLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: isSecondary ? theme.primaryColor : Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
