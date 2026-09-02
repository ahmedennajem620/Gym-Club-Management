import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DemoChecker extends StatefulWidget {
  final Widget child;

  const DemoChecker({Key? key, required this.child}) : super(key: key);

  @override
  State<DemoChecker> createState() => _DemoCheckerState();
}

class _DemoCheckerState extends State<DemoChecker> {
  bool _isLoading = true;
  bool _isDemoExpired = false;

  @override
  void initState() {
    super.initState();
    _checkDemoStatus();
  }

  Future<void> _checkDemoStatus() async {
    final prefs = await SharedPreferences.getInstance();
    
    String? firstOpenStr = prefs.getString('first_open_time');
    DateTime firstOpenTime;

    if (firstOpenStr == null) {
      firstOpenTime = DateTime.now();
      await prefs.setString('first_open_time', firstOpenTime.toIso8601String());
    } else {
      firstOpenTime = DateTime.parse(firstOpenStr);
    }

    final difference = DateTime.now().difference(firstOpenTime);

    setState(() {
      _isDemoExpired = difference.inHours >= 24;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_isDemoExpired) {
      return const SubscriptionOfferScreen();
    }

    return widget.child;
  }
}

// شاشة انتهاء الفترة التجريبية وعرض الاشتراك
class SubscriptionOfferScreen extends StatelessWidget {
  const SubscriptionOfferScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        padding: const EdgeInsets.all(24.0),
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade900, Colors.black],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.lock_clock_rounded,
              size: 80,
              color: Colors.amber,
            ),
            const SizedBox(height: 24),
            const Text(
              'انتهت الفترة التجريبية (24 ساعة)',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'نتمنى أن تكون قد استمتعت بتجربة نظام إدارة الجيم!\nللحصول على النسخة الكاملة وتفعيل حسابك السحابي، يرجى التواصل معنا.',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 14,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              onPressed: () {
                // يمكن إضافة رابط الواتساب هنا لاحقاً
              },
              icon: const Icon(Icons.phone, color: Colors.white),
              label: const Text(
                'تواصل معنا للتفعيل',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}