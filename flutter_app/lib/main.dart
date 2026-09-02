import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  final prefs = await SharedPreferences.getInstance();
  
  // 1. حفظ وقت أوّل تشغيل للتطبيق
  if (!prefs.containsKey('first_launch_time')) {
    await prefs.setString('first_launch_time', DateTime.now().toIso8601String());
  }

  final firstLaunch = DateTime.parse(prefs.getString('first_launch_time')!);
  final bool is24HoursPassed = DateTime.now().difference(firstLaunch).inHours >= 24;
  
  // قراءة حالة الحساب (demo افتراضياً)
  String deviceStatus = prefs.getString('device_status') ?? 'demo'; 

  runApp(MaterialApp(
    debugShowCheckedModeBanner: false,
    home: (is24HoursPassed && deviceStatus == 'demo')
        ? const ActivationLockoutScreen(deviceId: "MBR_10031")
        : const HomeScreen(), // الشاشة الرئيسية للتطبيق
  ));
}

// 2. شاشة القفل لانتهاء الديمو والتحويل للواتساب
class ActivationLockoutScreen extends StatelessWidget {
  final String deviceId;
  const ActivationLockoutScreen({super.key, required this.deviceId});

  void _openWhatsApp() async {
    final phoneNumber = "+212600000000"; // ضع رقم هاتفك للواتساب
    final message = Uri.encodeComponent(
      "السلام عليكم، أريد تفعيل تطبيق GymFlow الخاص بي.\nرمز الجهاز (Device ID): $deviceId"
    );
    final url = Uri.parse("https://wa.me/$phoneNumber?text=$message");
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_clock, size: 80, color: Colors.amber),
              const SizedBox(height: 20),
              const Text(
                "انتهت الفترة التجريبية (24 ساعة)",
                style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Text(
                "رمز الجهاز الخاص بك: $deviceId",
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                onPressed: _openWhatsApp,
                icon: const Icon(Icons.chat, color: Colors.white),
                label: const Text(
                  "تفعيل الحساب عبر WhatsApp",
                  style: TextStyle(color: Colors.white, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text("GymFlow Main Dashboard")),
    );
  }
}