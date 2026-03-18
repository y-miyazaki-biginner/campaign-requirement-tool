import pdfplumber
import os
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

pdf_dir = r'C:\Users\yugam\Downloads'
pdfs = {
    'EC専業': '【EC専業ver3.0】施策分析集_シナリオ.pdf',
    'toB': '【toB_ver2.0】施策分析集_シナリオ-.pdf',
    '来店型': '【来店型ver2.0】施策分析集_シナリオ.pdf',
    'EC店舗オムニ': '【EC店舗オムニver2.0】施策分析集_シナリオ.pdf',
    'EC×来店': '【EC×来店ver2.0】施策分析集_シナリオ.pdf',
    'スクール_講座系': '【スクール_講座系ver2.1】施策分析集_シナリオ.pdf',
    'スクール_学校系': '【スクール_学校系ver2.1】施策分析集_シナリオ.pdf',
    '不動産販売': '【不動産販売ver2.0】施策分析集_シナリオ.pdf',
    'ホテル': '【ホテルver2.0】施策分析集_シナリオ.pdf',
    'ブライダル': '【ブライダルver2.0】施策分析集_シナリオ.pdf',
    'レジャー': '【レジャーver2.0】施策分析集_シナリオ.pdf',
    '旅行': '【旅行ver2.0】施策分析集_シナリオ.pdf',
    '人材広告': '【人材広告ver3.0】施策分析集_シナリオ.pdf',
    '公共インフラ': '【公共インフラver2.1】施策分析集_シナリオ.pdf',
    'マッチング': '【マッチングver2.0】施策分析集_シナリオ.pdf',
}

result = {}

for industry, pdf_name in pdfs.items():
    path = os.path.join(pdf_dir, pdf_name)
    campaigns = []
    seen_names = set()
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages[2:7]:
                text = page.extract_text()
                if not text or '施策一覧' not in text:
                    continue

                lines = text.split('\n')

                for line in lines:
                    # Look for lines containing numbered campaigns
                    # Pattern: starts with or contains a number followed by campaign name ending with シナリオ
                    match = re.search(
                        r'(\d+)\s+(\S+シナリオ)\s+(.+?)(?:\s+P\d+|$)',
                        line
                    )
                    if not match:
                        continue

                    num = match.group(1)
                    raw_name = match.group(2)
                    desc = match.group(3).strip()

                    # Clean name: remove シナリオ suffix
                    clean_name = raw_name.replace('シナリオ', '').strip()

                    # Skip if already seen
                    if clean_name in seen_names:
                        continue
                    seen_names.add(clean_name)

                    # Extract target from description
                    target = ''
                    target_match = re.search(r'^(.+?)に対して', desc)
                    if target_match:
                        target = target_match.group(1).strip()

                    campaigns.append({
                        'name': clean_name,
                        'target': target,
                        'description': desc,
                    })
    except Exception as e:
        print(f'Error processing {industry}: {e}', file=sys.stderr)

    result[industry] = campaigns
    print(f'{industry}: {len(campaigns)} campaigns')

output_path = r'C:\Users\yugam\campaign-requirement-tool\src\engine\campaignsData.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f'\nTotal: {sum(len(v) for v in result.values())} campaigns')

# Show samples
for industry in ['EC専業', 'toB', '来店型']:
    print(f'\n=== {industry} (first 5) ===')
    for c in result[industry][:5]:
        print(f"  [{c['name']}] target: [{c['target']}]")
