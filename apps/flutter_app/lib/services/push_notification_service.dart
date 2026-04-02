import 'dart:async';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import 'notification_service.dart';

class PushNotificationService {
  PushNotificationService(this._notificationService);

  final NotificationService _notificationService;
  StreamSubscription<String>? _tokenRefreshSub;
  String? _currentToken;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    try {
      await Firebase.initializeApp();
      final messaging = FirebaseMessaging.instance;

      await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      final token = await messaging.getToken();
      if (token != null && token.isNotEmpty) {
        _currentToken = token;
        await _registerToken(token);
      }

      _tokenRefreshSub = messaging.onTokenRefresh.listen((token) async {
        _currentToken = token;
        await _registerToken(token);
      });

      FirebaseMessaging.onMessage.listen((message) {
        debugPrint(
          'Push foreground message received: ${message.notification?.title}',
        );
      });

      _initialized = true;
    } catch (e) {
      // App may run without Firebase config in local/dev environments.
      debugPrint('Push notifications not initialized: $e');
      _initialized = false;
    }
  }

  Future<void> dispose() async {
    await _tokenRefreshSub?.cancel();
    _tokenRefreshSub = null;
  }

  Future<void> unregisterCurrentDevice() async {
    final token = _currentToken;
    if (token == null || token.isEmpty) return;

    await _notificationService.unregisterPushDevice(token: token);
  }

  Future<void> _registerToken(String token) async {
    final platform = _resolvePlatform();
    await _notificationService.registerPushDevice(
      token: token,
      platform: platform,
    );
  }

  String _resolvePlatform() {
    if (kIsWeb) return 'web';
    if (Platform.isAndroid) return 'android';
    if (Platform.isIOS) return 'ios';
    return 'unknown';
  }
}
