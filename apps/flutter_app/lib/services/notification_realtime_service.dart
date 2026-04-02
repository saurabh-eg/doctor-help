import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import 'api_service.dart';

typedef NotificationRealtimeEventHandler = void Function(
  String event,
  Map<String, dynamic>? data,
);

class NotificationRealtimeService {
  final ApiService _apiService;

  NotificationRealtimeService(this._apiService);

  static const Duration _reconnectDelay = Duration(seconds: 3);

  http.Client? _client;
  StreamSubscription<String>? _lineSubscription;
  Timer? _reconnectTimer;
  NotificationRealtimeEventHandler? _onEvent;
  bool _running = false;

  void start({required NotificationRealtimeEventHandler onEvent}) {
    _onEvent = onEvent;
    if (_running) return;

    _running = true;
    _connect();
  }

  void stop() {
    _running = false;
    _cleanupConnection();
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _onEvent = null;
  }

  void _scheduleReconnect() {
    if (!_running) return;

    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(_reconnectDelay, _connect);
  }

  Future<void> _connect() async {
    if (!_running) return;

    _cleanupConnection();

    final token = _apiService.getToken();
    if (token == null || token.isEmpty) {
      _scheduleReconnect();
      return;
    }

    try {
      final uri = Uri.parse(
        '${ApiConfig.getBaseUrl()}${ApiEndpoints.notificationsStream}?token=${Uri.encodeQueryComponent(token)}',
      );

      final request = http.Request('GET', uri)
        ..headers['Accept'] = 'text/event-stream'
        ..headers['Cache-Control'] = 'no-cache'
        ..headers['Authorization'] = 'Bearer $token';

      _client = http.Client();
      final response = await _client!.send(request);

      if (response.statusCode != 200) {
        _scheduleReconnect();
        return;
      }

      String? currentEvent;
      final dataBuffer = StringBuffer();

      _lineSubscription = response.stream
          .transform(utf8.decoder)
          .transform(const LineSplitter())
          .listen(
        (line) {
          if (line.startsWith('event:')) {
            currentEvent = line.substring('event:'.length).trim();
            return;
          }

          if (line.startsWith('data:')) {
            final payloadChunk = line.substring('data:'.length).trimLeft();
            dataBuffer.writeln(payloadChunk);
            return;
          }

          if (line.isEmpty) {
            final eventName = currentEvent ?? 'message';
            final rawData = dataBuffer.toString().trim();

            Map<String, dynamic>? data;
            if (rawData.isNotEmpty) {
              try {
                final decoded = jsonDecode(rawData);
                if (decoded is Map<String, dynamic>) {
                  data = decoded;
                }
              } catch (_) {
                // Ignore malformed event payloads and continue the stream.
              }
            }

            // Only call _onEvent if we're still running and handler is set
            if (_running && _onEvent != null) {
              _onEvent!.call(eventName, data);
            }

            currentEvent = null;
            dataBuffer.clear();
          }
        },
        onError: (_) {
          _scheduleReconnect();
        },
        onDone: () {
          _scheduleReconnect();
        },
        cancelOnError: true,
      );
    } catch (_) {
      _scheduleReconnect();
    }
  }

  void _cleanupConnection() {
    _lineSubscription?.cancel();
    _lineSubscription = null;

    _client?.close();
    _client = null;
  }
}
