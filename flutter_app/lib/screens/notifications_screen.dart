import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/material.dart';
import '../services/gym_store.dart';
import '../widgets/custom_widgets.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<GymStore>();
    final notifications = store.notifications;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'التنبيهات والإشعارات (${notifications.length})',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        actions: [
          if (notifications.isNotEmpty) ...[
            TextButton(
              onPressed: () {
                store.markAllNotificationsAsRead();
                showAppSnackBar(context, 'تم تحديد الكل كمقروء');
              },
              child: Text(
                'تحديد الكل كمقروء',
                style: GoogleFonts.cairo(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.delete, color: AppColors.red, size: 18),
              onPressed: () {
                store.clearAllNotifications();
                showAppSnackBar(context, 'تم مسح كافة التنبيهات');
              },
            ),
          ],
        ],
      ),
      body: notifications.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.notifications_off, size: 48, color: AppColors.textMuted),
                  const SizedBox(height: 12),
                  Text(
                    'لا توجد أي تنبيهات جديدة في الوقت الحالي',
                    style: GoogleFonts.cairo(color: AppColors.textMuted),
                  ),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (ctx, idx) {
                final notif = notifications[idx];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: notif.readStatus ? AppColors.cardBg : AppColors.cardHover,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: notif.readStatus ? AppColors.border : AppColors.amber.withOpacity(0.4),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.amber.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.info_outline, color: AppColors.amber, size: 18),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              notif.message,
                              style: GoogleFonts.cairo(
                                fontSize: 14,
                                fontWeight: notif.readStatus ? FontWeight.normal : FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              notif.createdAt.split('T')[0],
                              style: GoogleFonts.cairo(fontSize: 11, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, size: 16, color: AppColors.textMuted),
                        onPressed: () => store.deleteNotification(notif.id),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
