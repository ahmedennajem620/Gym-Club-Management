# Security Specification & Test Protocol

## 1. Data Invariants
- **Members**: A member profile cannot be created or updated without a valid unique `barcode_id`. Phone numbers and names are required and must have size limits to avoid resource-poisoning.
- **Attendance**: Attendance can only be logged for members whose subscription status matches "active". The `checkin_date` and `checkin_time` must match correct formatting.
- **Notifications**: Notifications are system/admin alerts generated when subscription end dates approach.

## 2. The "Dirty Dozen" Payloads (Denial Proofing)
The following payloads should be blocked by Firestore rules to prevent privilege escalation or data corruption:

1. **Self-Elevated Registration**: User registering themselves as a member with `status: "active"` bypassing payment validation.
2. **Ghost Members**: Inserting documents into `members` with extra undocumented fields (e.g. `isVIP: true`).
3. **Immortality Bypass**: Standard user modifying the `created_at` timestamp.
4. **Barcode Hijack**: Creating a member using an already bound barcode belonging to someone else.
5. **Expired Check-In Force**: Logging attendance for a member whose status is `expired`.
6. **Negative Timestamps**: End date set in the past relative to the start date.
7. **Junk ID Poisoning**: Trying to access path variables with strings of size >256 bytes or non-alphanumeric formats.
8. **Owner Spoofing**: Submitting a check-in with `member_id` of another user.
9. **Notification Spam**: Unauthorized users creating custom alerts to block admin resources.
10. **Admin Claim Escalation**: Admin flag simulation in custom profile payloads.
11. **Anomalous Field Mutating**: Modifying `sport_type` to values outside the allowed enum values like `Yoga`, `Gym`, etc.
12. **Denial of Wallet Read Attack**: Requesting list views without filters, forcing unbounded O(N) evaluations in collection groups.

## 3. Core Security Rules Draft Plan
The rules will mandate:
- Read/Write authentication requirements.
- Valid format checks on string fields (limiting length).
- Strict enum alignment for sport types.
- Strict mapping of actions to valid update key subsets using `affectedKeys().hasOnly()`.
