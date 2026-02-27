import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local Storage Service
class StorageService {
  static late SharedPreferences _prefs;
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage();

  /// Initialize storage
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ── Secure storage (use for tokens & sensitive data) ──

  /// Save a value securely (Keychain on iOS, EncryptedSharedPreferences on Android)
  static Future<void> saveSecure(String key, String value) async {
    await _secureStorage.write(key: key, value: value);
  }

  /// Read a value from secure storage
  static Future<String?> getSecure(String key) async {
    return await _secureStorage.read(key: key);
  }

  /// Delete a value from secure storage
  static Future<void> removeSecure(String key) async {
    await _secureStorage.delete(key: key);
  }

  /// Clear all secure storage
  static Future<void> clearSecure() async {
    await _secureStorage.deleteAll();
  }

  // ── SharedPreferences (use for non-sensitive preferences) ──

  /// Save string
  static Future<bool> saveString(String key, String value) async {
    return await _prefs.setString(key, value);
  }

  /// Get string
  static String? getString(String key) {
    return _prefs.getString(key);
  }

  /// Save int
  static Future<bool> saveInt(String key, int value) async {
    return await _prefs.setInt(key, value);
  }

  /// Get int
  static int? getInt(String key) {
    return _prefs.getInt(key);
  }

  /// Save bool
  static Future<bool> saveBool(String key, bool value) async {
    return await _prefs.setBool(key, value);
  }

  /// Get bool
  static bool? getBool(String key) {
    return _prefs.getBool(key);
  }

  /// Save double
  static Future<bool> saveDouble(String key, double value) async {
    return await _prefs.setDouble(key, value);
  }

  /// Get double
  static double? getDouble(String key) {
    return _prefs.getDouble(key);
  }

  /// Remove key
  static Future<bool> remove(String key) async {
    return await _prefs.remove(key);
  }

  /// Clear all
  static Future<bool> clear() async {
    return await _prefs.clear();
  }

  /// Check if key exists
  static bool containsKey(String key) {
    return _prefs.containsKey(key);
  }
}
