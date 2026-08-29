import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import 'package:crypto/crypto.dart';
import '../models/models.dart';
import 'supabase_service.dart';

class GymStore extends ChangeNotifier {
  static const String keyMembers = 'gym_members_v1';
  static const String keyAttendance = 'gym_attendance_v1';
  static const String keyNotifications = 'gym_notifications_v1';
  static const String keySettings = 'gym_settings_v1';
  static const String keyAuth = 'gym_auth_v1';

  final Uuid _uuid = const Uuid();

  List<Member> _members = [];
  List<Attendance> _attendance = [];
  List<NotificationModel> _notifications = [];
  GymSettings _settings = GymSettings();
  GymUser? _currentUser;
  bool _isLoading = true;
  bool _isSyncing = false;

  List<Member> get members => _members;
  List<Attendance> get attendance => _attendance;
  List<NotificationModel> get notifications => _notifications;
  GymSettings get settings => _settings;
  GymUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  bool get isSyncing => _isSyncing;

  int get unreadNotificationsCount => _notifications.where((n) => !n.readStatus).length;

  GymStats get stats {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final attToday = _attendance.where((a) => a.checkinDate == today).length;
    final expired = _members.where((m) => m.status == 'expired').length;
    
    final expiringSoon = _members.where((m) {
      if (m.status != 'active') return false;
      final days = m.daysRemaining;
      return days >= 0 && days <= 3;
    }).length;

    return GymStats(
      totalMembers: _members.length,
      attendanceToday: attToday,
      expiredCount: expired,
      expiringSoonCount: expiringSoon,
    );
  }

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    await SupabaseService.initialize();
    await _loadFromLocal();
    _checkSubscriptionsExpiry();

    // Background sync with Supabase
    syncFromSupabase();

    _isLoading = false;
    notifyListeners();
  }

  // ----------------------------------------------------
  // Local Persistence
  // ----------------------------------------------------
  Future<void> _loadFromLocal() async {
    final prefs = await SharedPreferences.getInstance();

    // Load Settings
    final settingsJson = prefs.getString(keySettings);
    if (settingsJson != null) {
      try {
        _settings = GymSettings.fromJson(settingsJson);
      } catch (_) {}
    }

    // Load Auth
    final authJson = prefs.getString(keyAuth);
    if (authJson != null) {
      try {
        _currentUser = GymUser.fromJson(authJson);
      } catch (_) {}
    }

    // Load Members
    final membersJson = prefs.getString(keyMembers);
    if (membersJson != null) {
      try {
        final List<dynamic> list = json.decode(membersJson);
        _members = list.map((e) => Member.fromMap(e)).toList();
      } catch (_) {}
    } else {
      // Initialize with sample demo members if completely empty
      _seedDemoData();
      await _saveMembers();
    }

    // Load Attendance
    final attendanceJson = prefs.getString(keyAttendance);
    if (attendanceJson != null) {
      try {
        final List<dynamic> list = json.decode(attendanceJson);
        _attendance = list.map((e) => Attendance.fromMap(e)).toList();
      } catch (_) {}
    }

    // Load Notifications
    final notifJson = prefs.getString(keyNotifications);
    if (notifJson != null) {
      try {
        final List<dynamic> list = json.decode(notifJson);
        _notifications = list.map((e) => NotificationModel.fromMap(e)).toList();
      } catch (_) {}
    }
  }

  void _seedDemoData() {
    final now = DateTime.now();
    final todayStr = DateFormat('yyyy-MM-dd').format(now);
    final inOneMonth = DateFormat('yyyy-MM-dd').format(now.add(const Duration(days: 30)));
    final inTwoDays = DateFormat('yyyy-MM-dd').format(now.add(const Duration(days: 2)));
    final expiredDate = DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 5)));

    _members = [
      Member(
        id: _uuid.v4(),
        fullName: 'أحمد العلمي',
        phone: '0612345678',
        email: 'ahmed@example.com',
        emailVerified: true,
        sportType: 'Gym',
        startDate: todayStr,
        endDate: inOneMonth,
        barcodeId: 'GYM-1011',
        status: 'active',
        subscriptionFee: 250.0,
        createdAt: now.toIso8601String(),
      ),
      Member(
        id: _uuid.v4(),
        fullName: 'كريم الناجي',
        phone: '0698765432',
        email: 'karim@example.com',
        emailVerified: true,
        sportType: 'Boxing',
        startDate: DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 28))),
        endDate: inTwoDays,
        barcodeId: 'GYM-1012',
        status: 'active',
        subscriptionFee: 300.0,
        createdAt: now.toIso8601String(),
      ),
      Member(
        id: _uuid.v4(),
        fullName: 'ياسين الفاسي',
        phone: '0655443322',
        email: 'yassine@example.com',
        sportType: 'Swimming',
        startDate: DateFormat('yyyy-MM-dd').format(now.subtract(const Duration(days: 35))),
        endDate: expiredDate,
        barcodeId: 'GYM-1013',
        status: 'expired',
        subscriptionFee: 350.0,
        createdAt: now.toIso8601String(),
      ),
    ];
  }

  Future<void> _saveMembers() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyMembers, json.encode(_members.map((m) => m.toMap()).toList()));
  }

  Future<void> _saveAttendance() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyAttendance, json.encode(_attendance.map((a) => a.toMap()).toList()));
  }

  Future<void> _saveNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyNotifications, json.encode(_notifications.map((n) => n.toMap()).toList()));
  }

  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keySettings, _settings.toJson());
  }

  // ----------------------------------------------------
  // Member Operations
  // ----------------------------------------------------
  Future<Member> addMember({
    required String fullName,
    required String phone,
    String? email,
    bool emailVerified = false,
    required String sportType,
    required String startDate,
    required String endDate,
    String? customBarcode,
    double subscriptionFee = 250.0,
  }) async {
    final barcode = customBarcode?.isNotEmpty == true
        ? customBarcode!
        : 'GYM-${1000 + _members.length + 1}';

    final isExpired = DateTime.parse(endDate).isBefore(DateTime.now());

    final newMember = Member(
      id: _uuid.v4(),
      fullName: fullName,
      phone: phone,
      email: email,
      emailVerified: emailVerified,
      sportType: sportType,
      startDate: startDate,
      endDate: endDate,
      barcodeId: barcode,
      status: isExpired ? 'expired' : 'active',
      subscriptionFee: subscriptionFee,
      createdAt: DateTime.now().toIso8601String(),
    );

    _members.insert(0, newMember);
    await _saveMembers();
    _checkSubscriptionsExpiry();
    notifyListeners();

    // Sync to Supabase in background
    SupabaseService.upsertMember(newMember);

    return newMember;
  }

  Future<void> updateMember(Member updated) async {
    final index = _members.indexWhere((m) => m.id == updated.id);
    if (index != -1) {
      _members[index] = updated;
      await _saveMembers();
      _checkSubscriptionsExpiry();
      notifyListeners();
      SupabaseService.upsertMember(updated);
    }
  }

  Future<void> deleteMember(String id) async {
    _members.removeWhere((m) => m.id == id);
    _attendance.removeWhere((a) => a.memberId == id);
    _notifications.removeWhere((n) => n.memberId == id);
    await _saveMembers();
    await _saveAttendance();
    await _saveNotifications();
    notifyListeners();

    SupabaseService.deleteMember(id);
  }

  Future<void> renewSubscription(String memberId, int months) async {
    final index = _members.indexWhere((m) => m.id == memberId);
    if (index != -1) {
      final current = _members[index];
      final now = DateTime.now();
      DateTime baseDate = DateTime.parse(current.endDate);
      if (baseDate.isBefore(now)) {
        baseDate = now;
      }
      final newEnd = baseDate.add(Duration(days: months * 30));
      final updated = current.copyWith(
        startDate: DateFormat('yyyy-MM-dd').format(now),
        endDate: DateFormat('yyyy-MM-dd').format(newEnd),
        status: 'active',
      );
      _members[index] = updated;
      await _saveMembers();
      _checkSubscriptionsExpiry();
      notifyListeners();

      SupabaseService.upsertMember(updated);
    }
  }

  // ----------------------------------------------------
  // Attendance & Barcode Scanner Verification
  // ----------------------------------------------------
  Future<Map<String, dynamic>> checkinByBarcode(String barcode) async {
    final cleanBarcode = barcode.trim();
    if (cleanBarcode.isEmpty) {
      return {'success': false, 'message': 'الرمز الشريطي فارغ'};
    }

    final member = _members.firstWhere(
      (m) => m.barcodeId.toLowerCase() == cleanBarcode.toLowerCase() || m.id == cleanBarcode,
      orElse: () => Member(
        id: '',
        fullName: '',
        phone: '',
        sportType: '',
        startDate: '',
        endDate: '',
        barcodeId: '',
        status: 'expired',
        createdAt: '',
      ),
    );

    if (member.id.isEmpty) {
      return {'success': false, 'message': 'لم يتم العثور على مشترك بهذا الباركود ($cleanBarcode)'};
    }

    // Check expiration
    if (member.status == 'expired' || DateTime.parse(member.endDate).isBefore(DateTime.now())) {
      return {
        'success': false,
        'expired': true,
        'member': member,
        'message': 'تنبيه: اشتراك المشترك (${member.fullName}) منتهي الصلاحية!',
      };
    }

    final now = DateTime.now();
    final today = DateFormat('yyyy-MM-dd').format(now);
    final time = DateFormat('HH:mm').format(now);

    final newAttendance = Attendance(
      id: _uuid.v4(),
      memberId: member.id,
      memberName: member.fullName,
      checkinTime: time,
      checkinDate: today,
      createdAt: now.toIso8601String(),
    );

    _attendance.insert(0, newAttendance);
    await _saveAttendance();
    notifyListeners();

    SupabaseService.upsertAttendance(newAttendance);

    return {
      'success': true,
      'member': member,
      'attendance': newAttendance,
      'message': 'تم تسجيل حضور المشترك بنجاح: ${member.fullName}',
    };
  }

  Future<void> deleteAttendance(String id) async {
    _attendance.removeWhere((a) => a.id == id);
    await _saveAttendance();
    notifyListeners();
    SupabaseService.deleteAttendance(id);
  }

  Future<void> clearAllAttendance() async {
    _attendance.clear();
    await _saveAttendance();
    notifyListeners();
  }

  // ----------------------------------------------------
  // Notifications & Expiry Checker
  // ----------------------------------------------------
  void _checkSubscriptionsExpiry() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    for (var i = 0; i < _members.length; i++) {
      final m = _members[i];
      try {
        final end = DateTime.parse(m.endDate);
        final diffDays = end.difference(today).inDays;

        if (diffDays < 0 && m.status == 'active') {
          // Expired
          _members[i] = m.copyWith(status: 'expired');
          _addNotification(
            memberId: m.id,
            message: 'انتهت صلاحية اشتراك المشترك ${m.fullName} (${m.sportType}) بتاريخ ${m.endDate}',
          );
        } else if (diffDays >= 0 && diffDays <= 3 && m.status == 'active') {
          // Expiring soon
          final hasNotif = _notifications.any(
            (n) => n.memberId == m.id && n.message.contains('ستنتهي قريباً'),
          );
          if (!hasNotif) {
            _addNotification(
              memberId: m.id,
              message: 'تنبيه: اشتراك المشترك ${m.fullName} سينتهي خلال $diffDays أيام (${m.endDate})',
            );
          }
        }
      } catch (_) {}
    }
  }

  void _addNotification({required String memberId, required String message}) {
    final newNotif = NotificationModel(
      id: _uuid.v4(),
      memberId: memberId,
      message: message,
      createdAt: DateTime.now().toIso8601String(),
      readStatus: false,
    );
    _notifications.insert(0, newNotif);
    _saveNotifications();
    SupabaseService.upsertNotification(newNotif);
  }

  Future<void> markNotificationAsRead(String id) async {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications[idx] = _notifications[idx].copyWith(readStatus: true);
      await _saveNotifications();
      notifyListeners();
      SupabaseService.upsertNotification(_notifications[idx]);
    }
  }

  Future<void> markAllNotificationsAsRead() async {
    _notifications = _notifications.map((n) => n.copyWith(readStatus: true)).toList();
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> deleteNotification(String id) async {
    _notifications.removeWhere((n) => n.id == id);
    await _saveNotifications();
    notifyListeners();
  }

  Future<void> clearAllNotifications() async {
    _notifications.clear();
    await _saveNotifications();
    notifyListeners();
  }

  // ----------------------------------------------------
  // Settings & Sports Management
  // ----------------------------------------------------
  Future<void> updateSettings(GymSettings newSettings) async {
    _settings = newSettings;
    await _saveSettings();
    notifyListeners();
    SupabaseService.upsertSettings(newSettings);
  }

  Future<void> addSport(String sportName) async {
    final clean = sportName.trim();
    if (clean.isNotEmpty && !_settings.sports.contains(clean)) {
      final updatedSports = List<String>.from(_settings.sports)..add(clean);
      await updateSettings(_settings.copyWith(sports: updatedSports));
    }
  }

  Future<void> renameSport(String oldName, String newName) async {
    final clean = newName.trim();
    if (clean.isEmpty || clean == oldName) return;

    final updatedSports = _settings.sports.map((s) => s == oldName ? clean : s).toList();
    await updateSettings(_settings.copyWith(sports: updatedSports));

    // Update all members using this sport
    for (var i = 0; i < _members.length; i++) {
      if (_members[i].sportType == oldName) {
        _members[i] = _members[i].copyWith(sportType: clean);
        SupabaseService.upsertMember(_members[i]);
      }
    }
    await _saveMembers();
    notifyListeners();
  }

  Future<void> deleteSport(String sportName, {String fallbackSport = 'Other'}) async {
    if (_settings.sports.length <= 1) return;

    final updatedSports = _settings.sports.where((s) => s != sportName).toList();
    if (!updatedSports.contains(fallbackSport)) {
      fallbackSport = updatedSports.first;
    }
    await updateSettings(_settings.copyWith(sports: updatedSports));

    // Reassign members
    for (var i = 0; i < _members.length; i++) {
      if (_members[i].sportType == sportName) {
        _members[i] = _members[i].copyWith(sportType: fallbackSport);
        SupabaseService.upsertMember(_members[i]);
      }
    }
    await _saveMembers();
    notifyListeners();
  }

  // ----------------------------------------------------
  // Supabase Full Cloud Sync
  // ----------------------------------------------------
  Future<Map<String, dynamic>> syncFromSupabase() async {
    _isSyncing = true;
    notifyListeners();

    try {
      final remoteMembers = await SupabaseService.fetchMembers();
      if (remoteMembers.isNotEmpty) {
        _members = remoteMembers;
        await _saveMembers();
      }

      final remoteAttendance = await SupabaseService.fetchAttendance();
      if (remoteAttendance.isNotEmpty) {
        _attendance = remoteAttendance;
        await _saveAttendance();
      }

      final remoteNotifs = await SupabaseService.fetchNotifications();
      if (remoteNotifs.isNotEmpty) {
        _notifications = remoteNotifs;
        await _saveNotifications();
      }

      final remoteSettings = await SupabaseService.fetchSettings();
      if (remoteSettings != null) {
        _settings = remoteSettings;
        await _saveSettings();
      }

      _checkSubscriptionsExpiry();
      _isSyncing = false;
      notifyListeners();
      return {'success': true, 'message': 'تمت المزامنة وجلب البيانات بنجاح من Supabase!'};
    } catch (e) {
      _isSyncing = false;
      notifyListeners();
      return {'success': false, 'message': 'تعذر جلب البيانات من Supabase: $e'};
    }
  }

  Future<Map<String, dynamic>> pushAllToSupabase() async {
    _isSyncing = true;
    notifyListeners();

    try {
      for (final m in _members) {
        await SupabaseService.upsertMember(m);
      }
      for (final a in _attendance) {
        await SupabaseService.upsertAttendance(a);
      }
      for (final n in _notifications) {
        await SupabaseService.upsertNotification(n);
      }
      await SupabaseService.upsertSettings(_settings);

      _isSyncing = false;
      notifyListeners();
      return {'success': true, 'message': 'تم رفع ومزامنة كافة البيانات المحلية إلى Supabase بنجاح!'};
    } catch (e) {
      _isSyncing = false;
      notifyListeners();
      return {'success': false, 'message': 'خطأ أثناء الرفع إلى Supabase: $e'};
    }
  }

  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------
  Future<bool> login(String email, String password) async {
    final hash = sha256.convert(utf8.encode(password)).toString();
    final prefs = await SharedPreferences.getInstance();
    
    // Simple verification
    _currentUser = GymUser(
      email: email,
      passwordHash: hash,
      clubName: _settings.clubName,
      clubWhatsapp: _settings.clubWhatsapp,
      createdAt: DateTime.now().toIso8601String(),
    );
    await prefs.setString(keyAuth, _currentUser!.toJson());
    notifyListeners();
    return true;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyAuth);
    _currentUser = null;
    notifyListeners();
  }
}
