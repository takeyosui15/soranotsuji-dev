#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIMBAD天体データ取得スクリプト (HTTP直接方式)
==============================================
Python標準ライブラリのみ使用(pip install不要)

出力: celestial_db.json
用途: 宙の辻アプリの天体検索メニュー用データ

使い方:
  python3 fetch_stars.py
"""

import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

# ============================================================
# 定数
# ============================================================
SIMBAD_TAP_URL = "https://simbad.cds.unistra.fr/simbad/sim-tap/sync"
V_MAG_LIMIT = 6.0
DECIMAL_PLACES = 6
OUTPUT_FILE = "celestial_db.json"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")

# レート制限対策: クエリ間の待機秒数
QUERY_INTERVAL = 3


# ============================================================
# CSVマッピング読み込み
# ============================================================

def load_constellation_ja():
    """星座略号 → 日本語名のマッピングを読み込み"""
    filepath = os.path.join(DATA_DIR, "constellation_ja.csv")
    mapping = {}
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mapping[row["abbr"]] = row["name_ja"]
    return mapping


def load_greek_letters():
    """ギリシャ文字略号 → 記号のマッピングを読み込み"""
    filepath = os.path.join(DATA_DIR, "greek_letters.csv")
    mapping = {}
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mapping[row["key"]] = row["letter"]
    return mapping


def load_star_names_ja():
    """主要恒星のmain_id → 日本語固有名のマッピングを読み込み"""
    filepath = os.path.join(DATA_DIR, "star_names_ja.csv")
    mapping = {}
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mapping[row["main_id"]] = row["name_ja"]
    return mapping


def load_messier_names_ja():
    """メシエ天体のmessier_id → 日本語名のマッピングを読み込み"""
    filepath = os.path.join(DATA_DIR, "messier_names_ja.csv")
    mapping = {}
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mapping[row["messier_id"]] = row["name_ja"]
    return mapping


# ============================================================
# SIMBAD TAP API
# ============================================================

def query_simbad_tap(adql_query, max_retries=3):
    """SIMBAD TAP同期クエリをHTTPで実行し、JSON結果を返す"""
    params = {
        "REQUEST": "doQuery",
        "LANG": "ADQL",
        "FORMAT": "json",
        "QUERY": adql_query,
    }
    data = urllib.parse.urlencode(params).encode("utf-8")

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(SIMBAD_TAP_URL, data=data)
            req.add_header("User-Agent", "SoraNoTsuji/1.0 (celestial-app)")
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result
        except urllib.error.HTTPError as e:
            print(f"  HTTPエラー {e.code}: {e.reason} (リトライ {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  {wait}秒待機中...")
                time.sleep(wait)
            else:
                raise
        except urllib.error.URLError as e:
            print(f"  接続エラー: {e.reason} (リトライ {attempt + 1}/{max_retries})")
            if attempt < max_retries - 1:
                wait = 2 ** (attempt + 1)
                print(f"  {wait}秒待機中...")
                time.sleep(wait)
            else:
                raise

    return None


def parse_tap_json(result):
    """TAP JSON結果をリストの辞書に変換"""
    if not result or "data" not in result:
        return []
    columns = [col["name"] for col in result["metadata"]]
    rows = []
    for data_row in result["data"]:
        row_dict = {}
        for i, col_name in enumerate(columns):
            row_dict[col_name] = data_row[i]
        rows.append(row_dict)
    return rows


# ============================================================
# データ取得関数
# ============================================================

def fetch_bright_stars():
    """V等級 ≤ 6.0の恒星をSIMBAD TAPで取得"""
    print("V等級 ≤ 6.0 の恒星を取得中...")

    query = f"""
    SELECT b.main_id, b.oid, b.ra, b.dec, a.V AS mag,
           b.otype, b.otype_txt, b.sp_type
    FROM basic AS b
    JOIN allfluxes AS a ON b.oid = a.oidref
    WHERE a.V <= {V_MAG_LIMIT}
      AND a.V IS NOT NULL
      AND b.ra IS NOT NULL
      AND b.dec IS NOT NULL
    ORDER BY a.V ASC
    """

    result = query_simbad_tap(query)
    rows = parse_tap_json(result)
    print(f"  取得件数: {len(rows)}")
    return rows


def fetch_messier_objects():
    """メシエ天体 M1〜M110 を取得(IN句方式)"""
    print("メシエ天体を取得中...")

    # SIMBAD識別名ではM1はnormIdにより "M   1" となるため、ident.idで検索
    # IN句でまとめてクエリ
    messier_ids = ", ".join([f"'M   {i}'" if i < 10
                            else f"'M  {i}'" if i < 100
                            else f"'M {i}'" for i in range(1, 111)])

    query = f"""
    SELECT i.id AS messier_id, b.main_id, b.oid, b.ra, b.dec,
           a.V AS mag, b.otype, b.otype_txt
    FROM ident AS i
    JOIN basic AS b ON i.oidref = b.oid
    LEFT JOIN allfluxes AS a ON b.oid = a.oidref
    WHERE i.id IN ({messier_ids})
      AND b.ra IS NOT NULL AND b.dec IS NOT NULL
    """

    result = query_simbad_tap(query)
    rows = parse_tap_json(result)
    print(f"  取得件数: {len(rows)}")
    return rows


def fetch_identifiers(oid_list):
    """指定したoid群の識別名を取得(バッチ分割)"""
    print("識別名を取得中...")

    all_rows = []
    batch_size = 5000

    for i in range(0, len(oid_list), batch_size):
        batch = oid_list[i:i + batch_size]
        oid_csv = ", ".join(str(oid) for oid in batch)

        query = f"""
        SELECT oidref, id
        FROM ident
        WHERE oidref IN ({oid_csv})
        """

        result = query_simbad_tap(query)
        rows = parse_tap_json(result)
        all_rows.extend(rows)
        print(f"  バッチ {i // batch_size + 1}: {len(rows)} 件")

        if i + batch_size < len(oid_list):
            time.sleep(QUERY_INTERVAL)

    print(f"  識別名合計: {len(all_rows)} 件")
    return all_rows


# ============================================================
# 変換・生成関数
# ============================================================

def ra_deg_to_hours(ra_deg):
    """RA(度) → RA(時) 変換。Astronomy Engine互換形式。"""
    return round(ra_deg / 15.0, DECIMAL_PLACES)


def parse_bayer_designation(main_id):
    """
    SIMBADのmain_idからバイエル符号を解析
    例: "* alf CMa" → ("alf", "CMa")
    """
    match = re.match(r'^\*\s+(\w+\.?)\s+(\w+)$', main_id)
    if match:
        return match.group(1), match.group(2)
    return None, None


def generate_name_ja(main_id, identifiers, star_names_ja,
                     constellation_ja, greek_letters):
    """天体の日本語名を生成"""
    # 1. 固有名テーブルから検索
    if main_id in star_names_ja:
        return star_names_ja[main_id]

    # 2. バイエル符号から日本語名を自動生成
    greek_key, const_abbr = parse_bayer_designation(main_id)
    if greek_key and const_abbr:
        greek_letter = greek_letters.get(greek_key, greek_key)
        const_ja = constellation_ja.get(const_abbr, const_abbr)
        return f"{const_ja} {greek_letter}星"

    # 3. HD番号があればそれを使用
    for ident in identifiers:
        if ident.startswith("HD "):
            return ident
    # 4. HIP番号にフォールバック
    for ident in identifiers:
        if ident.startswith("HIP "):
            return ident

    # 5. main_idをそのまま使用
    return main_id


def generate_keys_ja(main_id, identifiers, otype_txt,
                     constellation_ja, greek_letters):
    """日本語検索キーワードを生成"""
    keys = []
    greek_key, const_abbr = parse_bayer_designation(main_id)
    if const_abbr:
        const_ja = constellation_ja.get(const_abbr, "")
        if const_ja:
            keys.append(const_ja)
    if greek_key and const_abbr:
        greek_letter = greek_letters.get(greek_key, greek_key)
        keys.append(f"{greek_letter} {const_abbr}")
    if otype_txt:
        keys.append(otype_txt)
    return ", ".join(keys)


def generate_keys_en(main_id, identifiers):
    """英語検索キーワードを生成"""
    keys = [main_id]
    for ident in identifiers:
        if any(ident.startswith(prefix) for prefix in
               ["HD ", "HIP ", "HR ", "NGC ", "IC ", "NAME "]):
            keys.append(ident)
    return ", ".join(keys[:5])


# ============================================================
# JSON構築
# ============================================================

def build_json(stars, messier, all_identifiers,
               star_names_ja, messier_names_ja,
               constellation_ja, greek_letters):
    """最終JSONデータを構築"""
    print("JSONデータを構築中...")

    # 識別名をoid別に整理
    ident_map = {}
    for row in all_identifiers:
        oid = row["oidref"]
        if oid not in ident_map:
            ident_map[oid] = []
        ident_map[oid].append(row["id"])

    output = []
    seen_oids = set()

    # 恒星データ
    for row in stars:
        oid = row["oid"]
        if oid in seen_oids:
            continue
        seen_oids.add(oid)
        identifiers = ident_map.get(oid, [])
        name_ja = generate_name_ja(
            row["main_id"], identifiers,
            star_names_ja, constellation_ja, greek_letters)
        entry = {
            "name": name_ja,
            "ra": ra_deg_to_hours(float(row["ra"])),
            "dec": round(float(row["dec"]), DECIMAL_PLACES),
            "mag": round(float(row["mag"]), 2),
            "type": "恒星",
            "keysJa": generate_keys_ja(
                row["main_id"], identifiers,
                row.get("otype_txt", ""),
                constellation_ja, greek_letters),
            "keysEn": generate_keys_en(row["main_id"], identifiers),
        }
        output.append(entry)

    # メシエ天体
    for row in messier:
        oid = row["oid"]
        if oid in seen_oids:
            continue
        seen_oids.add(oid)
        identifiers = ident_map.get(oid, [])
        # messier_idからM番号を抽出(例: "M   1" → "M1")
        messier_num = row["messier_id"].replace(" ", "")
        name_ja = messier_names_ja.get(messier_num, messier_num)
        mag_value = float(row["mag"]) if row["mag"] is not None else None
        entry = {
            "name": name_ja,
            "ra": ra_deg_to_hours(float(row["ra"])),
            "dec": round(float(row["dec"]), DECIMAL_PLACES),
            "mag": round(mag_value, 2) if mag_value is not None else None,
            "type": row.get("otype_txt", "深宇宙天体") or "深宇宙天体",
            "keysJa": f"{name_ja}, メシエ天体",
            "keysEn": generate_keys_en(row["main_id"], identifiers),
        }
        output.append(entry)

    # 等級順ソート(Noneは末尾)
    output.sort(key=lambda x: (x["mag"] is None, x["mag"] if x["mag"] is not None else 99))
    return output


# ============================================================
# メイン処理
# ============================================================

def main():
    print("=" * 60)
    print("SIMBAD天体データ取得スクリプト (HTTP直接方式)")
    print("依存: Python標準ライブラリのみ (pip install不要)")
    print("=" * 60)

    # CSVマッピング読み込み
    print("\nCSVマッピングファイルを読み込み中...")
    constellation_ja = load_constellation_ja()
    print(f"  星座: {len(constellation_ja)} 件")
    greek_letters = load_greek_letters()
    print(f"  ギリシャ文字: {len(greek_letters)} 件")
    star_names_ja = load_star_names_ja()
    print(f"  恒星固有名: {len(star_names_ja)} 件")
    messier_names_ja = load_messier_names_ja()
    print(f"  メシエ天体名: {len(messier_names_ja)} 件")

    # Step 1: 恒星データ取得
    print()
    stars = fetch_bright_stars()
    time.sleep(QUERY_INTERVAL)

    # Step 2: メシエ天体取得
    messier = fetch_messier_objects()
    time.sleep(QUERY_INTERVAL)

    # Step 3: 全oidを集めて識別名を取得
    all_oids = list(set(
        [row["oid"] for row in stars] +
        [row["oid"] for row in messier]
    ))
    print(f"\n全天体数(重複除去後): {len(all_oids)}")
    identifiers = fetch_identifiers(all_oids)

    # Step 4: JSON構築
    print()
    output = build_json(
        stars, messier, identifiers,
        star_names_ja, messier_names_ja,
        constellation_ja, greek_letters)

    # Step 5: ファイル出力
    output_path = os.path.join(SCRIPT_DIR, OUTPUT_FILE)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {OUTPUT_FILE} に {len(output)} 件出力しました")

    # サンプル表示
    print("\n--- サンプル(上位5件) ---")
    for entry in output[:5]:
        print(f"  {entry['name']}: RA={entry['ra']}h, Dec={entry['dec']}°, "
              f"Mag={entry['mag']}, Type={entry['type']}")


if __name__ == "__main__":
    main()
