import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/models.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController _cameraController = MobileScannerController();
  final TextEditingController _manualController = TextEditingController();
  bool _isProcessing = false;
  bool _torchEnabled = false;

  @override
  void dispose() {
    _cameraController.dispose();
    _manualController.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      final code = barcode.rawValue;
      if (code != null && code.isNotEmpty) {
        _processBarcode(code);
        break;
      }
    }
  }

  void _processBarcode(String barcode) async {
    setState(() => _isProcessing = true);
    final store = context.read<GymStore>();

    final result = await store.checkinByBarcode(barcode);

    if (mounted) {
      _showResultDialog(result);
    }
  }

  void _showResultDialog(Map<String, dynamic> result) {
    final bool success = result['success'] == true;
    final bool isExpired = result['expired'] == true;
    final Member? member = result['member'];
    final String message = result['message'] ?? '';

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBg,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: success
                      ? AppColors.emerald.withOpacity(0.15)
                      : (isExpired ? AppColors.red.withOpacity(0.15) : AppColors.amber.withOpacity(0.15)),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  success
                      ? LucideIcons.checkCircle
                      : (isExpired ? LucideIcons.alertTriangle : LucideIcons.xCircle),
                  color: success
                      ? AppColors.emerald
                      : (isExpired ? AppColors.red : AppColors.amber),
                  size: 40,
                ),
              ),
              const SizedBox(height: 16),

              Text(
                success ? 'تم تسجيل الحضور بنجاح!' : (isExpired ? 'اشتراك منتهي الصلاحية!' : 'رمز غير مسجل'),
                style: GoogleFonts.cairo(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),

              Text(
                message,
                textAlign: TextAlign.center,
                style: GoogleFonts.cairo(
                  fontSize: 14,
                  color: AppColors.textLight,
                ),
              ),

              if (member != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('المشترك:', style: GoogleFonts.cairo(color: AppColors.textMuted)),
                          Text(member.fullName, style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: Colors.white)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('الرياضة:', style: GoogleFonts.cairo(color: AppColors.textMuted)),
                          Text(member.sportType, style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('تاريخ الانتهاء:', style: GoogleFonts.cairo(color: AppColors.textMuted)),
                          Text(member.endDate, style: GoogleFonts.cairo(color: Colors.white)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              Row(
                children: [
                  if (isExpired && member != null) ...[
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          context.read<GymStore>().renewSubscription(member.id, 1);
                          Navigator.pop(ctx);
                          showAppSnackBar(context, 'تم تجديد الاشتراك لمدة شهر بنجاح!');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.emerald,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'تجديد + شهر فوري',
                          style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: Colors.black),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        setState(() => _isProcessing = false);
                      },
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        'مسح كود آخر',
                        style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    ).then((_) {
      setState(() => _isProcessing = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'ماسح الباركود وQR Code',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _torchEnabled ? LucideIcons.flashlight : LucideIcons.flashlightOff,
              color: _torchEnabled ? AppColors.primary : Colors.white,
            ),
            onPressed: () {
              _cameraController.toggleTorch();
              setState(() => _torchEnabled = !_torchEnabled);
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: () => _cameraController.switchCamera(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Live Camera Preview
          Expanded(
            flex: 3,
            child: Stack(
              alignment: Alignment.center,
              children: [
                MobileScanner(
                  controller: _cameraController,
                  onDetect: _onDetect,
                ),

                // Scanner target frame overlay
                Container(
                  width: 250,
                  height: 250,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primary, width: 2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: Container(
                          height: 2,
                          color: AppColors.primary.withOpacity(0.8),
                        ),
                      ),
                    ],
                  ),
                ),

                Positioned(
                  bottom: 20,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.7),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'وجّه الكاميرا نحو باركود أو QR المشترك',
                      style: GoogleFonts.cairo(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Manual Input Fallback
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(20),
              color: AppColors.cardBg,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'أو أدخل رقم الباركود يدوياً:',
                    style: GoogleFonts.cairo(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _manualController,
                          style: GoogleFonts.cairo(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'مثال: GYM-1011',
                            hintStyle: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13),
                            filled: true,
                            fillColor: AppColors.background,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: AppColors.border),
                            ),
                          ),
                          onSubmitted: (val) {
                            if (val.trim().isNotEmpty) {
                              _processBarcode(val.trim());
                            }
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: () {
                          final val = _manualController.text.trim();
                          if (val.isNotEmpty) {
                            _processBarcode(val);
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          'تحقق وتسجيل',
                          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'نصيحة: يمكنك أيضاً توصيل ماسح USB أو Bluetooth وسيقوم بالكتابة والمطابقة تلقائياً.',
                    style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 11),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
