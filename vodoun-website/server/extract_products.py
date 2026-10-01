#!/usr/bin/env python3
"""Extrait les produits de src/store.jsx vers server/seed-products.json
(utilisé pour amorcer la table products en PostgreSQL)."""
import re, json, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src_path = os.path.join(ROOT, 'src', 'store.jsx')
out_path = os.path.join(ROOT, 'server', 'seed-products.json')
src = open(src_path, encoding='utf-8').read()
start = src.index('export const ALL_PRODUCTS')
body = src[start:]

def get_quoted(s, key):
    """Valeur entre quotes simples, doubles ou backticks, éventuellement multiligne."""
    m = re.search(r'^\s*' + key + r':\s*(`(?:\\.|[^`\\])*`|\'(?:\\.|[^\'\\])*\'|"(?:\\.|[^"\\])*")\s*,?\s*$', s, re.M | re.S)
    if not m:
        return None
    v = m.group(1)
    q = v[0]
    inner = v[1:-1]
    if q == '`':
        # template literal : on garde le contenu brut (échappements \` et \${ rarement présents)
        inner = inner.replace('\\`', '`')
    else:
        inner = inner.replace('\\' + q, q)
    return inner

def get_array(s, key):
    m = re.search(r'^\s*' + key + r':\s*\[(.*?)\]\s*,?\s*$', s, re.M | re.S)
    if not m:
        return None
    items = re.findall(r'`([^`]*)`|\'([^\']*)\'|"([^"]*)"', m.group(1))
    return [a or b or c for a, b, c in items]

def get_bool(s, key):
    m = re.search(r'^\s*' + key + r':\s*(true|false)\s*,?\s*$', s, re.M)
    return m.group(1) == 'true' if m else None

def get_num(s, key):
    m = re.search(r'^\s*' + key + r':\s*(\d+)\s*,?\s*$', s, re.M)
    return int(m.group(1)) if m else None

blocks = re.split(r'\n\s*\{\s*\n', body)[1:]
products = []
for b in blocks:
    if 'id:' not in b:
        continue
    pid = get_quoted(b, 'id')
    if not pid:
        continue
    p = {
        'id': pid,
        'name': get_quoted(b, 'name'),
        'category': get_quoted(b, 'category'),
        'collection': get_quoted(b, 'collection') or '',
        'deity': get_quoted(b, 'deity'),
        'story': get_quoted(b, 'story'),
        'description': get_quoted(b, 'description') or '',
        'price': get_num(b, 'price'),
        'image': get_quoted(b, 'image'),
        'video': get_quoted(b, 'video'),
        'delay': get_quoted(b, 'delay'),
        'available': get_bool(b, 'available'),
        'isCustomOrder': get_bool(b, 'isCustomOrder'),
        'isNumbered': get_bool(b, 'isNumbered'),
        'hasCertificate': get_bool(b, 'hasCertificate'),
        'variants': get_array(b, 'variants'),
    }
    p = {k: v for k, v in p.items() if v is not None}
    products.append(p)

os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"{len(products)} produits extraits -> server/seed-products.json")
bad = [p['id'] for p in products if p.get('price') is None or not p.get('image')]
if bad:
    print("ATTENTION produits incomplets :", bad)