import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AutoLicenseService {
  final _supabase = Supabase.instance.client;

  Future<String> getDeviceId() async {
    final deviceInfo = DeviceInfoPlugin();
    if (Platform.isWindows) {
      final windowsInfo = await deviceInfo.windowsInfo;
      return windowsInfo.deviceId;
    } else if (Platform.isAndroid) {
      final androidInfo = await deviceInfo.androidInfo;
      return androidInfo.id;
    }
    return 'unknown_device';
  }

  Future<Map<String, dynamic>> checkOrRegisterDevice() async {
    final deviceId = await getDeviceId();
    final isWindows = Platform.isWindows;
    final column = isWindows ? 'device_pc_id' : 'device_mobile_id';

    // 1. البحث عن الجهاز في قاعدة البيانات
    var response = await _supabase
        .from('gym_subscriptions')
        .select()
        .eq(column, deviceId)
        .maybeSingle();

    // 2. إذا كان الجهاز جديداً، يتم تجهيز البيانات وإنشاؤه في Supabase
    if (response == null) {
      final Map<String, dynamic> insertData = {
        column: deviceId,
        'status': 'demo',
        'demo_started_at': DateTime.now().toIso8601String(),
      };

      response = await _supabase
          .from('gym_subscriptions')
          .insert(insertData)
          .select()
          .single();
    }

    // 3. التحقق من حالة الاشتراك
    final String status = response['status'] ?? 'demo';
    final DateTime demoStartedAt = response['demo_started_at'] != null 
        ? DateTime.parse(response['demo_started_at']) 
        : DateTime.now();
    final String subscriptionId = response['id'].toString();

    if (status == 'active') {
      final DateTime? expiresAt = response['subscription_expires_at'] != null 
          ? DateTime.parse(response['subscription_expires_at']) 
          : null;
      
      if (expiresAt != null && DateTime.now().isAfter(expiresAt)) {
        return {'isValid': false, 'reason': 'expired', 'id': subscriptionId};
      }
      return {'isValid': true, 'status': 'active', 'id': subscriptionId};
    }

    // فحص انقضاء الـ 24 ساعة للنسخة التجريبية
    final isDemoValid = DateTime.now().difference(demoStartedAt).inHours < 24;

    if (isDemoValid) {
      return {'isValid': true, 'status': 'demo', 'id': subscriptionId};
    } else {
      return {'isValid': false, 'reason': 'demo_ended', 'id': subscriptionId};
    }
  }
}