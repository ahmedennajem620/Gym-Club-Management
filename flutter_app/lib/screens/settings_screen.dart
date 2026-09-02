import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/material.dart';
import '../services/gym_store.dart';
import '../services/supabase_service.dart';
import '../widgets/custom_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _clubNameController;
  late TextEditingController _clubWhatsappController;
  late TextEditingController _ownerEmailController;
  final TextEditingController _newSportController = TextEditingController();

  bool _isTesting = false;
  bool _isSyncing = false;
  bool _isPushing = false;
  bool _showSql = false;

  @override
  void initState() {
    super.initState();
    final settings = context.read<GymStore>().settings;
    _clubNameController = TextEditingController(text: settings.clubName);
    _clubWhatsappController = TextEditingController(text: settings.clubWhatsapp);
    _ownerEmailController = TextEditingController(text: settings.ownerEmail);
  }

  @override
  void dispose() {
    _clubNameController.dispose();
    _clubWhatsappController.dispose();
    _ownerEmailController.dispose();
    _newSportController.dispose();
    super.dispose();
  }

  void _saveGeneralSettings() {
    final store = context.read<GymStore>();
    final updated = store.settings.copyWith(
      clubName: _clubNameController.text.trim(),
      clubWhatsapp: _clubWhatsappController.text.trim(),
      ownerEmail: _ownerEmailController.text.trim(),
    );
    store.updateSettings(updated);
    showAppSnackBar(context, 'تم حفظ إعدادات النادي بنجاح!');
  }

  void _addSport() {
    final name = _newSportController.text.trim();
    if (name.isNotEmpty) {
      context.read<GymStore>().addSport(name);
      _newSportController.clear();
      showAppSnackBar(context, 'تمت إضافة الرياضة بنجاح!');
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final sports = store.settings.sports;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'الإعدادات والربط السحابي',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section 1: Gym Club Profile
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.business, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'الملف التعريفي للنادي',
                        style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  CustomTextField(
                    label: 'اسم النادي الرياضي',
                    controller: _clubNameController,
                    prefixIcon: Icons.fitness_center,
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    label: 'رقم واتساب الرسمي',
                    controller: _clubWhatsappController,
                    prefixIcon: Icons.phone,
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    label: 'بريد الإدارة الإلكتروني',
                    controller: _ownerEmailController,
                    prefixIcon: Icons.mail,
                    keyboardType: TextInputType.emailAddress,
                  ),
                  const SizedBox(height: 16),
                  PrimaryButton(
                    text: 'حفظ الإعدادات',
                    icon: Icons.save,
                    onPressed: _saveGeneralSettings,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Section 2: Sports Management
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.trending_up, color: AppColors.primary, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'إدارة الرياضات والأنشطة (${sports.length})',
                        style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: CustomTextField(
                          label: 'إضافة رياضة جديدة',
                          hint: 'مثال: Pilates أو CrossFit',
                          controller: _newSportController,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Padding(
                        padding: const EdgeInsets.only(top: 24.0),
                        child: PrimaryButton(
                          text: 'إضافة',
                          icon: Icons.add,
                          onPressed: _addSport,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: sports.map((s) {
                      return Chip(
                        label: Text(s, style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w600)),
                        backgroundColor: AppColors.background,
                        side: const BorderSide(color: AppColors.border),
                        deleteIcon: const Icon(Icons.delete, size: 16, color: AppColors.red),
                        onDeleted: sports.length > 1
                            ? () {
                                store.deleteSport(s);
                                showAppSnackBar(context, 'تم حذف الرياضة');
                              }
                            : null,
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Section 3: Supabase Cloud Integration
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.emerald.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.storage, color: AppColors.emerald, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'ربط Supabase السحابي',
                            style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.emerald.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          SupabaseService.projectId,
                          style: GoogleFonts.cairo(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.emerald),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'قاعدة بيانات سحابية متزامنة مع أجهزة النادي في أي وقت وبكل أمان.',
                    style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 16),

                  // Supabase Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _isTesting
                              ? null
                              : () async {
                                  setState(() => _isTesting = true);
                                  final res = await SupabaseService.testConnection();
                                  setState(() => _isTesting = false);
                                  if (mounted) {
                                    showAppSnackBar(context, res['message'], isError: !res['success']);
                                  }
                                },
                          icon: _isTesting
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.trending_up, size: 16, color: AppColors.emerald),
                          label: Text('فحص الاتصال', style: GoogleFonts.cairo(fontSize: 12, color: Colors.white)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _isPushing
                              ? null
                              : () async {
                                  setState(() => _isPushing = true);
                                  final res = await store.pushAllToSupabase();
                                  setState(() => _isPushing = false);
                                  if (mounted) {
                                    showAppSnackBar(context, res['message'], isError: !res['success']);
                                  }
                                },
                          icon: _isPushing
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.cloud_upload, size: 16, color: Colors.black),
                          label: Text('رفع للـ Cloud', style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.emerald,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _isSyncing
                              ? null
                              : () async {
                                  setState(() => _isSyncing = true);
                                  final res = await store.syncFromSupabase();
                                  setState(() => _isSyncing = false);
                                  if (mounted) {
                                    showAppSnackBar(context, res['message'], isError: !res['success']);
                                  }
                                },
                          icon: _isSyncing
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.cloud_download, size: 16, color: AppColors.primary),
                          label: Text('جلب البيانات', style: GoogleFonts.cairo(fontSize: 12, color: Colors.white)),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.border),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // SQL Schema Viewer & Copy
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton.icon(
                        onPressed: () {
                          Clipboard.setData(const ClipboardData(text: SupabaseService.sqlSchema));
                          showAppSnackBar(context, 'تم نسخ استعلام SQL Schema إلى الحافظة!');
                        },
                        icon: const Icon(Icons.copy_all, size: 14, color: AppColors.emerald),
                        label: Text('نسخ كود إنشاء الجداول (SQL)', style: GoogleFonts.cairo(color: AppColors.emerald, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      TextButton(
                        onPressed: () => setState(() => _showSql = !_showSql),
                        child: Text(_showSql ? 'إخفاء' : 'عرض الكود', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 12)),
                      ),
                    ],
                  ),

                  if (_showSql) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Text(
                        SupabaseService.sqlSchema,
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.grey),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  store.logout();
                  showAppSnackBar(context, 'تم تسجيل الخروج بنجاح');
                },
                icon: const Icon(Icons.logout, color: AppColors.red, size: 18),
                label: Text('تسجيل الخروج من الحساب', style: GoogleFonts.cairo(color: AppColors.red, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.red),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
