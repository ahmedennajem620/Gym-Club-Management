/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'fr' | 'en' | 'es';

export interface TranslationDictionary {
  // Navigation & General UI
  app_name_default: string;
  dashboard: string;
  members: string;
  add_member: string;
  coaches: string;
  add_coach: string;
  scanner: string;
  scanner_barcode: string;
  attendance: string;
  notifications: string;
  settings: string;
  logout: string;
  menu: string;
  close_menu: string;
  live_clock: string;
  supabase_connected: string;
  fullscreen: string;
  simulator: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  confirm: string;
  back: string;
  search: string;
  filter: string;
  clear: string;
  all: string;
  yes: string;
  no: string;
  loading: string;
  success: string;
  error: string;
  actions: string;
  details: string;
  status: string;
  active: string;
  expired: string;
  expiring_soon: string;
  inactive: string;
  currency: string;
  days_left: string;
  days: string;
  today: string;
  yesterday: string;
  print: string;
  download_badge: string;
  share_whatsapp: string;
  check_in: string;
  checked_in: string;

  // Sports Translation
  sports_title: string;
  sport_gym: string;
  sport_boxing: string;
  sport_swimming: string;
  sport_fitness: string;
  sport_yoga: string;
  sport_cardio: string;
  sport_crossfit: string;
  sport_kickboxing: string;
  sport_pilates: string;
  sport_karate: string;
  sport_taekwondo: string;
  sport_judo: string;
  sport_mma: string;
  sport_wrestling: string;
  sport_gymnastics: string;
  sport_zumba: string;
  sport_aerobics: string;
  sport_spinning: string;
  sport_calisthenics: string;
  sport_powerlifting: string;
  sport_other: string;

  // Dashboard
  dash_welcome_title: string;
  dash_welcome_sub: string;
  stat_total_members: string;
  stat_attendance_today: string;
  stat_expiring_soon: string;
  stat_expired: string;
  stat_total_coaches: string;
  stat_coaches_present: string;
  dash_quick_actions: string;
  dash_recent_attendance: string;
  dash_no_attendance_today: string;
  dash_view_all_logs: string;
  dash_chart_title: string;
  dash_registered_athletes: string;

  // Members Screen
  members_title: string;
  members_subtitle: string;
  members_search_placeholder: string;
  members_filter_all: string;
  members_filter_active: string;
  members_filter_expiring: string;
  members_filter_expired: string;
  members_empty: string;
  members_no_results: string;
  member_card_title: string;
  member_id: string;
  member_phone: string;
  member_email: string;
  member_start_date: string;
  member_end_date: string;
  member_fee: string;
  member_barcode: string;
  member_renew: string;
  member_renew_title: string;
  member_renew_sub: string;
  member_delete_confirm_title: string;
  member_delete_confirm_msg: string;
  member_quick_renew_1m: string;
  member_quick_renew_3m: string;
  member_quick_renew_6m: string;
  member_quick_renew_1y: string;

  // Member Form
  member_form_create_title: string;
  member_form_edit_title: string;
  member_form_name_label: string;
  member_form_name_placeholder: string;
  member_form_phone_label: string;
  member_form_phone_placeholder: string;
  member_form_phone_hint: string;
  member_form_sport_label: string;
  member_form_start_label: string;
  member_form_duration_label: string;
  member_form_duration_1m: string;
  member_form_duration_3m: string;
  member_form_duration_6m: string;
  member_form_duration_1y: string;
  member_form_duration_custom: string;
  member_form_end_label: string;
  member_form_fee_label: string;
  member_form_fee_placeholder: string;
  member_form_submit_create: string;
  member_form_submit_update: string;

  // Coaches Screen
  coaches_title: string;
  coaches_subtitle: string;
  coaches_search_placeholder: string;
  coaches_filter_all: string;
  coaches_filter_active: string;
  coaches_filter_inactive: string;
  coaches_empty: string;
  coaches_no_results: string;
  coach_card_title: string;
  coach_id: string;
  coach_specialty: string;
  coach_salary: string;
  coach_hire_date: string;
  coach_notes: string;
  coach_check_in_btn: string;
  coach_delete_confirm_title: string;
  coach_delete_confirm_msg: string;
  coach_badge_title: string;

  // Coach Form
  coach_form_create_title: string;
  coach_form_edit_title: string;
  coach_form_name_label: string;
  coach_form_name_placeholder: string;
  coach_form_phone_label: string;
  coach_form_phone_placeholder: string;
  coach_form_email_label: string;
  coach_form_email_placeholder: string;
  coach_form_specialty_label: string;
  coach_form_salary_label: string;
  coach_form_salary_placeholder: string;
  coach_form_hire_label: string;
  coach_form_status_label: string;
  coach_form_notes_label: string;
  coach_form_notes_placeholder: string;
  coach_form_submit_create: string;
  coach_form_submit_update: string;

  // Scanner Screen
  scanner_title: string;
  scanner_subtitle: string;
  scanner_camera_tab: string;
  scanner_manual_tab: string;
  scanner_camera_start: string;
  scanner_camera_stop: string;
  scanner_camera_instruction: string;
  scanner_manual_placeholder: string;
  scanner_manual_submit: string;
  scanner_sound_toggle: string;
  scanner_simulator_title: string;
  scanner_simulator_hint: string;
  scanner_test_member: string;
  scanner_test_coach: string;
  scanner_result_valid_member: string;
  scanner_result_valid_coach: string;
  scanner_result_expired: string;
  scanner_result_not_found: string;
  scanner_result_already_checked: string;
  scanner_recent_title: string;
  scanner_member_badge: string;
  scanner_coach_badge: string;

  // Attendance Logs
  att_title: string;
  att_subtitle: string;
  att_search_placeholder: string;
  att_filter_all: string;
  att_filter_members: string;
  att_filter_coaches: string;
  att_date_filter: string;
  att_empty: string;
  att_no_results: string;
  att_col_name: string;
  att_col_id: string;
  att_col_role_sport: string;
  att_col_time: string;
  att_col_date: string;
  att_col_actions: string;
  att_stat_total_visits: string;
  att_stat_members: string;
  att_stat_coaches: string;
  att_clear_all_btn: string;
  att_clear_confirm_title: string;
  att_clear_confirm_msg: string;
  att_delete_confirm_title: string;
  att_delete_confirm_msg: string;
  att_scanner_tips: string;
  att_scanner_tips_desc: string;

  // Notifications
  notif_title: string;
  notif_subtitle: string;
  notif_empty: string;
  notif_mark_read: string;
  notif_clear_all: string;
  notif_unread_count: string;
  notif_read: string;
  notif_unread: string;

  // Settings Screen
  settings_title: string;
  settings_subtitle: string;
  settings_desc: string;
  language_select: string;
  language_desc: string;
  settings_section_general: string;
  settings_club_name_label: string;
  settings_whatsapp_label: string;
  settings_email_label: string;
  settings_section_sports: string;
  settings_sports_desc: string;
  settings_add_sport_placeholder: string;
  settings_add_sport_btn: string;
  settings_sport_enrolled: string;
  settings_delete_sport_confirm: string;
  settings_section_supabase: string;
  settings_supabase_desc: string;
  settings_supabase_test: string;
  settings_supabase_pull: string;
  settings_supabase_push: string;
  settings_supabase_copy_sql: string;
  settings_supabase_view_sql: string;
  settings_section_lang: string;
  settings_lang_desc: string;
  settings_lang_ar: string;
  settings_lang_fr: string;
  settings_lang_en: string;
  settings_lang_es: string;

  // PDF Export Modal & Report
  pdf_export_btn: string;
  pdf_export_title: string;
  pdf_export_desc: string;
  pdf_export_all: string;
  pdf_export_members: string;
  pdf_export_coaches: string;
  pdf_export_attendance: string;
  pdf_export_generating: string;
  pdf_export_download_now: string;
  pdf_export_preview: string;
  pdf_export_summary_stats: string;
  pdf_export_financial: string;
  pdf_export_generated_at: string;
  pdf_export_close: string;
  pdf_export_print: string;

  // Quick Checkin & Dashboard Enhancements
  quick_checkin_title: string;
  quick_checkin_subtitle: string;
  quick_checkin_placeholder: string;
  quick_checkin_btn: string;
  quick_checkin_no_results: string;
  quick_renew_btn: string;
  daily_cash_title: string;
  daily_cash_subtitle: string;
  daily_revenue_label: string;
  daily_new_subs_label: string;
  daily_close_shift: string;
  filter_expiring: string;

  // Login Screen
  login_title: string;
  login_subtitle: string;
  login_email_label: string;
  login_password_label: string;
  login_submit: string;
  login_demo_btn: string;
  login_welcome_back: string;
  login_feature_1: string;
  login_feature_2: string;
  login_feature_3: string;
  login_feature_4: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  ar: {
    // Navigation & General UI
    app_name_default: 'GymFlow',
    dashboard: 'الرئيسية',
    members: 'المشتركين',
    add_member: 'إضافة مشترك',
    coaches: 'المدربين',
    add_coach: 'إضافة مدرب',
    scanner: 'جهاز الماسح',
    scanner_barcode: 'جهاز الماسح (باركود)',
    attendance: 'سجل الحضور',
    notifications: 'التنبيهات',
    settings: 'الإعدادات',
    logout: 'خروج',
    menu: 'القائمة',
    close_menu: 'إغلاق',
    live_clock: 'الساعة الحية',
    supabase_connected: 'Supabase سحابي',
    fullscreen: 'شاشة كاملة',
    simulator: 'محاكي هاتف',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    confirm: 'تأكيد',
    back: 'رجوع',
    search: 'بحث',
    filter: 'تصفية',
    clear: 'مسح',
    all: 'الكل',
    yes: 'نعم',
    no: 'لا',
    loading: 'جاري التحميل...',
    success: 'تم بنجاح',
    error: 'حدث خطأ',
    actions: 'إجراءات',
    details: 'التفاصيل',
    status: 'الحالة',
    active: 'نشط وصالح',
    expired: 'منتهي الصلاحية',
    expiring_soon: 'ينتهي قريباً',
    inactive: 'غير نشط',
    currency: 'درهم',
    days_left: 'أيام متبقية',
    days: 'أيام',
    today: 'اليوم',
    yesterday: 'أمس',
    print: 'طباعة البطاقة',
    download_badge: 'تحميل الشارة',
    share_whatsapp: 'مشاركة عبر واتساب',
    check_in: 'تسجيل الحضور',
    checked_in: 'تم تسجيل الحضور',

    // Sports Translation
    sports_title: 'الرياضات والأنشطة',
    sport_gym: 'كمال الأجسام / جيم',
    sport_boxing: 'الملاكمة',
    sport_swimming: 'السباحة',
    sport_fitness: 'اللياقة البدنية',
    sport_yoga: 'اليوجا',
    sport_cardio: 'كارديو',
    sport_crossfit: 'كروس فيت',
    sport_kickboxing: 'كيك بوكسينغ',
    sport_pilates: 'بيلاتس',
    sport_karate: 'كاراتيه',
    sport_taekwondo: 'تايكوندو',
    sport_judo: 'جودو',
    sport_mma: 'فنون قتالية (MMA)',
    sport_wrestling: 'المصارعة',
    sport_gymnastics: 'الجمباز',
    sport_zumba: 'زومبا',
    sport_aerobics: 'أيروبيك',
    sport_spinning: 'سبينينغ / دراجات',
    sport_calisthenics: 'كاليسثينيكس',
    sport_powerlifting: 'باور ليفتينغ',
    sport_other: 'أخرى',

    // Dashboard
    dash_welcome_title: 'لوحة التحكم والأنشطة اليومية',
    dash_welcome_sub: 'متابعة حية لاشتراكات المشتركين، حضور الأعضاء والمدربين، وتنبيهات التجديد الفورية',
    stat_total_members: 'إجمالي المشتركين',
    stat_attendance_today: 'حضور اليوم',
    stat_expiring_soon: 'اشتراكات تنتهي قريباً',
    stat_expired: 'اشتراكات منتهية',
    stat_total_coaches: 'إجمالي المدربين',
    stat_coaches_present: 'المدربين الحاضرين اليوم',
    dash_quick_actions: 'إجراءات سريعة',
    dash_recent_attendance: 'آخر الحاضرين اليوم',
    dash_no_attendance_today: 'لم يتم تسجيل أي حضور اليوم حتى الآن. استخدم الماسح للبدء.',
    dash_view_all_logs: 'عرض سجل الحضور الكامل',
    dash_chart_title: 'معدل الحضور والأنشطة',
    dash_registered_athletes: 'عضو مسجل بالمركز',

    // Members Screen
    members_title: 'دليل وإدارة المشتركين',
    members_subtitle: 'إدارة شاملة لبطاقات العضوية، تجديد الاشتراكات، والتحكم بالبيانات',
    members_search_placeholder: 'البحث باسم المشترك، رقم الهاتف، أو كود الباركود...',
    members_filter_all: 'الكل',
    members_filter_active: 'النشطين',
    members_filter_expiring: 'ينتهي قريباً',
    members_filter_expired: 'المنتهية',
    members_empty: 'لا يوجد مشتركون مسجلون حالياً. اضغط "إضافة مشترك" للبدء.',
    members_no_results: 'لم يتم العثور على أي مشترك يطابق معايير البحث والفلترة.',
    member_card_title: 'بطاقة العضوية الرسمية',
    member_id: 'معرف المشترك',
    member_phone: 'رقم الهاتف',
    member_email: 'البريد الإلكتروني',
    member_start_date: 'تاريخ البدء',
    member_end_date: 'تاريخ الانتهاء',
    member_fee: 'رسوم الاشتراك',
    member_barcode: 'رمز الباركود',
    member_renew: 'تجديد الاشتراك',
    member_renew_title: 'تجديد اشتراك العضو',
    member_renew_sub: 'اختر مدة التجديد لإطالة فترة الصلاحية وتحديث الحساب تلقائياً',
    member_delete_confirm_title: 'تأكيد حذف المشترك',
    member_delete_confirm_msg: 'هل أنت متأكد من رغبتك في حذف هذا العضو؟ سيتم مسح بطاقته وسجلاته نهائياً.',
    member_quick_renew_1m: 'شهر واحد (+1 شهر)',
    member_quick_renew_3m: '3 أشهر (+3 أشهر)',
    member_quick_renew_6m: '6 أشهر (+6 أشهر)',
    member_quick_renew_1y: 'سنة كاملة (+سنة)',

    // Member Form
    member_form_create_title: 'إضافة مشترك جديد للمركز',
    member_form_edit_title: 'تعديل بيانات المشترك',
    member_form_name_label: 'الاسم بالكامل للمشترك',
    member_form_name_placeholder: 'مثال: أحمد عبد الرحمن',
    member_form_phone_label: 'رقم الهاتف والواتساب للمشترك',
    member_form_phone_placeholder: 'مثال: 612345678 أو 0612345678',
    member_form_phone_hint: '* سيتم ربط الرقم تلقائياً برمز الاتصال الدولي للمغرب (+212) للتواصل وإرسال بطاقات العضوية عبر واتساب.',
    member_form_sport_label: 'نوع الرياضة والنشاط',
    member_form_start_label: 'تاريخ بداية الاشتراك',
    member_form_duration_label: 'مدة الاشتراك المحددة',
    member_form_duration_1m: 'شهر واحد',
    member_form_duration_3m: '3 أشهر',
    member_form_duration_6m: '6 أشهر',
    member_form_duration_1y: 'سنة كاملة',
    member_form_duration_custom: 'مخصص',
    member_form_end_label: 'تاريخ انتهاء الاشتراك',
    member_form_fee_label: 'رسوم الاشتراك (درهم)',
    member_form_fee_placeholder: '250',
    member_form_submit_create: 'تسجيل المشترك وإصدار الباركود',
    member_form_submit_update: 'حفظ التعديلات وتحديث البيانات',

    // Coaches Screen
    coaches_title: 'دليل وإدارة المدربين والكباتن',
    coaches_subtitle: 'قائمة بكافة المدربين المعتمدين بالمركز مع شارات الحضور والتخصصات الرياضية',
    coaches_search_placeholder: 'البحث باسم المدرب، التخصص، أو الرمز...',
    coaches_filter_all: 'الكل',
    coaches_filter_active: 'المدربين النشطين',
    coaches_filter_inactive: 'غير النشطين',
    coaches_empty: 'لا يوجد مدربون مسجلون حالياً. اضغط "إضافة مدرب" لتسجيل الكباتن.',
    coaches_no_results: 'لم يتم العثور على أي مدرب يطابق معايير البحث والفلترة.',
    coach_card_title: 'بطاقة اعتماد المدرب',
    coach_id: 'معرف المدرب',
    coach_specialty: 'التخصص التدريبي',
    coach_salary: 'المقابل الشهري / الراتب',
    coach_hire_date: 'تاريخ بدء العمل',
    coach_notes: 'ملاحظات وسيرة تدريبية',
    coach_check_in_btn: 'تسجيل حضور المدرب',
    coach_delete_confirm_title: 'تأكيد حذف المدرب',
    coach_delete_confirm_msg: 'هل أنت متأكد من حذف هذا المدرب؟ سيتم مسح بطاقته واعتماده من النظام.',
    coach_badge_title: 'شارة الاعتماد الرسمي',

    // Coach Form
    coach_form_create_title: 'إضافة مدرب / كابتن جديد',
    coach_form_edit_title: 'تعديل بيانات المدرب',
    coach_form_name_label: 'الاسم بالكامل للكابتن / المدرب',
    coach_form_name_placeholder: 'مثال: الكابتن طارق الحسني',
    coach_form_phone_label: 'رقم الهاتف والواتساب',
    coach_form_phone_placeholder: 'مثال: 661234567',
    coach_form_email_label: 'البريد الإلكتروني المهني (اختياري)',
    coach_form_email_placeholder: 'coach@gymclub.com',
    coach_form_specialty_label: 'التخصص الرياضي الرئيسي',
    coach_form_salary_label: 'الراتب أو المقابل الشهري (درهم)',
    coach_form_salary_placeholder: 'مثال: 4500',
    coach_form_hire_label: 'تاريخ بداية العمل / التعيين',
    coach_form_status_label: 'حالة المدرب',
    coach_form_notes_label: 'ملاحظات أو مؤهلات تدريبية',
    coach_form_notes_placeholder: 'أضف أي بطولات أو شواهد أو ملاحظات خاصة بالمدرب...',
    coach_form_submit_create: 'تسجيل المدرب وإنشاء الباركود',
    coach_form_submit_update: 'حفظ وتحديث بيانات المدرب',

    // Scanner Screen
    scanner_title: 'الماسح الضوئي الذكي (Barcode & QR Scanner)',
    scanner_subtitle: 'مسح فوري لبطاقات المشتركين والمدربين للتحقق من الصلاحية وتسجيل الحضور آلياً',
    scanner_camera_tab: 'مسح عبر الكاميرا',
    scanner_manual_tab: 'إدخال يدوي / قارئ ليزر',
    scanner_camera_start: 'تشغيل الكاميرا',
    scanner_camera_stop: 'إيقاف الكاميرا',
    scanner_camera_instruction: 'وجّه الكاميرا نحو رمز QR أو الباركود على بطاقة العضو أو شاشة هاتفه',
    scanner_manual_placeholder: 'اكتب كود الباركود هنا (مثال: MBR_10025 أو COA_101) واضغط إدخال...',
    scanner_manual_submit: 'مسح وإثبات الحضور',
    scanner_sound_toggle: 'التنبيه الصوتي',
    scanner_simulator_title: 'شريط محاكاة واختبار المسح السريع',
    scanner_simulator_hint: 'انقر على أي بطاقة لاختبار تسجيل الحضور الفوري دون الحاجة لكاميرا:',
    scanner_test_member: 'مشترك',
    scanner_test_coach: 'مدرب',
    scanner_result_valid_member: 'تم تسجيل حضور المشترك بنجاح!',
    scanner_result_valid_coach: 'تم تسجيل حضور الكابتن / المدرب بنجاح!',
    scanner_result_expired: 'تنبيه: اشتراك هذا المشترك منتهي الصلاحية!',
    scanner_result_not_found: 'عذراً، هذا الباركود غير مسجل في النظام!',
    scanner_result_already_checked: 'تم تسجيل حضور هذا الشخص مسبقاً اليوم.',
    scanner_recent_title: 'آخر عمليات المسح اليوم',
    scanner_member_badge: 'مشترك',
    scanner_coach_badge: 'كابتن / مدرب',

    // Attendance Logs
    att_title: 'سجل وسجلات الحضور اليومية',
    att_subtitle: 'قائمة بجميع المشتركين والمدربين الذين تم مسح أكوادهم وتسجيل حضورهم بالمركز',
    att_search_placeholder: 'البحث بالاسم أو الرمز أو الرياضة...',
    att_filter_all: 'الكل',
    att_filter_members: 'المشتركين',
    att_filter_coaches: 'المدربين',
    att_date_filter: 'تاريخ محدد',
    att_empty: 'سجل الحضور فارغ تماماً حالياً. قم بمسح الرموز لتسجيل الدخول.',
    att_no_results: 'لم يتم العثور على أي عمليات حضور تطابق معايير البحث والفلترة.',
    att_col_name: 'الاسم بالكامل',
    att_col_id: 'المعرف (ID)',
    att_col_role_sport: 'الصفة / الرياضة',
    att_col_time: 'وقت الدخول',
    att_col_date: 'تاريخ الحضور',
    att_col_actions: 'إجراءات',
    att_stat_total_visits: 'عدد الزيارات الإجمالية',
    att_stat_members: 'حضور المشتركين',
    att_stat_coaches: 'حضور المدربين والكباتن',
    att_clear_all_btn: 'تفريغ ومسح السجل بالكامل',
    att_clear_confirm_title: 'تفريغ سجل الحضور بالكامل',
    att_clear_confirm_msg: 'سيتم مسح جميع سجلات الحضور السابقة نهائياً. هل ترغب في المتابعة؟',
    att_delete_confirm_title: 'تأكيد حذف الحضور',
    att_delete_confirm_msg: 'هل أنت متأكد من رغبتك في حذف هذا السجل؟',
    att_scanner_tips: 'تعليمات المسح الضوئي',
    att_scanner_tips_desc: 'يقوم النظام تلقائياً بتمييز بطاقات المشتركين والمدربين عند مسح الباركود، والتحقق من صلاحية الاشتراك وحالة النشاط فورياً.',

    // Notifications
    notif_title: 'مركز التنبيهات والإشعارات الذكية',
    notif_subtitle: 'متابعة تلقائية للاشتراكات المنتهية والتي قاربت على الانتهاء لتجديدها بالوقت المناسب',
    notif_empty: 'لا توجد أي إشعارات أو تنبيهات معلقة حالياً. كل الاشتراكات محدثة!',
    notif_mark_read: 'تعليم كمقروء',
    notif_clear_all: 'مسح جميع التنبيهات',
    notif_unread_count: 'تنبيه جديد',
    notif_read: 'مقروء',
    notif_unread: 'غير مقروء',

    // Settings Screen
    settings_title: 'إعدادات النادي وإدارة الرياضات',
    settings_subtitle: 'تعديل بيانات النادي، إدارة الرياضات والأنشطة، إعدادات اللغة، ومزامنة السحابة',
    settings_desc: 'تعديل بيانات النادي، إدارة الرياضات والأنشطة، إعدادات اللغة، ومزامنة السحابة',
    language_select: 'اختيار لغة النظام (Language)',
    language_desc: 'اختر لغة واجهة النظام المفضلة لديك. يتم تعريب كافة الشاشات والقوائم وأسماء الرياضات تلقائياً.',
    settings_section_general: 'البيانات الأساسية وحساب المالك',
    settings_club_name_label: 'اسم النادي الرياضي الحالي',
    settings_whatsapp_label: 'رقم واتساب النادي للإشعارات (برموز دولية)',
    settings_email_label: 'البريد الإلكتروني المعتمد للمالك',
    settings_section_sports: 'إدارة وتخصيص الرياضات والأنشطة',
    settings_sports_desc: 'يمكنك إضافة أنشطة رياضية جديدة أو تعديل مسمياتها. التعديل ينعكس تلقائياً على كافة المشتركين المسجلين بها.',
    settings_add_sport_placeholder: 'اسم الرياضة الجديدة (مثال: كاراتيه، كروس فيت...)',
    settings_add_sport_btn: 'إضافة رياضة',
    settings_sport_enrolled: 'مشترك مسجل',
    settings_delete_sport_confirm: 'هل أنت متأكد من حذف هذه الرياضة؟ سيتم تحويل المشتركين المسجلين بها إلى رياضة أخرى.',
    settings_section_supabase: 'قاعدة البيانات السحابية والمزامنة (Supabase Cloud)',
    settings_supabase_desc: 'مزامنة كاملة ثنائية الاتجاه مع قاعدة بيانات PostgreSQL على Supabase لحفظ بيانات المشتركين والمدربين بأمان.',
    settings_supabase_test: 'فحص الاتصال بقاعدة البيانات',
    settings_supabase_pull: 'سحب البيانات من السحابة',
    settings_supabase_push: 'رفع البيانات المحلية للسحابة',
    settings_supabase_copy_sql: 'نسخ كود الجداول (SQL Schema)',
    settings_supabase_view_sql: 'عرض كود SQL',
    settings_section_lang: 'إعدادات لغة التطبيق (Language)',
    settings_lang_desc: 'اختر لغة واجهة النظام المفضلة لديك. يتم تعريب كافة الشاشات والقوائم وأسماء الرياضات تلقائياً.',
    settings_lang_ar: 'العربية (Arabic)',
    settings_lang_fr: 'Français (French)',
    settings_lang_en: 'English (English)',
    settings_lang_es: 'Español (Spanish)',

    // PDF Export Modal & Report
    pdf_export_btn: 'تنزيل PDF البيانات',
    pdf_export_title: 'تصدير تقرير بيانات النادي (PDF)',
    pdf_export_desc: 'توليد ملف PDF متكامل وعالي الدقة يحتوي على كافة بيانات المشتركين، المدربين، السجلات والإحصائيات المالية',
    pdf_export_all: 'التقرير الشامل الكامل لكافة البيانات',
    pdf_export_members: 'تقرير سجل المشتركين والاشتراكات',
    pdf_export_coaches: 'تقرير كادر المدربين والرواتب',
    pdf_export_attendance: 'تقرير سجلات الحضور اليومية',
    pdf_export_generating: 'جارٍ تجهيز وتحميل ملف الـ PDF...',
    pdf_export_download_now: 'تنزيل تقرير الـ PDF الآن',
    pdf_export_preview: 'معاينة التقرير',
    pdf_export_summary_stats: 'ملخص المؤشرات والإحصائيات',
    pdf_export_financial: 'التقرير المالي والاشتراكات',
    pdf_export_generated_at: 'تاريخ وتوقيت التوليد',
    pdf_export_close: 'إغلاق',
    pdf_export_print: 'طباعة التقرير',

    // Quick Checkin & Dashboard Enhancements
    quick_checkin_title: 'تسجيل الحضور السريع',
    quick_checkin_subtitle: 'ابحث بالاسم، رقم الهاتف أو الباركود لتسجيل الحضور يدوياً وفوراً إذا نسي المشترك بطاقته',
    quick_checkin_placeholder: 'ابحث بالاسم، رقم الهاتف أو الباركود...',
    quick_checkin_btn: 'تسجيل الحضور الآن',
    quick_checkin_no_results: 'لا توجد نتائج مطابقة',
    quick_renew_btn: 'تجديد سريع (+ شهر)',
    daily_cash_title: 'خزينة اليوم والمدخولات السريعة',
    daily_cash_subtitle: 'ملخص المقبوضات والاشتراكات لتقفيل وردية الاستقبال اليومية',
    daily_revenue_label: 'إجمالي مدخولات اليوم',
    daily_new_subs_label: 'اشتراكات وعمليات اليوم',
    daily_close_shift: 'طباعة تقرير الوردية',
    filter_expiring: 'تنتهي قريباً (3 أيام)',

    // Login Screen
    login_title: 'تسجيل دخول الإدارة',
    login_subtitle: 'نظام إدارة الجيم الذكي ومسح الباركود',
    login_email_label: 'البريد الإلكتروني للمدير / المسؤول',
    login_password_label: 'كلمة المرور',
    login_submit: 'تسجيل الدخول',
    login_demo_btn: 'دخول تجريبي سريع',
    login_welcome_back: 'مرحباً بك مجدداً في GymFlow',
    login_feature_1: 'مسح فوري للباركود وQR Code بالكاميرا والقارئ الليزري',
    login_feature_2: 'إدارة كاملة لاشتراكات المشتركين وحضور المدربين',
    login_feature_3: 'طباعة بطاقات العضوية ومشاركتها عبر WhatsApp بنقرة واحدة',
    login_feature_4: 'مزامنة سحابية وحفظ دائم للبيانات دون فقدانها'
  },

  fr: {
    // Navigation & General UI
    app_name_default: 'GymFlow',
    dashboard: 'Tableau de bord',
    members: 'Adhérents',
    add_member: 'Ajouter un adhérent',
    coaches: 'Entraîneurs',
    add_coach: 'Ajouter un entraîneur',
    scanner: 'Scanner',
    scanner_barcode: 'Scanner Code-barres / QR',
    attendance: 'Présences',
    notifications: 'Notifications',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    menu: 'Menu',
    close_menu: 'Fermer',
    live_clock: 'Horloge en direct',
    supabase_connected: 'Supabase Cloud',
    fullscreen: 'Plein écran',
    simulator: 'Simulateur mobile',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    confirm: 'Confirmer',
    back: 'Retour',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    all: 'Tous',
    yes: 'Oui',
    no: 'Non',
    loading: 'Chargement en cours...',
    success: 'Succès',
    error: 'Erreur',
    actions: 'Actions',
    details: 'Détails',
    status: 'Statut',
    active: 'Actif & Valide',
    expired: 'Expiré',
    expiring_soon: 'Expire bientôt',
    inactive: 'Inactif',
    currency: 'DH',
    days_left: 'jours restants',
    days: 'jours',
    today: "Aujourd'hui",
    yesterday: 'Hier',
    print: 'Imprimer la carte',
    download_badge: 'Télécharger le badge',
    share_whatsapp: 'Partager via WhatsApp',
    check_in: 'Enregistrer la présence',
    checked_in: 'Présence enregistrée',

    // Sports Translation
    sports_title: 'Sports & Activités',
    sport_gym: 'Musculation / Gym',
    sport_boxing: 'Boxe',
    sport_swimming: 'Natation',
    sport_fitness: 'Fitness',
    sport_yoga: 'Yoga',
    sport_cardio: 'Cardio-training',
    sport_crossfit: 'CrossFit',
    sport_kickboxing: 'Kickboxing',
    sport_pilates: 'Pilates',
    sport_karate: 'Karaté',
    sport_taekwondo: 'Taekwondo',
    sport_judo: 'Judo',
    sport_mma: 'Arts Martiaux (MMA)',
    sport_wrestling: 'Lutte',
    sport_gymnastics: 'Gymnastique',
    sport_zumba: 'Zumba',
    sport_aerobics: 'Aérobic',
    sport_spinning: 'Spinning / Vélo',
    sport_calisthenics: 'Calisthénie',
    sport_powerlifting: 'Force athlétique',
    sport_other: 'Autre',

    // Dashboard
    dash_welcome_title: 'Tableau de bord et activités journalières',
    dash_welcome_sub: 'Suivi en direct des abonnements, des présences adhérents/coachs et alertes de renouvellement',
    stat_total_members: 'Total Adhérents',
    stat_attendance_today: "Présences aujourd'hui",
    stat_expiring_soon: 'Expire bientôt',
    stat_expired: 'Abonnements expirés',
    stat_total_coaches: 'Total Entraîneurs',
    stat_coaches_present: 'Entraîneurs présents',
    dash_quick_actions: 'Actions rapides',
    dash_recent_attendance: 'Dernières présences enregistrées',
    dash_no_attendance_today: "Aucune présence enregistrée aujourd'hui. Utilisez le scanner pour commencer.",
    dash_view_all_logs: 'Voir tout le registre des présences',
    dash_chart_title: 'Activité & Fréquentation',
    dash_registered_athletes: 'adhérent(s) inscrit(s)',

    // Members Screen
    members_title: 'Gestion des Adhérents',
    members_subtitle: 'Gestion des cartes de membre, renouvellement des abonnements et suivi complet',
    members_search_placeholder: "Rechercher par nom, téléphone, ou code-barres...",
    members_filter_all: 'Tous',
    members_filter_active: 'Actifs',
    members_filter_expiring: 'Bientôt expirés',
    members_filter_expired: 'Expirés',
    members_empty: 'Aucun adhérent enregistré. Cliquez sur "Ajouter un adhérent" pour commencer.',
    members_no_results: 'Aucun adhérent ne correspond aux critères de recherche.',
    member_card_title: 'Carte de membre officielle',
    member_id: 'Identifiant membre',
    member_phone: 'Téléphone',
    member_email: 'E-mail',
    member_start_date: 'Date de début',
    member_end_date: "Date d'expiration",
    member_fee: "Frais d'abonnement",
    member_barcode: 'Code-barres',
    member_renew: 'Renouveler',
    member_renew_title: "Renouvellement de l'adhésion",
    member_renew_sub: 'Choisissez la durée pour prolonger la validité et mettre à jour le compte',
    member_delete_confirm_title: "Confirmer la suppression",
    member_delete_confirm_msg: 'Êtes-vous sûr de vouloir supprimer cet adhérent ? Sa carte et son historique seront effacés.',
    member_quick_renew_1m: '1 Mois (+1 mois)',
    member_quick_renew_3m: '3 Mois (+3 mois)',
    member_quick_renew_6m: '6 Mois (+6 mois)',
    member_quick_renew_1y: '1 An (+1 an)',

    // Member Form
    member_form_create_title: 'Ajouter un nouvel adhérent',
    member_form_edit_title: "Modifier l'adhérent",
    member_form_name_label: 'Nom complet du membre',
    member_form_name_placeholder: 'Ex: Ahmed Benali',
    member_form_phone_label: 'Numéro de téléphone / WhatsApp',
    member_form_phone_placeholder: 'Ex: 612345678 ou 0612345678',
    member_form_phone_hint: '* Le numéro sera automatiquement préfixé avec l’indicatif marocain (+212) pour l’envoi WhatsApp.',
    member_form_sport_label: 'Discipline sportive / Activité',
    member_form_start_label: 'Date de début',
    member_form_duration_label: "Durée de l'abonnement",
    member_form_duration_1m: '1 Mois',
    member_form_duration_3m: '3 Mois',
    member_form_duration_6m: '6 Mois',
    member_form_duration_1y: '1 An',
    member_form_duration_custom: 'Personnalisée',
    member_form_end_label: "Date d'expiration",
    member_form_fee_label: "Frais d'abonnement (DH)",
    member_form_fee_placeholder: '250',
    member_form_submit_create: 'Inscrire le membre et générer le code-barres',
    member_form_submit_update: 'Mettre à jour les informations',

    // Coaches Screen
    coaches_title: 'Gestion des Entraîneurs & Coachs',
    coaches_subtitle: 'Liste des coachs certifiés du club avec leurs spécialités et badges de présence',
    coaches_search_placeholder: 'Rechercher par nom, spécialité ou identifiant...',
    coaches_filter_all: 'Tous',
    coaches_filter_active: 'Coachs actifs',
    coaches_filter_inactive: 'Inactifs',
    coaches_empty: 'Aucun entraîneur enregistré. Cliquez sur "Ajouter un entraîneur" pour commencer.',
    coaches_no_results: 'Aucun entraîneur ne correspond aux critères de recherche.',
    coach_card_title: "Badge officiel de l'entraîneur",
    coach_id: 'Identifiant Coach',
    coach_specialty: 'Spécialité sportive',
    coach_salary: 'Salaire mensuel',
    coach_hire_date: "Date d'embauche",
    coach_notes: 'Notes & qualifications',
    coach_check_in_btn: 'Enregistrer la présence du coach',
    coach_delete_confirm_title: "Confirmer la suppression de l'entraîneur",
    coach_delete_confirm_msg: 'Êtes-vous sûr de vouloir supprimer cet entraîneur du système ?',
    coach_badge_title: 'Badge de certification officielle',

    // Coach Form
    coach_form_create_title: 'Ajouter un nouvel entraîneur',
    coach_form_edit_title: "Modifier l'entraîneur",
    coach_form_name_label: "Nom complet de l'entraîneur",
    coach_form_name_placeholder: 'Ex: Coach Tarek El Hassani',
    coach_form_phone_label: 'Numéro de téléphone / WhatsApp',
    coach_form_phone_placeholder: 'Ex: 661234567',
    coach_form_email_label: 'E-mail professionnel (optionnel)',
    coach_form_email_placeholder: 'coach@gymclub.com',
    coach_form_specialty_label: 'Discipline sportive principale',
    coach_form_salary_label: 'Rémunération mensuelle (DH)',
    coach_form_salary_placeholder: 'Ex: 4500',
    coach_form_hire_label: "Date d'embauche",
    coach_form_status_label: 'Statut du coach',
    coach_form_notes_label: 'Certifications et notes',
    coach_form_notes_placeholder: 'Ajoutez les diplômes, palmarès ou observations...',
    coach_form_submit_create: 'Enregistrer le coach et créer le code-barres',
    coach_form_submit_update: 'Mettre à jour les données du coach',

    // Scanner Screen
    scanner_title: 'Scanner Intelligent (Code-barres & QR)',
    scanner_subtitle: 'Scannez instantanément les cartes membres et coachs pour valider et enregistrer les présences',
    scanner_camera_tab: 'Scan par Caméra',
    scanner_manual_tab: 'Saisie Manuelle / Douchette Laser',
    scanner_camera_start: 'Démarrer la caméra',
    scanner_camera_stop: 'Arrêter la caméra',
    scanner_camera_instruction: 'Pointez la caméra vers le QR Code ou le Code-barres sur la carte ou le smartphone',
    scanner_manual_placeholder: 'Tapez le code-barres ici (ex: MBR_10025 ou COA_101) et appuyez sur Entrée...',
    scanner_manual_submit: 'Scanner et valider',
    scanner_sound_toggle: 'Effets sonores',
    scanner_simulator_title: 'Simulateur de scan rapide pour test',
    scanner_simulator_hint: 'Cliquez sur une carte pour simuler un scan immédiat sans caméra :',
    scanner_test_member: 'Adhérent',
    scanner_test_coach: 'Entraîneur',
    scanner_result_valid_member: "Présence de l'adhérent validée avec succès !",
    scanner_result_valid_coach: "Présence de l'entraîneur enregistrée avec succès !",
    scanner_result_expired: "Attention : L'abonnement de cet adhérent est expiré !",
    scanner_result_not_found: 'Désolé, ce code-barres est introuvable dans le système.',
    scanner_result_already_checked: "Cette personne a déjà enregistré sa présence aujourd'hui.",
    scanner_recent_title: "Derniers scans d'aujourd'hui",
    scanner_member_badge: 'Adhérent',
    scanner_coach_badge: 'Entraîneur',

    // Attendance Logs
    att_title: 'Registre des Présences Journalières',
    att_subtitle: 'Historique de tous les passages enregistrés pour les adhérents et entraîneurs',
    att_search_placeholder: 'Rechercher par nom, identifiant ou sport...',
    att_filter_all: 'Tous',
    att_filter_members: 'Adhérents',
    att_filter_coaches: 'Entraîneurs',
    att_date_filter: 'Filtrer par date',
    att_empty: 'Le registre des présences est vide pour le moment. Scannez un code pour commencer.',
    att_no_results: 'Aucune présence ne correspond à vos critères de recherche.',
    att_col_name: 'Nom complet',
    att_col_id: 'ID',
    att_col_role_sport: 'Rôle / Activité',
    att_col_time: "Heure d'entrée",
    att_col_date: 'Date',
    att_col_actions: 'Actions',
    att_stat_total_visits: 'Nombre total de visites',
    att_stat_members: 'Visites adhérents',
    att_stat_coaches: 'Visites entraîneurs',
    att_clear_all_btn: 'Vider tout le registre',
    att_clear_confirm_title: 'Vider tout le registre des présences',
    att_clear_confirm_msg: 'Toutes les entrées seront définitivement supprimées. Voulez-vous continuer ?',
    att_delete_confirm_title: 'Confirmer la suppression',
    att_delete_confirm_msg: 'Voulez-vous vraiment supprimer cet enregistrement de présence ?',
    att_scanner_tips: 'Instructions de pointage',
    att_scanner_tips_desc: 'Le système distingue automatiquement les membres des coachs, vérifie la validité des abonnements et enregistre l’heure exacte.',

    // Notifications
    notif_title: 'Centre de Notifications Intelligentes',
    notif_subtitle: 'Suivi automatisé des abonnements expirés ou proches de l’échéance pour faciliter le renouvellement',
    notif_empty: 'Aucune notification en attente. Tous les abonnements sont à jour !',
    notif_mark_read: 'Marquer comme lu',
    notif_clear_all: 'Tout effacer',
    notif_unread_count: 'nouvelle(s) alerte(s)',
    notif_read: 'Lu',
    notif_unread: 'Non lu',

    // Settings Screen
    settings_title: 'Paramètres du Club & Gestion des Sports',
    settings_subtitle: 'Personnalisation des données du club, des sports, de la langue et synchronisation Supabase',
    settings_desc: 'Personnalisation des données du club, des sports, de la langue et synchronisation Supabase',
    language_select: 'Sélection de la Langue (Language)',
    language_desc: 'Choisissez votre langue préférée. L’ensemble de l’interface et la liste des sports s’adaptent automatiquement.',
    settings_section_general: 'Informations Générales & Compte Propriétaire',
    settings_club_name_label: 'Nom actuel du club',
    settings_whatsapp_label: 'Numéro WhatsApp officiel du club (avec indicatif)',
    settings_email_label: 'E-mail certifié du gérant',
    settings_section_sports: 'Gestion & Personnalisation des Sports',
    settings_sports_desc: 'Ajoutez de nouvelles disciplines ou renommez les existantes. Les modifications s’appliquent instantanément aux adhérents.',
    settings_add_sport_placeholder: 'Nouveau sport (ex: Karaté, CrossFit...)',
    settings_add_sport_btn: 'Ajouter une discipline',
    settings_sport_enrolled: 'adhérent(s) inscrit(s)',
    settings_delete_sport_confirm: 'Voulez-vous supprimer cette discipline ? Les adhérents concernés seront transférés vers "Autre".',
    settings_section_supabase: 'Base de Données Cloud & Synchronisation (Supabase)',
    settings_supabase_desc: 'Synchronisation bidirectionnelle avec votre base PostgreSQL sur Supabase pour sécuriser vos données.',
    settings_supabase_test: 'Tester la connexion Supabase',
    settings_supabase_pull: 'Télécharger les données du Cloud',
    settings_supabase_push: 'Envoyer les données vers le Cloud',
    settings_supabase_copy_sql: 'Copier le schéma SQL',
    settings_supabase_view_sql: 'Afficher le code SQL',
    settings_section_lang: 'Paramètres de Langue (Language Settings)',
    settings_lang_desc: 'Choisissez votre langue préférée. L’ensemble de l’interface et la liste des sports s’adaptent automatiquement.',
    settings_lang_ar: 'العربية (Arabe)',
    settings_lang_fr: 'Français (French)',
    settings_lang_en: 'English (Anglais)',
    settings_lang_es: 'Español (Espagnol)',

    // PDF Export Modal & Report
    pdf_export_btn: 'Export PDF Données',
    pdf_export_title: 'Rapport des Données du Club (PDF)',
    pdf_export_desc: 'Générez un document PDF haute résolution complet comprenant adhérents, coachs, présences et statistiques financières',
    pdf_export_all: 'Rapport Global Complet',
    pdf_export_members: 'Rapport des Adhérents & Abonnements',
    pdf_export_coaches: 'Rapport des Entraîneurs & Salaires',
    pdf_export_attendance: 'Rapport Historique des Présences',
    pdf_export_generating: 'Génération du document PDF en cours...',
    pdf_export_download_now: 'Télécharger le PDF maintenant',
    pdf_export_preview: 'Aperçu du Rapport',
    pdf_export_summary_stats: 'Résumé des Statistiques & KPI',
    pdf_export_financial: 'Bilan Financier & Cotisations',
    pdf_export_generated_at: 'Généré le',
    pdf_export_close: 'Fermer',
    pdf_export_print: 'Imprimer le Rapport',

    // Quick Checkin & Dashboard Enhancements
    quick_checkin_title: 'Pointage Rapide de Présence',
    quick_checkin_subtitle: 'Recherchez par nom, téléphone ou code-barres pour pointer manuellement si l’adhérent a oublié sa carte',
    quick_checkin_placeholder: 'Nom, téléphone ou code-barres...',
    quick_checkin_btn: 'Pointer maintenant',
    quick_checkin_no_results: 'Aucun résultat trouvé',
    quick_renew_btn: 'Renouveler (+1 mois)',
    daily_cash_title: 'Caisse du Jour & Recettes',
    daily_cash_subtitle: 'Résumé des encaissements et inscriptions pour la clôture de caisse quotidienne',
    daily_revenue_label: 'Recettes totales du jour',
    daily_new_subs_label: 'Opérations & Adhésions du jour',
    daily_close_shift: 'Imprimer le rapport de caisse',
    filter_expiring: 'Expire bientôt (3 jours)',

    // Login Screen
    login_title: "Connexion à l'Administration",
    login_subtitle: 'Système de gestion de salle de sport et pointage par code-barres',
    login_email_label: 'E-mail du gestionnaire',
    login_password_label: 'Mot de passe',
    login_submit: 'Se connecter',
    login_demo_btn: 'Connexion Démo Rapide',
    login_welcome_back: 'Bienvenue sur votre espace GymFlow',
    login_feature_1: 'Scan instantané par caméra et douchette laser',
    login_feature_2: 'Gestion complète des adhérents et présences coachs',
    login_feature_3: 'Impression et partage de badges via WhatsApp en 1 clic',
    login_feature_4: 'Synchronisation Cloud Supabase sécurisée'
  },

  en: {
    // Navigation & General UI
    app_name_default: 'GymFlow',
    dashboard: 'Dashboard',
    members: 'Members',
    add_member: 'Add Member',
    coaches: 'Coaches',
    add_coach: 'Add Coach',
    scanner: 'Scanner',
    scanner_barcode: 'Barcode / QR Scanner',
    attendance: 'Attendance',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    menu: 'Menu',
    close_menu: 'Close',
    live_clock: 'Live Clock',
    supabase_connected: 'Supabase Cloud',
    fullscreen: 'Fullscreen',
    simulator: 'Phone Simulator',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    back: 'Back',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    actions: 'Actions',
    details: 'Details',
    status: 'Status',
    active: 'Active & Valid',
    expired: 'Expired',
    expiring_soon: 'Expiring Soon',
    inactive: 'Inactive',
    currency: 'DH',
    days_left: 'days left',
    days: 'days',
    today: 'Today',
    yesterday: 'Yesterday',
    print: 'Print Card',
    download_badge: 'Download Badge',
    share_whatsapp: 'Share via WhatsApp',
    check_in: 'Check-in',
    checked_in: 'Checked in',

    // Sports Translation
    sports_title: 'Sports & Activities',
    sport_gym: 'Gym / Bodybuilding',
    sport_boxing: 'Boxing',
    sport_swimming: 'Swimming',
    sport_fitness: 'Fitness',
    sport_yoga: 'Yoga',
    sport_cardio: 'Cardio',
    sport_crossfit: 'CrossFit',
    sport_kickboxing: 'Kickboxing',
    sport_pilates: 'Pilates',
    sport_karate: 'Karate',
    sport_taekwondo: 'Taekwondo',
    sport_judo: 'Judo',
    sport_mma: 'Martial Arts (MMA)',
    sport_wrestling: 'Wrestling',
    sport_gymnastics: 'Gymnastics',
    sport_zumba: 'Zumba',
    sport_aerobics: 'Aerobics',
    sport_spinning: 'Spinning / Cycling',
    sport_calisthenics: 'Calisthenics',
    sport_powerlifting: 'Powerlifting',
    sport_other: 'Other',

    // Dashboard
    dash_welcome_title: 'Dashboard & Daily Activities',
    dash_welcome_sub: 'Live overview of member subscriptions, coach attendance, and automated renewal alerts',
    stat_total_members: 'Total Members',
    stat_attendance_today: "Today's Attendance",
    stat_expiring_soon: 'Expiring Soon',
    stat_expired: 'Expired Memberships',
    stat_total_coaches: 'Total Coaches',
    stat_coaches_present: 'Coaches Present',
    dash_quick_actions: 'Quick Actions',
    dash_recent_attendance: 'Recent Check-ins Today',
    dash_no_attendance_today: 'No check-ins recorded yet today. Use the scanner to start.',
    dash_view_all_logs: 'View Full Attendance Log',
    dash_chart_title: 'Attendance & Activity Trends',
    dash_registered_athletes: 'registered member(s)',

    // Members Screen
    members_title: 'Members Management',
    members_subtitle: 'Full management of membership cards, renewals, and detailed member records',
    members_search_placeholder: 'Search by member name, phone number, or barcode...',
    members_filter_all: 'All',
    members_filter_active: 'Active',
    members_filter_expiring: 'Expiring Soon',
    members_filter_expired: 'Expired',
    members_empty: 'No members registered yet. Click "Add Member" to get started.',
    members_no_results: 'No members match your search criteria.',
    member_card_title: 'Official Membership Card',
    member_id: 'Member ID',
    member_phone: 'Phone Number',
    member_email: 'Email',
    member_start_date: 'Start Date',
    member_end_date: 'End Date',
    member_fee: 'Subscription Fee',
    member_barcode: 'Barcode ID',
    member_renew: 'Renew',
    member_renew_title: 'Renew Membership',
    member_renew_sub: 'Select a duration to extend validity and update the member account',
    member_delete_confirm_title: 'Confirm Member Deletion',
    member_delete_confirm_msg: 'Are you sure you want to delete this member? Their card and records will be permanently removed.',
    member_quick_renew_1m: '1 Month (+1 mo)',
    member_quick_renew_3m: '3 Months (+3 mo)',
    member_quick_renew_6m: '6 Months (+6 mo)',
    member_quick_renew_1y: '1 Year (+1 yr)',

    // Member Form
    member_form_create_title: 'Add New Member',
    member_form_edit_title: 'Edit Member Details',
    member_form_name_label: 'Full Name',
    member_form_name_placeholder: 'e.g. John Doe',
    member_form_phone_label: 'Phone Number / WhatsApp',
    member_form_phone_placeholder: 'e.g. 612345678',
    member_form_phone_hint: '* Automatically prefixed with Morocco code (+212) for WhatsApp integration.',
    member_form_sport_label: 'Sport Discipline / Activity',
    member_form_start_label: 'Start Date',
    member_form_duration_label: 'Subscription Duration',
    member_form_duration_1m: '1 Month',
    member_form_duration_3m: '3 Months',
    member_form_duration_6m: '6 Months',
    member_form_duration_1y: '1 Year',
    member_form_duration_custom: 'Custom',
    member_form_end_label: 'End Date',
    member_form_fee_label: 'Subscription Fee (DH)',
    member_form_fee_placeholder: '250',
    member_form_submit_create: 'Register Member & Generate Barcode',
    member_form_submit_update: 'Save Changes & Update',

    // Coaches Screen
    coaches_title: 'Coaches & Trainers Directory',
    coaches_subtitle: 'Directory of certified club coaches with specialties, salaries, and attendance records',
    coaches_search_placeholder: 'Search by coach name, specialty, or ID...',
    coaches_filter_all: 'All',
    coaches_filter_active: 'Active Coaches',
    coaches_filter_inactive: 'Inactive',
    coaches_empty: 'No coaches registered yet. Click "Add Coach" to register your team.',
    coaches_no_results: 'No coaches match your search criteria.',
    coach_card_title: 'Official Coach Badge',
    coach_id: 'Coach ID',
    coach_specialty: 'Training Specialty',
    coach_salary: 'Monthly Salary',
    coach_hire_date: 'Hire Date',
    coach_notes: 'Notes & Bio',
    coach_check_in_btn: 'Check-in Coach',
    coach_delete_confirm_title: 'Confirm Coach Deletion',
    coach_delete_confirm_msg: 'Are you sure you want to delete this coach from the system?',
    coach_badge_title: 'Official Staff Certification',

    // Coach Form
    coach_form_create_title: 'Add New Coach / Trainer',
    coach_form_edit_title: 'Edit Coach Details',
    coach_form_name_label: 'Coach Full Name',
    coach_form_name_placeholder: 'e.g. Coach Tarek',
    coach_form_phone_label: 'Phone Number / WhatsApp',
    coach_form_phone_placeholder: 'e.g. 661234567',
    coach_form_email_label: 'Professional Email (optional)',
    coach_form_email_placeholder: 'coach@gymclub.com',
    coach_form_specialty_label: 'Primary Sport Discipline',
    coach_form_salary_label: 'Monthly Salary (DH)',
    coach_form_salary_placeholder: 'e.g. 4500',
    coach_form_hire_label: 'Hire Date',
    coach_form_status_label: 'Coach Status',
    coach_form_notes_label: 'Certifications & Notes',
    coach_form_notes_placeholder: 'Add achievements, diplomas or special notes...',
    coach_form_submit_create: 'Register Coach & Generate Barcode',
    coach_form_submit_update: 'Save & Update Coach Details',

    // Scanner Screen
    scanner_title: 'Smart Barcode & QR Scanner',
    scanner_subtitle: 'Instantly scan member and coach cards to verify validity and log attendance in real time',
    scanner_camera_tab: 'Camera Scanner',
    scanner_manual_tab: 'Manual Input / Laser Gun',
    scanner_camera_start: 'Start Camera',
    scanner_camera_stop: 'Stop Camera',
    scanner_camera_instruction: 'Point camera at the QR code or Barcode on the member card or phone screen',
    scanner_manual_placeholder: 'Type barcode here (e.g. MBR_10025 or COA_101) and press Enter...',
    scanner_manual_submit: 'Scan & Check-in',
    scanner_sound_toggle: 'Sound Alerts',
    scanner_simulator_title: 'Quick Simulation & Testing Bar',
    scanner_simulator_hint: 'Click any card below to test immediate check-in without needing a physical camera:',
    scanner_test_member: 'Member',
    scanner_test_coach: 'Coach',
    scanner_result_valid_member: 'Member attendance logged successfully!',
    scanner_result_valid_coach: 'Coach attendance logged successfully!',
    scanner_result_expired: 'Warning: This membership is expired!',
    scanner_result_not_found: 'Sorry, barcode not found in the system.',
    scanner_result_already_checked: 'This person has already checked in today.',
    scanner_recent_title: "Today's Recent Scans",
    scanner_member_badge: 'Member',
    scanner_coach_badge: 'Coach',

    // Attendance Logs
    att_title: 'Daily Attendance Logs',
    att_subtitle: 'Full history of all check-in entries logged for members and coaches',
    att_search_placeholder: 'Search by name, ID, or sport...',
    att_filter_all: 'All',
    att_filter_members: 'Members',
    att_filter_coaches: 'Coaches',
    att_date_filter: 'Filter by Date',
    att_empty: 'Attendance log is empty right now. Scan cards to start logging check-ins.',
    att_no_results: 'No attendance records match your search criteria.',
    att_col_name: 'Full Name',
    att_col_id: 'ID',
    att_col_role_sport: 'Role / Discipline',
    att_col_time: 'Check-in Time',
    att_col_date: 'Date',
    att_col_actions: 'Actions',
    att_stat_total_visits: 'Total Check-ins',
    att_stat_members: 'Member Check-ins',
    att_stat_coaches: 'Coach Check-ins',
    att_clear_all_btn: 'Clear All Attendance Logs',
    att_clear_confirm_title: 'Clear All Attendance Logs',
    att_clear_confirm_msg: 'All previous attendance records will be permanently deleted. Do you want to proceed?',
    att_delete_confirm_title: 'Confirm Log Deletion',
    att_delete_confirm_msg: 'Are you sure you want to delete this check-in record?',
    att_scanner_tips: 'Scanner Guidelines',
    att_scanner_tips_desc: 'The system automatically distinguishes member and coach cards, validates active memberships, and timestamps entry.',

    // Notifications
    notif_title: 'Smart Notifications Center',
    notif_subtitle: 'Automated monitoring of expired memberships and upcoming renewals',
    notif_empty: 'No pending notifications. All member subscriptions are up to date!',
    notif_mark_read: 'Mark as Read',
    notif_clear_all: 'Clear All',
    notif_unread_count: 'new alert(s)',
    notif_read: 'Read',
    notif_unread: 'Unread',

    // Settings Screen
    settings_title: 'Club Settings & Sports Management',
    settings_subtitle: 'Manage club profile, customize sport activities, select language, and sync with Supabase',
    settings_desc: 'Manage club profile, customize sport activities, select language, and sync with Supabase',
    language_select: 'Language Selection (Language)',
    language_desc: 'Select your preferred interface language. The entire app layout, menus, and sports names will update automatically.',
    settings_section_general: 'General Club Info & Owner Account',
    settings_club_name_label: 'Current Club Name',
    settings_whatsapp_label: 'Official Club WhatsApp Number (with country code)',
    settings_email_label: 'Certified Owner Email',
    settings_section_sports: 'Sports & Activities Management',
    settings_sports_desc: 'Add new disciplines or rename existing ones. Updates reflect immediately on all enrolled members.',
    settings_add_sport_placeholder: 'New sport name (e.g. Karate, CrossFit...)',
    settings_add_sport_btn: 'Add Sport',
    settings_sport_enrolled: 'enrolled member(s)',
    settings_delete_sport_confirm: 'Are you sure you want to delete this sport? Enrolled members will be moved to "Other".',
    settings_section_supabase: 'Cloud Database & Sync (Supabase)',
    settings_supabase_desc: 'Two-way synchronization with your PostgreSQL database on Supabase to keep all data secure.',
    settings_supabase_test: 'Test Supabase Connection',
    settings_supabase_pull: 'Pull Cloud Data',
    settings_supabase_push: 'Push Local Data to Cloud',
    settings_supabase_copy_sql: 'Copy SQL Schema',
    settings_supabase_view_sql: 'View SQL Code',
    settings_section_lang: 'App Language Settings',
    settings_lang_desc: 'Select your preferred interface language. The entire app layout, menus, and sports names will update automatically.',
    settings_lang_ar: 'العربية (Arabic)',
    settings_lang_fr: 'Français (French)',
    settings_lang_en: 'English (English)',
    settings_lang_es: 'Español (Spanish)',

    // PDF Export Modal & Report
    pdf_export_btn: 'Export PDF Data',
    pdf_export_title: 'Club Data Report (PDF)',
    pdf_export_desc: 'Generate a high-resolution comprehensive PDF report containing all members, coaches, attendance logs, and financial statistics',
    pdf_export_all: 'Full Comprehensive Club Report',
    pdf_export_members: 'Members & Subscriptions Report',
    pdf_export_coaches: 'Coaches & Staff Salaries Report',
    pdf_export_attendance: 'Daily Attendance History Report',
    pdf_export_generating: 'Generating PDF document...',
    pdf_export_download_now: 'Download PDF Report Now',
    pdf_export_preview: 'Report Preview',
    pdf_export_summary_stats: 'Key Metrics & Analytics Summary',
    pdf_export_financial: 'Financial Overview & Fees',
    pdf_export_generated_at: 'Generated at',
    pdf_export_close: 'Close',
    pdf_export_print: 'Print Report',

    // Quick Checkin & Dashboard Enhancements
    quick_checkin_title: 'Quick Check-in Search',
    quick_checkin_subtitle: 'Search by name, phone, or barcode to check-in manually if member forgot card',
    quick_checkin_placeholder: 'Search name, phone, or barcode...',
    quick_checkin_btn: 'Check-in Now',
    quick_checkin_no_results: 'No matching results found',
    quick_renew_btn: 'Quick Renew (+1 month)',
    daily_cash_title: "Today's Cash Drawer & Revenue",
    daily_cash_subtitle: 'Daily collections and subscriptions summary for receptionist shift closing',
    daily_revenue_label: "Today's Total Revenue",
    daily_new_subs_label: "Today's Operations & Sign-ups",
    daily_close_shift: 'Print Shift Report',
    filter_expiring: 'Expiring Soon (3 days)',

    // Login Screen
    login_title: 'Management Login',
    login_subtitle: 'Smart Gym Club Management & Barcode Attendance System',
    login_email_label: 'Manager Email',
    login_password_label: 'Password',
    login_submit: 'Sign In',
    login_demo_btn: 'Quick Demo Login',
    login_welcome_back: 'Welcome back to GymFlow',
    login_feature_1: 'Instant Camera & Laser Gun Barcode/QR Scanning',
    login_feature_2: 'Complete Member & Coach Attendance Tracking',
    login_feature_3: 'Print Badges & 1-Click WhatsApp Sharing',
    login_feature_4: 'Secure Supabase Cloud Database Sync'
  },

  // ==========================================
  // SPANISH (Español) TRANSLATIONS
  // ==========================================
  es: {
    // Navigation & General UI
    app_name_default: 'GymFlow',
    dashboard: 'Panel Principal',
    members: 'Socios',
    add_member: 'Añadir Socio',
    coaches: 'Entrenadores',
    add_coach: 'Añadir Entrenador',
    scanner: 'Escáner',
    scanner_barcode: 'Escáner Código de Barras / QR',
    attendance: 'Asistencia',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    menu: 'Menú',
    close_menu: 'Cerrar',
    live_clock: 'Reloj en Vivo',
    supabase_connected: 'Supabase Nube',
    fullscreen: 'Pantalla Completa',
    simulator: 'Simulador',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    back: 'Volver',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    all: 'Todos',
    yes: 'Sí',
    no: 'No',
    loading: 'Cargando...',
    success: 'Éxito',
    error: 'Error',
    actions: 'Acciones',
    details: 'Detalles',
    status: 'Estado',
    active: 'Activo y Válido',
    expired: 'Caducado',
    expiring_soon: 'Próximo a Vencer',
    inactive: 'Inactivo',
    currency: 'DH',
    days_left: 'días restantes',
    days: 'días',
    today: 'Hoy',
    yesterday: 'Ayer',
    print: 'Imprimir Carnet',
    download_badge: 'Descargar Credencial',
    share_whatsapp: 'Compartir por WhatsApp',
    check_in: 'Registrar Entrada',
    checked_in: 'Entrada Registrada',

    // Sports Translation
    sports_title: 'Deportes y Actividades',
    sport_gym: 'Musculación / Gimnasio',
    sport_boxing: 'Boxeo',
    sport_swimming: 'Natación',
    sport_fitness: 'Fitness',
    sport_yoga: 'Yoga',
    sport_cardio: 'Cardio',
    sport_crossfit: 'CrossFit',
    sport_kickboxing: 'Kickboxing',
    sport_pilates: 'Pilates',
    sport_karate: 'Kárate',
    sport_taekwondo: 'Taekwondo',
    sport_judo: 'Judo',
    sport_mma: 'Artes Marciales (MMA)',
    sport_wrestling: 'Lucha',
    sport_gymnastics: 'Gimnasia',
    sport_zumba: 'Zumba',
    sport_aerobics: 'Aeróbic',
    sport_spinning: 'Spinning / Ciclismo',
    sport_calisthenics: 'Calistenia',
    sport_powerlifting: 'Powerlifting',
    sport_other: 'Otro',

    // Dashboard
    dash_welcome_title: 'Panel de Control y Actividades Diarias',
    dash_welcome_sub: 'Supervisión en tiempo real de membresías, asistencia de socios/entrenadores y alertas automáticas',
    stat_total_members: 'Total de Socios',
    stat_attendance_today: 'Asistencias de Hoy',
    stat_expiring_soon: 'Próximos a Vencer',
    stat_expired: 'Membresías Vencidas',
    stat_total_coaches: 'Total de Entrenadores',
    stat_coaches_present: 'Entrenadores Presentes',
    dash_quick_actions: 'Acciones Rápidas',
    dash_recent_attendance: 'Últimas Asistencias de Hoy',
    dash_no_attendance_today: 'No hay registros de asistencia hoy todavía. Use el escáner para comenzar.',
    dash_view_all_logs: 'Ver Registro Completo de Asistencias',
    dash_chart_title: 'Tendencias de Asistencia y Actividad',
    dash_registered_athletes: 'socio(s) registrado(s)',

    // Members Screen
    members_title: 'Gestión de Socios',
    members_subtitle: 'Administración integral de tarjetas de membresía, renovaciones y fichas de socios',
    members_search_placeholder: 'Buscar por nombre, teléfono o código de barras...',
    members_filter_all: 'Todos',
    members_filter_active: 'Activos',
    members_filter_expiring: 'Por Vencer',
    members_filter_expired: 'Vencidos',
    members_empty: 'No hay socios registrados. Haga clic en "Añadir Socio" para comenzar.',
    members_no_results: 'No se encontraron socios que coincidan con la búsqueda.',
    member_card_title: 'Carnet Oficial de Socio',
    member_id: 'ID de Socio',
    member_phone: 'Teléfono',
    member_email: 'Correo Electrónico',
    member_start_date: 'Fecha de Inicio',
    member_end_date: 'Fecha de Vencimiento',
    member_fee: 'Cuota de Membresía',
    member_barcode: 'Código de Barras',
    member_renew: 'Renovar',
    member_renew_title: 'Renovar Membresía',
    member_renew_sub: 'Seleccione la duración para extender la validez y actualizar la cuenta',
    member_delete_confirm_title: 'Confirmar Eliminación del Socio',
    member_delete_confirm_msg: '¿Está seguro de que desea eliminar este socio? Sus registros y carnet se borrarán permanentemente.',
    member_quick_renew_1m: '1 Mes (+1 mes)',
    member_quick_renew_3m: '3 Meses (+3 meses)',
    member_quick_renew_6m: '6 Meses (+6 meses)',
    member_quick_renew_1y: '1 Año (+1 año)',

    // Member Form
    member_form_create_title: 'Añadir Nuevo Socio',
    member_form_edit_title: 'Editar Datos del Socio',
    member_form_name_label: 'Nombre Completo',
    member_form_name_placeholder: 'Ej: Carlos Martínez',
    member_form_phone_label: 'Teléfono / WhatsApp',
    member_form_phone_placeholder: 'Ej: 612345678',
    member_form_phone_hint: '* Con prefijo internacional automático para integración con WhatsApp.',
    member_form_sport_label: 'Disciplina Deportiva / Actividad',
    member_form_start_label: 'Fecha de Inicio',
    member_form_duration_label: 'Duración de la Suscripción',
    member_form_duration_1m: '1 Mes',
    member_form_duration_3m: '3 Meses',
    member_form_duration_6m: '6 Meses',
    member_form_duration_1y: '1 Año',
    member_form_duration_custom: 'Personalizado',
    member_form_end_label: 'Fecha de Vencimiento',
    member_form_fee_label: 'Cuota de Suscripción (DH)',
    member_form_fee_placeholder: '250',
    member_form_submit_create: 'Registrar Socio y Generar Código',
    member_form_submit_update: 'Guardar Cambios y Actualizar',

    // Coaches Screen
    coaches_title: 'Directorio de Entrenadores y Staff',
    coaches_subtitle: 'Listado de entrenadores certificados con especialidades, salarios y registros de asistencia',
    coaches_search_placeholder: 'Buscar por nombre, especialidad o ID...',
    coaches_filter_all: 'Todos',
    coaches_filter_active: 'Entrenadores Activos',
    coaches_filter_inactive: 'Inactivos',
    coaches_empty: 'No hay entrenadores registrados. Haga clic en "Añadir Entrenador" para comenzar.',
    coaches_no_results: 'No se encontraron entrenadores que coincidan con la búsqueda.',
    coach_card_title: 'Credencial Oficial de Entrenador',
    coach_id: 'ID de Entrenador',
    coach_specialty: 'Especialidad de Entrenamiento',
    coach_salary: 'Salario Mensual',
    coach_hire_date: 'Fecha de Contratación',
    coach_notes: 'Notas y Trayectoria',
    coach_check_in_btn: 'Registrar Asistencia del Entrenador',
    coach_delete_confirm_title: 'Confirmar Eliminación del Entrenador',
    coach_delete_confirm_msg: '¿Está seguro de que desea eliminar a este entrenador del sistema?',
    coach_badge_title: 'Certificación Oficial del Personal',

    // Coach Form
    coach_form_create_title: 'Añadir Nuevo Entrenador',
    coach_form_edit_title: 'Editar Datos del Entrenador',
    coach_form_name_label: 'Nombre Completo del Entrenador',
    coach_form_name_placeholder: 'Ej: Entrenador David Ruiz',
    coach_form_phone_label: 'Teléfono / WhatsApp',
    coach_form_phone_placeholder: 'Ej: 661234567',
    coach_form_email_label: 'Correo Profesional (opcional)',
    coach_form_email_placeholder: 'coach@gymclub.com',
    coach_form_specialty_label: 'Disciplina Deportiva Principal',
    coach_form_salary_label: 'Salario Mensual (DH)',
    coach_form_salary_placeholder: 'Ej: 4500',
    coach_form_hire_label: 'Fecha de Contratación',
    coach_form_status_label: 'Estado del Entrenador',
    coach_form_notes_label: 'Certificaciones y Observaciones',
    coach_form_notes_placeholder: 'Añada diplomas, títulos u observaciones especiales...',
    coach_form_submit_create: 'Registrar Entrenador y Generar Código',
    coach_form_submit_update: 'Guardar y Actualizar Datos',

    // Scanner Screen
    scanner_title: 'Escáner Inteligente (Código de Barras y QR)',
    scanner_subtitle: 'Escanee al instante las tarjetas de socios y entrenadores para verificar validez y registrar asistencias',
    scanner_camera_tab: 'Escaneo por Cámara',
    scanner_manual_tab: 'Entrada Manual / Pistola Láser',
    scanner_camera_start: 'Iniciar Cámara',
    scanner_camera_stop: 'Detener Cámara',
    scanner_camera_instruction: 'Enfoque la cámara hacia el código QR o código de barras del carnet o móvil',
    scanner_manual_placeholder: 'Escriba el código aquí (ej: MBR_10025 o COA_101) y presione Enter...',
    scanner_manual_submit: 'Escanear y Registrar Entrada',
    scanner_sound_toggle: 'Alertas Sonoras',
    scanner_simulator_title: 'Barra de Simulación y Pruebas Rápidas',
    scanner_simulator_hint: 'Haga clic en cualquier tarjeta abajo para probar la entrada instantánea sin cámara física:',
    scanner_test_member: 'Socio',
    scanner_test_coach: 'Entrenador',
    scanner_result_valid_member: '¡Asistencia del socio registrada con éxito!',
    scanner_result_valid_coach: '¡Asistencia del entrenador registrada con éxito!',
    scanner_result_expired: '¡Atención: La membresía de este socio ha caducado!',
    scanner_result_not_found: 'Lo sentimos, código de barras no encontrado en el sistema.',
    scanner_result_already_checked: 'Esta persona ya ha registrado su entrada hoy.',
    scanner_recent_title: 'Últimos Escaneos de Hoy',
    scanner_member_badge: 'Socio',
    scanner_coach_badge: 'Entrenador',

    // Attendance Logs
    att_title: 'Historial y Registros de Asistencia Diaria',
    att_subtitle: 'Listado de todos los socios y entrenadores que han registrado su entrada en el centro',
    att_search_placeholder: 'Buscar por nombre, ID o deporte...',
    att_filter_all: 'Todos',
    att_filter_members: 'Socios',
    att_filter_coaches: 'Entrenadores',
    att_date_filter: 'Filtrar por Fecha',
    att_empty: 'El registro de asistencia está vacío. Escanee tarjetas para registrar accesos.',
    att_no_results: 'No se encontraron registros de asistencia que coincidan con la búsqueda.',
    att_col_name: 'Nombre Completo',
    att_col_id: 'ID',
    att_col_role_sport: 'Rol / Disciplina',
    att_col_time: 'Hora de Entrada',
    att_col_date: 'Fecha',
    att_col_actions: 'Acciones',
    att_stat_total_visits: 'Total de Entradas',
    att_stat_members: 'Asistencias de Socios',
    att_stat_coaches: 'Asistencias de Entrenadores',
    att_clear_all_btn: 'Vaciar Todo el Historial',
    att_clear_confirm_title: 'Vaciar Historial de Asistencias',
    att_clear_confirm_msg: 'Todos los registros de asistencias anteriores se eliminarán permanentemente. ¿Desea continuar?',
    att_delete_confirm_title: 'Confirmar Eliminación del Registro',
    att_delete_confirm_msg: '¿Está seguro de que desea eliminar este registro de asistencia?',
    att_scanner_tips: 'Instrucciones del Escáner',
    att_scanner_tips_desc: 'El sistema identifica automáticamente socios y entrenadores, comprueba la validez y sella la hora de entrada.',

    // Notifications
    notif_title: 'Centro Inteligente de Notificaciones',
    notif_subtitle: 'Control automático de membresías caducadas y avisos de renovación oportuna',
    notif_empty: 'No hay notificaciones pendientes. ¡Todas las membresías están al día!',
    notif_mark_read: 'Marcar como Leído',
    notif_clear_all: 'Limpiar Todo',
    notif_unread_count: 'nueva(s) alerta(s)',
    notif_read: 'Leído',
    notif_unread: 'No leído',

    // Settings Screen
    settings_title: 'Configuración del Club y Gestión Deportiva',
    settings_subtitle: 'Gestión del perfil del club, personalización de actividades, selección de idioma y Supabase',
    settings_desc: 'Gestión del perfil del club, personalización de actividades, selección de idioma y Supabase',
    language_select: 'Selección de Idioma (Language)',
    language_desc: 'Elija el idioma de la interfaz del sistema. Se traducen todas las pantallas, menús y deportes automáticamente.',
    settings_section_general: 'Información General y Cuenta de Propietario',
    settings_club_name_label: 'Nombre Actual del Club',
    settings_whatsapp_label: 'WhatsApp Oficial del Club para Avisos (con prefijo)',
    settings_email_label: 'Correo Electrónico del Propietario',
    settings_section_sports: 'Gestión y Personalización de Deportes',
    settings_sports_desc: 'Añada nuevas disciplinas o renombre las existentes. Los cambios se reflejan en todos los socios inscritos.',
    settings_add_sport_placeholder: 'Nombre de la nueva actividad (ej: Kárate, CrossFit...)',
    settings_add_sport_btn: 'Añadir Deporte',
    settings_sport_enrolled: 'socio(s) inscrito(s)',
    settings_delete_sport_confirm: '¿Está seguro de eliminar esta actividad? Los socios inscritos se moverán a "Otro".',
    settings_section_supabase: 'Base de Datos en la Nube y Sincronización (Supabase)',
    settings_supabase_desc: 'Sincronización bidireccional con PostgreSQL en Supabase para mantener los datos seguros.',
    settings_supabase_test: 'Probar Conexión con Supabase',
    settings_supabase_pull: 'Descargar Datos de la Nube',
    settings_supabase_push: 'Subir Datos Locales a la Nube',
    settings_supabase_copy_sql: 'Copiar Código SQL de Tablas',
    settings_supabase_view_sql: 'Ver Código SQL',
    settings_section_lang: 'Configuración de Idioma',
    settings_lang_desc: 'Elija el idioma preferido de la interfaz. La aplicación se adapta automáticamente.',
    settings_lang_ar: 'العربية (Árabe)',
    settings_lang_fr: 'Français (Francés)',
    settings_lang_en: 'English (Inglés)',
    settings_lang_es: 'Español (Spanish)',

    // PDF Export Modal & Report
    pdf_export_btn: 'Descargar PDF de Datos',
    pdf_export_title: 'Exportar Informe de Datos del Club (PDF)',
    pdf_export_desc: 'Genere un documento PDF completo y de alta resolución con todos los socios, entrenadores, asistencias y finanzas',
    pdf_export_all: 'Informe Integral y Completo del Club',
    pdf_export_members: 'Informe de Registro de Socios y Cuotas',
    pdf_export_coaches: 'Informe de Plantilla de Entrenadores y Salarios',
    pdf_export_attendance: 'Informe de Registros Diarios de Asistencia',
    pdf_export_generating: 'Generando documento PDF...',
    pdf_export_download_now: 'Descargar Informe PDF Ahora',
    pdf_export_preview: 'Vista Previa del Informe',
    pdf_export_summary_stats: 'Resumen de Métricas e Indicadores Clave',
    pdf_export_financial: 'Resumen Financiero y Recaudación',
    pdf_export_generated_at: 'Generado el',
    pdf_export_close: 'Cerrar',
    pdf_export_print: 'Imprimir Informe',

    // Quick Checkin & Dashboard Enhancements
    quick_checkin_title: 'Búsqueda y Registro Rápido',
    quick_checkin_subtitle: 'Busque por nombre, teléfono o código para registrar entrada manualmente si el socio olvidó su tarjeta',
    quick_checkin_placeholder: 'Buscar nombre, teléfono o código...',
    quick_checkin_btn: 'Registrar Entrada Ahora',
    quick_checkin_no_results: 'No se encontraron resultados coincidentes',
    quick_renew_btn: 'Renovación Rápida (+1 mes)',
    daily_cash_title: 'Caja Diaria y Recaudación',
    daily_cash_subtitle: 'Resumen de cobros y suscripciones para el cierre de turno de recepción',
    daily_revenue_label: 'Recaudación Total de Hoy',
    daily_new_subs_label: 'Operaciones y Nuevas Altas de Hoy',
    daily_close_shift: 'Imprimir Informe de Turno',
    filter_expiring: 'Por Vencer Pronto (3 días)',

    // Login Screen
    login_title: 'Acceso Administrativo',
    login_subtitle: 'Sistema Inteligente de Gestión de Gimnasio y Escáner',
    login_email_label: 'Correo del Administrador',
    login_password_label: 'Contraseña',
    login_submit: 'Iniciar Sesión',
    login_demo_btn: 'Acceso Rápido de Demostración',
    login_welcome_back: 'Bienvenido de nuevo a GymFlow',
    login_feature_1: 'Escaneo instantáneo de códigos con cámara y lector láser',
    login_feature_2: 'Control completo de cuotas de socios y asistencia de entrenadores',
    login_feature_3: 'Impresión de carnets y compartición por WhatsApp en 1 clic',
    login_feature_4: 'Sincronización segura con la nube Supabase'
  }
};

/**
 * Universal sport name translation helper
 * Translates any raw sport string (e.g. 'Gym', 'Boxing', 'ملاكمة', 'Natation', etc.)
 * into the target language.
 */
export function formatSportName(rawSport: string | undefined | null, lang: Language): string {
  if (!rawSport) return translations[lang].sport_other;

  const normalized = rawSport.trim().toLowerCase();
  const dict = translations[lang];

  // Gym / Bodybuilding / كمال الأجسام / Gimnasio / Musculación
  if (['gym', 'bodybuilding', 'musculation', 'musculacion', 'gimnasio', 'pesas', 'كمال الأجسام', 'كمال الاجسام', 'جيم', 'حديد'].some(k => normalized.includes(k))) {
    return dict.sport_gym;
  }
  // Boxing / Boxe / ملاكمة / Boxeo
  if (['box', 'ملاكم', 'boxe', 'boxeo'].some(k => normalized.includes(k))) {
    return dict.sport_boxing;
  }
  // Swimming / Natation / سباحة / Natación
  if (['swim', 'natation', 'natacion', 'natación', 'سباح'].some(k => normalized.includes(k))) {
    return dict.sport_swimming;
  }
  // Fitness / لياقة
  if (['fit', 'لياق', 'remise en forme', 'acondicionamiento'].some(k => normalized.includes(k))) {
    return dict.sport_fitness;
  }
  // Yoga / يوجا / يوغا
  if (['yog', 'يوجا', 'يوغا'].some(k => normalized.includes(k))) {
    return dict.sport_yoga;
  }
  // Cardio / كارديو
  if (['cardio', 'كارديو'].some(k => normalized.includes(k))) {
    return dict.sport_cardio;
  }
  // CrossFit / كروس فيت
  if (['crossfit', 'cross-fit', 'كروس فيت', 'كروسفيت'].some(k => normalized.includes(k))) {
    return dict.sport_crossfit;
  }
  // Kickboxing / كيك بوكسينغ
  if (['kickbox', 'kick-boxing', 'كيك بوكس', 'كيكبوكس'].some(k => normalized.includes(k))) {
    return dict.sport_kickboxing;
  }
  // Pilates / بيلاتس
  if (['pilate', 'بيلاتس', 'بيلاتيز'].some(k => normalized.includes(k))) {
    return dict.sport_pilates;
  }
  // Karate / كاراتيه
  if (['karat', 'كاراتيه', 'كاراتي'].some(k => normalized.includes(k))) {
    return dict.sport_karate;
  }
  // Taekwondo / تايكوندو
  if (['taekwondo', 'tae kwon do', 'تايكوندو'].some(k => normalized.includes(k))) {
    return dict.sport_taekwondo;
  }
  // Judo / جودو
  if (['judo', 'جودو'].some(k => normalized.includes(k))) {
    return dict.sport_judo;
  }
  // MMA / فنون قتالية / Artes Marciales
  if (['mma', 'artes marciales', 'marcial', 'فنون قتالية', 'combat'].some(k => normalized.includes(k))) {
    return dict.sport_mma;
  }
  // Wrestling / Lutte / مصارعة / Lucha
  if (['wrestl', 'lutte', 'lucha', 'مصارع'].some(k => normalized.includes(k))) {
    return dict.sport_wrestling;
  }
  // Gymnastics / الجمباز / Gimnasia
  if (['gymnast', 'gimnasia', 'جمباز'].some(k => normalized.includes(k))) {
    return dict.sport_gymnastics;
  }
  // Zumba / زومبا
  if (['zumba', 'زومبا'].some(k => normalized.includes(k))) {
    return dict.sport_zumba;
  }
  // Aerobics / أيروبيك / Aeróbic
  if (['aerobic', 'aérobic', 'aeróbic', 'aerobic', 'ايروبيك', 'أيروبيك'].some(k => normalized.includes(k))) {
    return dict.sport_aerobics;
  }
  // Spinning / سبينينغ / دراجات / Ciclismo
  if (['spin', 'vélo', 'velo', 'ciclismo', 'دراج', 'سبينينغ'].some(k => normalized.includes(k))) {
    return dict.sport_spinning;
  }
  // Calisthenics / كاليسثينيكس / Calistenia
  if (['calisthenic', 'calisthénie', 'calistenia', 'كاليسثينيكس'].some(k => normalized.includes(k))) {
    return dict.sport_calisthenics;
  }
  // Powerlifting / باور ليفتينغ
  if (['powerlift', 'force athlétique', 'fuerza', 'باورليفتينغ', 'باور ليفتينغ'].some(k => normalized.includes(k))) {
    return dict.sport_powerlifting;
  }
  // Other / Autre / أخرى / Otro
  if (['other', 'autre', 'otro', 'otra', 'أخرى', 'اخرى', 'غير ذلك'].some(k => normalized.includes(k))) {
    return dict.sport_other;
  }

  // If user entered a custom sport name (e.g. "Padel" or "كرة الريشة"), return as is
  return rawSport;
}

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  subLabel: string;
  dir: 'rtl' | 'ltr';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية', subLabel: 'Arabic', dir: 'rtl' },
  { code: 'fr', label: 'Français', nativeLabel: 'Français', subLabel: 'French', dir: 'ltr' },
  { code: 'en', label: 'English', nativeLabel: 'English', subLabel: 'English', dir: 'ltr' },
  { code: 'es', label: 'Español', nativeLabel: 'Español', subLabel: 'Spanish', dir: 'ltr' },
];

/**
 * Auto-detect user's device/browser language
 */
function detectDeviceLanguage(): Language {
  try {
    const navLangs = navigator.languages || [navigator.language];
    for (const lang of navLangs) {
      if (!lang) continue;
      const lower = lang.toLowerCase();
      if (lower.startsWith('ar')) return 'ar';
      if (lower.startsWith('fr')) return 'fr';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('en')) return 'en';
    }
  } catch (e) {
    // ignore
  }
  return 'ar'; // Default to Arabic
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';
  formatSport: (rawSport: string | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = 'gym_app_language_v1';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'ar' || saved === 'fr' || saved === 'en' || saved === 'es') {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return detectDeviceLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {
      // ignore
    }
  };

  const dir: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = translations[language];

  const formatSport = (rawSport: string | undefined | null) => {
    return formatSportName(rawSport, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, formatSport }}>
      <div dir={dir} className={language === 'ar' ? 'font-sans' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
