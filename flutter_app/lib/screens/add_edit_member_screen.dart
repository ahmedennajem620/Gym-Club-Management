import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../models/models.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';

class AddEditMemberScreen extends StatefulWidget {
  final Member? memberToEdit;

  const AddEditMemberScreen({super.key, this.memberToEdit});

  @override
  State<AddEditMemberScreen> createState() => _AddEditMemberScreenState();
}

class _AddEditMemberScreenState extends State<AddEditMemberScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late TextEditingController _barcodeController;
  late TextEditingController _feeController;

  late String _selectedSport;
  late DateTime _startDate;
  late DateTime _endDate;
  bool _emailVerified = false;
  bool _isSaving = false;

  bool get isEditMode => widget.memberToEdit != null;

  @override
  void initState() {
    super.initState();
    final m = widget.memberToEdit;
    final now = DateTime.now();

    _nameController = TextEditingController(text: m?.fullName ?? '');
    _phoneController = TextEditingController(text: m?.phone ?? '');
    _emailController = TextEditingController(text: m?.email ?? '');
    _barcodeController = TextEditingController(text: m?.barcodeId ?? '');
    _feeController = TextEditingController(text: (m?.subscriptionFee ?? 250.0).toStringAsFixed(0));

    _selectedSport = m?.sportType ?? 'Gym';
    _emailVerified = m?.emailVerified ?? false;

    if (m != null) {
      try {
        _startDate = DateTime.parse(m.startDate);
        _endDate = DateTime.parse(m.endDate);
      } catch (_) {
        _startDate = now;
        _endDate = now.add(const Duration(days: 30));
      }
    } else {
      _startDate = now;
      _endDate = now.add(const Duration(days: 30));
      _barcodeController.text = 'GYM-${1000 + DateTime.now().millisecond}';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _barcodeController.dispose();
    _feeController.dispose();
    super.dispose();
  }

  void _applyDurationPreset(int months) {
    setState(() {
      _endDate = _startDate.add(Duration(days: months * 30));
    });
  }

  Future<void> _pickDate({required bool isStart}) async {
    final initialDate = isStart ? _startDate : _endDate;
    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2035),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.primary,
              onPrimary: Colors.black,
              surface: AppColors.cardBg,
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate.isBefore(_startDate)) {
            _endDate = _startDate.add(const Duration(days: 30));
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);
    final store = context.read<GymStore>();

    final startDateStr = DateFormat('yyyy-MM-dd').format(_startDate);
    final endDateStr = DateFormat('yyyy-MM-dd').format(_endDate);
    final fee = double.tryParse(_feeController.text) ?? 250.0;

    if (isEditMode) {
      final updated = widget.memberToEdit!.copyWith(
        fullName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
        emailVerified: _emailVerified,
        sportType: _selectedSport,
        startDate: startDateStr,
        endDate: endDateStr,
        barcodeId: _barcodeController.text.trim(),
        status: _endDate.isBefore(DateTime.now()) ? 'expired' : 'active',
        subscriptionFee: fee,
      );
      await store.updateMember(updated);
      if (mounted) {
        showAppSnackBar(context, 'تم تحديث بيانات المشترك بنجاح!');
        Navigator.pop(context);
      }
    } else {
      await store.addMember(
        fullName: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        email: _emailController.text.trim().isNotEmpty ? _emailController.text.trim() : null,
        emailVerified: _emailVerified,
        sportType: _selectedSport,
        startDate: startDateStr,
        endDate: endDateStr,
        customBarcode: _barcodeController.text.trim(),
        subscriptionFee: fee,
      );
      if (mounted) {
        showAppSnackBar(context, 'تمت إضافة المشترك بنجاح!');
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final sportsList = store.settings.sports;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isEditMode ? 'تعديل بيانات المشترك' : 'إضافة مشترك جديد',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Full Name
              CustomTextField(
                label: 'الاسم الكامل *',
                hint: 'مثال: محمد العمري',
                controller: _nameController,
                prefixIcon: Icons.person,
                validator: (val) => val == null || val.trim().isEmpty ? 'يرجى إدخال اسم المشترك' : null,
              ),
              const SizedBox(height: 16),

              // Phone Number
              CustomTextField(
                label: 'رقم الهاتف (واتساب) *',
                hint: '0612345678',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone,
                validator: (val) => val == null || val.trim().isEmpty ? 'يرجى إدخال رقم الهاتف' : null,
              ),
              const SizedBox(height: 16),

              // Email Address (Optional)
              CustomTextField(
                label: 'البريد الإلكتروني (اختياري)',
                hint: 'member@example.com',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.mail,
              ),
              const SizedBox(height: 16),

              // Sport Selection
              Text(
                'نوع الرياضة والاشتراك *',
                style: GoogleFonts.cairo(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: AppColors.cardBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: sportsList.contains(_selectedSport) ? _selectedSport : sportsList.first,
                    isExpanded: true,
                    dropdownColor: AppColors.cardBg,
                    style: GoogleFonts.cairo(color: Colors.white, fontSize: 14),
                    items: sportsList.map((sport) {
                      return DropdownMenuItem(
                        value: sport,
                        child: Text(sport),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedSport = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Subscription Period Presets
              Text(
                'المدة وباقة الاشتراك',
                style: GoogleFonts.cairo(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textLight,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _presetButton('شهر (1)', () => _applyDurationPreset(1)),
                  const SizedBox(width: 8),
                  _presetButton('3 أشهر', () => _applyDurationPreset(3)),
                  const SizedBox(width: 8),
                  _presetButton('6 أشهر', () => _applyDurationPreset(6)),
                  const SizedBox(width: 8),
                  _presetButton('سنة', () => _applyDurationPreset(12)),
                ],
              ),
              const SizedBox(height: 16),

              // Dates (Start & End)
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      label: 'تاريخ البدء',
                      hint: DateFormat('yyyy-MM-dd').format(_startDate),
                      readOnly: true,
                      prefixIcon: Icons.calendar_today,
                      onTap: () => _pickDate(isStart: true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      label: 'تاريخ الانتهاء',
                      hint: DateFormat('yyyy-MM-dd').format(_endDate),
                      readOnly: true,
                      prefixIcon: Icons.event_available,
                      onTap: () => _pickDate(isStart: false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Barcode & Fee
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      label: 'الرمز الشريطي (الباركود)',
                      controller: _barcodeController,
                     prefixIcon: Icons.qr_code_scanner,
                      validator: (val) => val == null || val.trim().isEmpty ? 'الباركود مطلوب' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: CustomTextField(
                      label: 'سعر الاشتراك (درهم)',
                      controller: _feeController,
                      keyboardType: TextInputType.number,
                      prefixIcon: Icons.attach_money,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  text: isEditMode ? 'حفظ التعديلات' : 'إضافة المشترك وإصدار البطاقة',
                  icon: Icons.check,
                  isLoading: _isSaving,
                  onPressed: _submit,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _presetButton(String label, VoidCallback onTap) {
    return Expanded(
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.border),
          padding: const EdgeInsets.symmetric(vertical: 8),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: Text(
          label,
          style: GoogleFonts.cairo(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
      ),
    );
  }
}
