import 'dart:convert';

/// Member Model
class Member {
  final String id;
  final String fullName;
  final String phone;
  final String? email;
  final bool? emailVerified;
  final String sportType;
  final String startDate; // ISO String (YYYY-MM-DD)
  final String endDate;   // ISO String (YYYY-MM-DD)
  final String barcodeId;
  final String status;    // 'active' | 'expired'
  final double subscriptionFee;
  final String createdAt;

  Member({
    required this.id,
    required this.fullName,
    required this.phone,
    this.email,
    this.emailVerified = false,
    required this.sportType,
    required this.startDate,
    required this.endDate,
    required this.barcodeId,
    required this.status,
    this.subscriptionFee = 250.0,
    required this.createdAt,
  });

  bool get isActive => status == 'active';

  int get daysRemaining {
    try {
      final end = DateTime.parse(endDate);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      return end.difference(today).inDays;
    } catch (_) {
      return 0;
    }
  }

  Member copyWith({
    String? id,
    String? fullName,
    String? phone,
    String? email,
    bool? emailVerified,
    String? sportType,
    String? startDate,
    String? endDate,
    String? barcodeId,
    String? status,
    double? subscriptionFee,
    String? createdAt,
  }) {
    return Member(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      emailVerified: emailVerified ?? this.emailVerified,
      sportType: sportType ?? this.sportType,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      barcodeId: barcodeId ?? this.barcodeId,
      status: status ?? this.status,
      subscriptionFee: subscriptionFee ?? this.subscriptionFee,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'full_name': fullName,
      'phone': phone,
      'email': email,
      'email_verified': emailVerified,
      'sport_type': sportType,
      'start_date': startDate,
      'end_date': endDate,
      'barcode_id': barcodeId,
      'status': status,
      'subscription_fee': subscriptionFee,
      'created_at': createdAt,
    };
  }

  factory Member.fromMap(Map<String, dynamic> map) {
    return Member(
      id: map['id'] ?? '',
      fullName: map['full_name'] ?? '',
      phone: map['phone'] ?? '',
      email: map['email'],
      emailVerified: map['email_verified'] == true,
      sportType: map['sport_type'] ?? 'Gym',
      startDate: map['start_date'] ?? '',
      endDate: map['end_date'] ?? '',
      barcodeId: map['barcode_id'] ?? '',
      status: map['status'] ?? 'active',
      subscriptionFee: (map['subscription_fee'] as num?)?.toDouble() ?? 250.0,
      createdAt: map['created_at'] ?? DateTime.now().toIso8601String(),
    );
  }

  String toJson() => json.encode(toMap());
  factory Member.fromJson(String source) => Member.fromMap(json.decode(source));
}

/// Attendance Record Model
class Attendance {
  final String id;
  final String memberId;
  final String memberName;
  final String checkinTime; // e.g. "14:32"
  final String checkinDate; // e.g. "2026-08-24"
  final String? createdAt;

  Attendance({
    required this.id,
    required this.memberId,
    required this.memberName,
    required this.checkinTime,
    required this.checkinDate,
    this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'member_id': memberId,
      'member_name': memberName,
      'checkin_time': checkinTime,
      'checkin_date': checkinDate,
      'created_at': createdAt ?? DateTime.now().toIso8601String(),
    };
  }

  factory Attendance.fromMap(Map<String, dynamic> map) {
    return Attendance(
      id: map['id'] ?? '',
      memberId: map['member_id'] ?? '',
      memberName: map['member_name'] ?? '',
      checkinTime: map['checkin_time'] ?? '',
      checkinDate: map['checkin_date'] ?? '',
      createdAt: map['created_at'],
    );
  }

  String toJson() => json.encode(toMap());
  factory Attendance.fromJson(String source) => Attendance.fromMap(json.decode(source));
}

/// Notification Model
class NotificationModel {
  final String id;
  final String memberId;
  final String message;
  final String createdAt;
  final bool readStatus;

  NotificationModel({
    required this.id,
    required this.memberId,
    required this.message,
    required this.createdAt,
    this.readStatus = false,
  });

  NotificationModel copyWith({
    String? id,
    String? memberId,
    String? message,
    String? createdAt,
    bool? readStatus,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      message: message ?? this.message,
      createdAt: createdAt ?? this.createdAt,
      readStatus: readStatus ?? this.readStatus,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'member_id': memberId,
      'message': message,
      'created_at': createdAt,
      'read_status': readStatus,
    };
  }

  factory NotificationModel.fromMap(Map<String, dynamic> map) {
    return NotificationModel(
      id: map['id'] ?? '',
      memberId: map['member_id'] ?? '',
      message: map['message'] ?? '',
      createdAt: map['created_at'] ?? DateTime.now().toIso8601String(),
      readStatus: map['read_status'] == true,
    );
  }

  String toJson() => json.encode(toMap());
  factory NotificationModel.fromJson(String source) => NotificationModel.fromMap(json.decode(source));
}

/// Gym Settings
class GymSettings {
  final String clubName;
  final String clubWhatsapp;
  final String ownerEmail;
  final List<String> sports;

  GymSettings({
    this.clubName = 'إدارة جم كلوب',
    this.clubWhatsapp = '212612345678',
    this.ownerEmail = 'owner@gymclub.com',
    this.sports = const ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'],
  });

  GymSettings copyWith({
    String? clubName,
    String? clubWhatsapp,
    String? ownerEmail,
    List<String>? sports,
  }) {
    return GymSettings(
      clubName: clubName ?? this.clubName,
      clubWhatsapp: clubWhatsapp ?? this.clubWhatsapp,
      ownerEmail: ownerEmail ?? this.ownerEmail,
      sports: sports ?? this.sports,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'club_name': clubName,
      'club_whatsapp': clubWhatsapp,
      'owner_email': ownerEmail,
      'sports': sports,
    };
  }

  factory GymSettings.fromMap(Map<String, dynamic> map) {
    return GymSettings(
      clubName: map['club_name'] ?? 'إدارة جم كلوب',
      clubWhatsapp: map['club_whatsapp'] ?? '212612345678',
      ownerEmail: map['owner_email'] ?? 'owner@gymclub.com',
      sports: map['sports'] != null
          ? List<String>.from(map['sports'])
          : const ['Gym', 'Boxing', 'Swimming', 'Fitness', 'Yoga', 'Other'],
    );
  }

  String toJson() => json.encode(toMap());
  factory GymSettings.fromJson(String source) => GymSettings.fromMap(json.decode(source));
}

/// Gym User / Auth
class GymUser {
  final String email;
  final String passwordHash;
  final String clubName;
  final String clubWhatsapp;
  final String createdAt;

  GymUser({
    required this.email,
    required this.passwordHash,
    required this.clubName,
    required this.clubWhatsapp,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'email': email,
      'password_hash': passwordHash,
      'club_name': clubName,
      'club_whatsapp': clubWhatsapp,
      'created_at': createdAt,
    };
  }

  factory GymUser.fromMap(Map<String, dynamic> map) {
    return GymUser(
      email: map['email'] ?? '',
      passwordHash: map['password_hash'] ?? '',
      clubName: map['club_name'] ?? '',
      clubWhatsapp: map['club_whatsapp'] ?? '',
      createdAt: map['created_at'] ?? '',
    );
  }

  String toJson() => json.encode(toMap());
  factory GymUser.fromJson(String source) => GymUser.fromMap(json.decode(source));
}

/// Dashboard Gym Stats
class GymStats {
  final int totalMembers;
  final int attendanceToday;
  final int expiredCount;
  final int expiringSoonCount;

  GymStats({
    required this.totalMembers,
    required this.attendanceToday,
    required this.expiredCount,
    required this.expiringSoonCount,
  });
}
