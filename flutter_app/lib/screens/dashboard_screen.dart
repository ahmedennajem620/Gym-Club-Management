import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';
import 'add_edit_member_screen.dart';
import 'scanner_screen.dart';

class DashboardScreen extends StatelessWidget {
  final Function(int) onNavigateTab;

  const DashboardScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final stats = store.stats;
    final members = store.members;
    final recentAttendance = store.attendance.take(5).toList();

    // Sport distribution
    final Map<String, int> sportCounts = {};
    for (final m in members) {
      sportCounts[m.sportType] = (sportCounts[m.sportType] ?? 0) + 1;
    }

    final activeCount = members.where((m) => m.status == 'active').length;
    final activePercentage = members.isNotEmpty ? ((activeCount / members.length) * 100).round() : 0;

    final expiringSoonList = members.where((m) {
      if (m.status != 'active') return false;
      final days = m.daysRemaining;
      return days >= 0 && days <= 3;
    }).take(3).toList();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () => store.syncFromSupabase(),
        color: AppColors.primary,
        backgroundColor: AppColors.cardBg,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        store.settings.clubName,
                        style: GoogleFonts.cairo(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'لوحة القيادة والملخص العام',
                        style: GoogleFonts.cairo(
                          fontSize: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ScannerScreen()),
                          );
                        },
                        icon: const Icon(LucideIcons.scanLine, color: AppColors.primary),
                        tooltip: 'ماسح الباركود',
                      ),
                      const SizedBox(width: 8),
                      PrimaryButton(
                        text: 'مشترك جديد',
                        icon: LucideIcons.userPlus,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AddEditMemberScreen()),
                          );
                        },
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Bento Grid of Stats
              GridView.count(
                crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.25,
                children: [
                  StatCard(
                    title: 'إجمالي المشتركين',
                    value: stats.totalMembers.toString(),
                    subtitle: 'نسبة النشطين: $activePercentage%',
                    icon: LucideIcons.users,
                    iconColor: AppColors.blue,
                    iconBg: AppColors.blue.withOpacity(0.12),
                    onTap: () => onNavigateTab(1), // Members tab
                  ),
                  StatCard(
                    title: 'حضور اليوم',
                    value: stats.attendanceToday.toString(),
                    subtitle: 'تسجيلات الحضور اليوم',
                    icon: LucideIcons.calendarCheck,
                    iconColor: AppColors.emerald,
                    iconBg: AppColors.emerald.withOpacity(0.12),
                    onTap: () => onNavigateTab(2), // Attendance tab
                  ),
                  StatCard(
                    title: 'تنتهي قريباً',
                    value: stats.expiringSoonCount.toString(),
                    subtitle: 'خلال أقل من 3 أيام',
                    icon: LucideIcons.alertTriangle,
                    iconColor: AppColors.amber,
                    iconBg: AppColors.amber.withOpacity(0.12),
                    onTap: () => onNavigateTab(1),
                  ),
                  StatCard(
                    title: 'اشتراكات منتهية',
                    value: stats.expiredCount.toString(),
                    subtitle: 'بحاجة إلى التجديد',
                    icon: LucideIcons.userX,
                    iconColor: AppColors.red,
                    iconBg: AppColors.red.withOpacity(0.12),
                    onTap: () => onNavigateTab(1),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Expiring Subscriptions Banner
              if (expiringSoonList.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.amber.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.amber.withOpacity(0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(LucideIcons.alertCircle, color: AppColors.amber, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'اشتراكات على وشك الانتهاء',
                            style: GoogleFonts.cairo(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: AppColors.amber,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...expiringSoonList.map((m) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              m.fullName,
                              style: GoogleFonts.cairo(fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                            Row(
                              children: [
                                Text(
                                  'متبقي ${m.daysRemaining} يوم',
                                  style: GoogleFonts.cairo(fontSize: 12, color: AppColors.amber),
                                ),
                                const SizedBox(width: 8),
                                InkWell(
                                  onTap: () {
                                    store.renewSubscription(m.id, 1);
                                    showAppSnackBar(context, 'تم تجديد اشتراك ${m.fullName} لشهر إضافي!');
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.amber,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      'تجديد + شهر',
                                      style: GoogleFonts.cairo(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Sport Breakdown
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
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'توزيع المشتركين حسب الرياضة',
                          style: GoogleFonts.cairo(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const Icon(LucideIcons.activity, color: AppColors.primary, size: 20),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: store.settings.sports.map((sport) {
                        final count = sportCounts[sport] ?? 0;
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                sport,
                                style: GoogleFonts.cairo(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  count.toString(),
                                  style: GoogleFonts.cairo(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Recent Attendance Records
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
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'آخر تسجيلات الحضور',
                          style: GoogleFonts.cairo(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        TextButton(
                          onPressed: () => onNavigateTab(2),
                          child: Text(
                            'عرض الكل',
                            style: GoogleFonts.cairo(
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (recentAttendance.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24.0),
                          child: Text(
                            'لم يتم تسجيل أي حضور حتى الآن',
                            style: GoogleFonts.cairo(color: AppColors.textMuted),
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: recentAttendance.length,
                        separatorBuilder: (_, __) => const Divider(color: AppColors.border, height: 1),
                        itemBuilder: (ctx, idx) {
                          final att = recentAttendance[idx];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: AppColors.emerald.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(LucideIcons.check, color: AppColors.emerald, size: 16),
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      att.memberName,
                                      style: GoogleFonts.cairo(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    Text(
                                      att.checkinDate,
                                      style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.cardHover,
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      child: Text(
                                        att.checkinTime,
                                        style: GoogleFonts.cairo(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
