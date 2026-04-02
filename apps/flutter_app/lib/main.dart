import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/api_config.dart';
import 'navigation/app_router.dart';
import 'providers/providers.dart';
import 'utils/storage.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AppBootstrap());
}

class AppBootstrap extends StatefulWidget {
  const AppBootstrap({super.key});

  @override
  State<AppBootstrap> createState() => _AppBootstrapState();
}

class _AppBootstrapState extends State<AppBootstrap> {
  bool _isReady = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    final overall = Stopwatch()..start();
    setState(() {
      _isReady = false;
      _error = null;
    });

    try {
      await _runStep(
        label: 'ApiConfig.preflight',
        action: _apiPreflight,
        timeout: const Duration(seconds: 3),
      );

      await _runStep(
        label: 'StorageService.init',
        action: StorageService.init,
        timeout: const Duration(seconds: 8),
      );

      debugPrint(
        '[BOOT] startup completed in ${overall.elapsedMilliseconds}ms',
      );

      if (!mounted) return;
      setState(() => _isReady = true);
    } catch (e) {
      debugPrint('[BOOT] startup failed: $e');
      if (!mounted) return;
      setState(() {
        _error = e.toString();
      });
    }
  }

  Future<void> _runStep({
    required String label,
    required Future<void> Function() action,
    required Duration timeout,
  }) async {
    final sw = Stopwatch()..start();
    debugPrint('[BOOT] $label started');

    await action().timeout(
      timeout,
      onTimeout: () {
        throw TimeoutException('$label timed out after ${timeout.inSeconds}s');
      },
    );

    debugPrint('[BOOT] $label finished in ${sw.elapsedMilliseconds}ms');
  }

  Future<void> _apiPreflight() async {
    final baseUrl = ApiConfig.getBaseUrl();
    final uri = Uri.tryParse(baseUrl);

    if (uri == null || !uri.hasScheme || !uri.hasAuthority) {
      throw FormatException('Invalid API base URL: $baseUrl');
    }

    debugPrint(
      '[BOOT] API => scheme=${uri.scheme}, host=${uri.host}, port=${uri.hasPort ? uri.port : 'default'}, path=${uri.path}',
    );

    final host = uri.host.toLowerCase();
    final isLocalHost =
        host == 'localhost' || host == '127.0.0.1' || host == '10.0.2.2';

    if (!ApiConfig.debugMode && isLocalHost) {
      debugPrint(
        '[BOOT][WARN] Release mode is using local API host ($host). Check API_URL env configuration.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isReady) {
      return const ProviderScope(child: MyApp());
    }

    if (_error != null) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        home: Scaffold(
          body: Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 12),
                  const Text(
                    'Startup failed',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _initialize,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      ),
    );
  }
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Keep notification side-effects alive without rebuilding the router itself.
    ref.watch(notificationInitializationProvider);
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      theme: _buildTheme(),
      routerConfig: router,
    );
  }

  ThemeData _buildTheme() {
    return ThemeData(
      useMaterial3: true,
      primaryColor: const Color(AppConfig.primaryColor),
      primarySwatch: const MaterialColor(
        AppConfig.primaryColor,
        <int, Color>{
          50: Color(0xFFF0F6FF),
          100: Color(0xFFE0ECFF),
          200: Color(0xFFC1D9FF),
          300: Color(0xFFA2C6FF),
          400: Color(0xFF83B3FF),
          500: Color(0xFF2563eb),
          600: Color(0xFF1E50C8),
          700: Color(0xFF1540A5),
          800: Color(0xFF0C3082),
          900: Color(0xFF032059),
        },
      ),
      fontFamily: AppConfig.fontFamily,
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          fontFamily: AppConfig.displayFontFamily,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          fontFamily: AppConfig.displayFontFamily,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          fontFamily: AppConfig.displayFontFamily,
        ),
        headlineLarge: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        titleMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        titleSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.normal,
        ),
        labelLarge: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
        ),
        labelMedium: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
        labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(
            color: Color(AppConfig.primaryColor),
            width: 2,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: Colors.black,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      scaffoldBackgroundColor: Colors.grey[50],
    );
  }
}
