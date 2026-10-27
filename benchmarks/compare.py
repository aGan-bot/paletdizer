"""Validate complete benchmark sets and print median metrics for comparison."""
import csv
import json
import statistics
import sys
from pathlib import Path

folders = [Path(arg) for arg in sys.argv[1:]]
if not folders:
    raise SystemExit('Usage: python3 benchmarks/compare.py RESULTS_DIR ...')
reference_orders = None
reference_analytic = {}
for folder in folders:
    manifest = json.loads((folder / 'manifest.json').read_text())
    assert manifest.get('completedAt'), f'Incomplete: {folder}'
    if reference_orders is None:
        reference_orders = manifest['orders']
    assert manifest['orders'] == reference_orders, 'Order hashes differ'
    rows = list(csv.DictReader((folder / 'results.csv').open()))
    assert len(rows) == 33
    for row in rows:
        plan = json.loads((folder / row['plan_file']).read_text())
        assert row['valid'] == 'true' and plan['benchmark']['validation']['valid']
        assert len(plan['placements']) == int(row['placed'])
        if row['mode'] == 'analytic':
            key = row['scenario']
            reference_analytic.setdefault(key, plan['placements'])
            assert reference_analytic[key] == plan['placements'], 'Analytic changed'
    print(folder.name)
    for scenario in sorted({row['scenario'] for row in rows}):
        group = [row for row in rows if row['scenario'] == scenario and row['mode'] == 'ga']
        assert len(group) == 10
        keys = ('placed', 'utilization_percent', 'com_offset_mm', 'com_height_mm',
                'average_support_percent', 'duration_seconds')
        medians = {key: round(statistics.median(float(row[key]) for row in group), 2) for key in keys}
        print(scenario, 'range', min(int(row['placed']) for row in group),
              max(int(row['placed']) for row in group), medians)
print('All plans valid; input hashes and analytic placements identical.')
