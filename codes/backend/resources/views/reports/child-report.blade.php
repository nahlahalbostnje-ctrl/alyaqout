<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; direction: rtl; color: #1B2038; font-size: 13px; }
    .header { background: #0D1E3A; color: #fff; padding: 18px 22px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0 0 4px; font-size: 18px; }
    .header p { margin: 0; color: #D4A65A; font-size: 12px; }
    .kpis { width: 100%; margin-bottom: 20px; }
    .kpis td { text-align: center; padding: 10px; border: 1px solid #EDE3CE; border-radius: 8px; }
    .kpi-value { font-size: 20px; font-weight: bold; display: block; }
    .kpi-label { font-size: 11px; color: #6B7280; }
    table.data { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    table.data th { background: #F8F5EE; padding: 8px 10px; text-align: right; font-size: 11px; color: #6B7280; border-bottom: 1px solid #EDE3CE; }
    table.data td { padding: 8px 10px; font-size: 12px; border-bottom: 1px solid #EDE3CE; }
    .section-title { font-weight: bold; font-size: 13px; margin: 16px 0 8px; }
    .footer { margin-top: 24px; text-align: center; color: #9CA3AF; font-size: 10px; }
</style>
</head>
<body>
    <div class="header">
        <h1>التقرير الأكاديمي — {{ $student['name'] }}</h1>
        <p>منصة الياقوت التعليمية — تاريخ الإصدار: {{ $generatedAt }}</p>
    </div>

    <table class="kpis">
        <tr>
            <td><span class="kpi-value">{{ $attendance['rate'] ?? '-' }}%</span><span class="kpi-label">نسبة الحضور</span></td>
            <td><span class="kpi-value">{{ $exams['average'] ?? '-' }}%</span><span class="kpi-label">متوسط الامتحانات</span></td>
            <td><span class="kpi-value">{{ $homework['average'] ?? '-' }}%</span><span class="kpi-label">متوسط الواجبات</span></td>
            <td><span class="kpi-value">{{ $progress['videos_completed'] }}</span><span class="kpi-label">فيديوهات مكتملة</span></td>
        </tr>
    </table>

    <p class="section-title">الحضور والغياب</p>
    <table class="data">
        <tr><th>حاضر</th><th>غائب</th><th>متأخر</th><th>الإجمالي</th></tr>
        <tr>
            <td>{{ $attendance['present'] }}</td>
            <td>{{ $attendance['absent'] }}</td>
            <td>{{ $attendance['late'] }}</td>
            <td>{{ $attendance['total'] }}</td>
        </tr>
    </table>

    <p class="section-title">آخر الامتحانات</p>
    <table class="data">
        <tr><th>الامتحان</th><th>الدرجة</th><th>النسبة</th><th>التاريخ</th></tr>
        @forelse($exams['recent'] as $e)
        <tr>
            <td>{{ $e['title'] }}</td>
            <td>{{ $e['score'] }} / {{ $e['total'] }}</td>
            <td>{{ $e['pct'] }}%</td>
            <td>{{ $e['date'] }}</td>
        </tr>
        @empty
        <tr><td colspan="4">لا توجد امتحانات مسجلة</td></tr>
        @endforelse
    </table>

    <p class="section-title">الواجبات</p>
    <table class="data">
        <tr><th>المسلَّمة</th><th>المتأخرة</th><th>المتوسط</th></tr>
        <tr>
            <td>{{ $homework['submitted'] }}</td>
            <td>{{ $homework['late'] }}</td>
            <td>{{ $homework['average'] ?? '-' }}%</td>
        </tr>
    </table>

    <div class="footer">تم إصدار هذا التقرير آلياً عبر منصة الياقوت التعليمية</div>
</body>
</html>
