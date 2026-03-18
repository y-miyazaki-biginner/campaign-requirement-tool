import pdfplumber
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r'C:\Users\yugam\Downloads'
pdfs = [
    '【EC専業ver3.0】施策分析集_シナリオ.pdf',
    '【toB_ver2.0】施策分析集_シナリオ-.pdf',
    '【来店型ver2.0】施策分析集_シナリオ.pdf',
    '【EC店舗オムニver2.0】施策分析集_シナリオ.pdf',
    '【EC×来店ver2.0】施策分析集_シナリオ.pdf',
    '【スクール_講座系ver2.1】施策分析集_シナリオ.pdf',
    '【スクール_学校系ver2.1】施策分析集_シナリオ.pdf',
    '【不動産販売ver2.0】施策分析集_シナリオ.pdf',
    '【ホテルver2.0】施策分析集_シナリオ.pdf',
    '【ブライダルver2.0】施策分析集_シナリオ.pdf',
    '【レジャーver2.0】施策分析集_シナリオ.pdf',
    '【旅行ver2.0】施策分析集_シナリオ.pdf',
    '【人材広告ver3.0】施策分析集_シナリオ.pdf',
    '【公共インフラver2.1】施策分析集_シナリオ.pdf',
    '【マッチングver2.0】施策分析集_シナリオ.pdf',
]

for pdf_name in pdfs:
    path = os.path.join(pdf_dir, pdf_name)
    print(f'=== {pdf_name} ===')
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages[:8]):
                text = page.extract_text()
                if text:
                    print(f'--- Page {i+1} ---')
                    print(text[:2000])
                    print()
    except Exception as e:
        print(f'Error: {e}')
    print()
