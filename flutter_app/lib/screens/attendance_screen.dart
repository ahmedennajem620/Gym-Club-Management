import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  String _searchQuery = '';
  String? _selectedDateFilter; // null = all, or "YYYY-MM-DD"

  @override
  void initState() {
    super.initState();
    // Default to today
    _selectedDateFilter = DateFormat('yyyy-MM-dd').format(DateTime.now());
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final allAttendance = store.attendance;

    final filtered = allAttendance.where((a) {
      final matchesSearch = a.memberName.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesDate = _selectedDateFilter == null || a.checkinDate == _selectedDateFilter;
      return matchesSearch && matchesDate;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'سجل الحضور اليومي (${filtered.length})',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        actions: [
          if (allAttendance.isNotEmpty)
            IconButton(
              icon: const Icon(LucideIcons.trash2, color: AppColors.red),
              tooltip: 'مسح سجل الحضور',
              onPressed: () => _confirmClearAll(context, store),
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter & Date Selector Header
          Container(
            padding: const EdgeInsets.all(16),
            color: AppColors.cardBg,
            child: Column(
              children: [
                TextField(
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: GoogleFonts.cairo(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'البحث باسم المشترك في سجل الحضور...',
                    hintStyle: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13),
                    prefixIcon: const Icon(LucideIcons.search, color: AppColors.textMuted, size: 20),
                    filled: true,
                    fillColor: AppColors.background,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    ChoiceChip(
                      label: Text('اليوم', style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.bold)),
                      selected: _selectedDateFilter == DateFormat('yyyy-MM-dd').format(DateTime.now()),
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.background,
                      labelStyle: TextStyle(
                        color: _selectedDateFilter == DateFormat('yyyy-MM-dd').format(DateTime.now())
                            ? Colors.black
                            : Colors.white,
                      ),
                      onSelected: (_) {
                        setState(() {
                          _selectedDateFilter = DateFormat('yyyy-MM-dd').format(DateTime.now());
                        });
                      },
                    ),
                    const SizedBox(width: 8),
                    ChoiceChip(
                      label: Text('جميع التواريخ', style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.bold)),
                      selected: _selectedDateFilter == null,
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.background,
                      labelStyle: TextStyle(color: _selectedDateFilter == null ? Colors.black : Colors.white),
                      onSelected: (_) => setState(() => _selectedDateFilter = null),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(LucideIcons.calendar, color: AppColors.primary),
                      tooltip: 'اختيار تاريخ محدد',
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2020),
                          lastDate: DateTime(2035),
                        );
                        if (picked != null) {
                          setState(() {
                            _selectedDateFilter = DateFormat('yyyy-MM-dd').format(picked);
                          });
                        }
                      },
                    ),
                    if (_selectedDateFilter != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        _selectedDateFilter!,
                        style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Attendance List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.calendarX, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text(
                          'لا توجد تسجيلات حضور في هذا التاريخ',
                          style: GoogleFonts.cairo(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (ctx, idx) {
                      final item = filtered[idx];
                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.cardBg,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppColors.emerald.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(LucideIcons.check, color: AppColors.emerald, size: 18),
                                ),
                                const SizedBox(width: 14),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.memberName,
                                      style: GoogleFonts.cairo(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    Text(
                                      'التاريخ: ${item.checkinDate}',
                                      style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: Text(
                                    item.checkinTime,
                                    style: GoogleFonts.cairo(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(LucideIcons.trash2, color: AppColors.red, size: 16),
                                  onPressed: () {
                                    store.deleteAttendance(item.id);
                                    showAppSnackBar(context, 'تم حذف التسجيل بنجاح');
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _confirmClearAll(BuildContext context, GymStore store) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cardBg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.border),
        ),
        title: Text(
          'مسح كافة سجلات الحضور',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold, color: AppColors.red),
        ),
        content: Text(
          'هل أنت متأكد من مسح جميع سجلات الحضور السابقة؟ لا يمكن التراجع عن هذا الإجراء.',
          style: GoogleFonts.cairo(color: AppColors.textLight),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('إلغاء', style: GoogleFonts.cairo(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              store.clearAllAttendance();
              Navigator.pop(ctx);
              showAppSnackBar(context, 'تم مسح سجل الحضور بالكامل');
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.red),
            child: Text('مسح الكل', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
