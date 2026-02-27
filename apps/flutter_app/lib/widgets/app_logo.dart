import 'package:flutter/material.dart';

/// Reusable DoctorHelp logo widget
class AppLogo extends StatelessWidget {
  final double size;
  final bool showText;

  const AppLogo({
    super.key,
    this.size = 100,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Image.asset(
          'assets/images/logo.png',
          width: size,
          height: size,
          errorBuilder: (context, error, stackTrace) {
            // Fallback to icon if image not found
            return Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(size * 0.2),
              ),
              child: Center(
                child: Icon(
                  Icons.local_hospital,
                  size: size * 0.5,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            );
          },
        ),
        if (showText) ...[
          SizedBox(height: size * 0.1),
          Text(
            'DoctorHelp',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
          ),
        ],
      ],
    );
  }
}
