# Koushi sample / 動作確認サンプル

Open the Markdown preview (`Cmd+Shift+V` / `Ctrl+Shift+V`). Each ` ```koushi ` fence
below should render as a bordered table. If you still see raw text, the extension is
not installed or the window needs a reload.
プレビューで下の各フェンスが罫線つきの表になれば成功です。

## 1. Spanning cells / 結合セル(このアイコンの絵そのもの)

```koushi
- t:1.
  - r:1.
    - c:1:xc2. spanning 2 columns
    - c:3:xr2. spanning 2 rows
  - r:2.
    - c:1:xr2. spanning 2 rows
    - c:2:c. center
  - r:3.
    - c:2:xc2. spanning 2 columns
```

## 2. State-transition table with borders / 罫線つきの状態遷移表

`bd`=double, `bs`=bold solid, `ba`=dashed, `bo`=dotted.
Row = top edge, cell = left edge. / 行=上辺・セル=左辺。

```koushi
- t:1.
  - r:1:h.
    - c:1:xr2. State
    - c:2:xc2:bd. Search events
    - c:4:xc2:bd. Edit events
  - r:2:h.
    - c:2:bd. run
    - c:3. filter
    - c:4:bd. change
    - c:5. reset
  - r:3:bs.
    - c:1. empty
    - c:2:bd. results
    - c:3. -
    - c:4:bd. empty
    - c:5. empty
  - r:4:ba.
    - c:1. results
    - c:2:bd. results (re-run)
    - c:3. results (re-derived)
    - c:4:bd. modified
    - c:5. empty
```

## 3. Checklist with inputs / チェックリスト

```koushi
- t:1.
  - r:1:h.
    - c:1. done
    - c:2. item
  - r:2.
    - c:1:c.
      - chb:on.
    - c:2. build the harness
  - r:3.
    - c:1:c.
      - chb.
    - c:2. run the regression
```

## 4. Input tokens / input要素の早見(代表8種)

Numbers like `c:1.` are only markers for humans — the renderer skips them.
数字はただの目印で、描画時は読み飛ばされます。

```koushi
- t:1.
  - r:1:h.
    - c:1. token
    - c:2. rendered
    - c:3:bd. token
    - c:4. rendered
  - r:2.
    - c:1. chb:on.
    - c:2.
      - chb:on.
    - c:3:bd. rad:on.
    - c:4.
      - rad:on.
  - r:3.
    - c:1. btn:"Run".
    - c:2.
      - btn:"Run".
    - c:3:bd. txt:"your name".
    - c:4.
      - txt:"your name".
  - r:4.
    - c:1. dat:"2026-08-09".
    - c:2.
      - dat:"2026-08-09".
    - c:3:bd. clr:"#f0b429".
    - c:4.
      - clr:"#f0b429".
```

## 5. Other fences are untouched / 他のフェンスは従来通り

```js
const answer = 42;   // normal JS highlighting
```
