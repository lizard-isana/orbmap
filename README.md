# OrbMap - SVG Map Generator

OrbMap は、URL パラメータで投影法や中心座標を指定し、ブラウザ上で世界地図の白地図を描画する Web アプリケーションです。表示中の地図は SVG としてダウンロードできます。

内部では D3.js と TopoJSON を使って地図を生成しています。地図データは Natural Earth をもとにした TopoJSON です。

- D3.js: <https://d3js.org/>
- Natural Earth: <https://www.naturalearthdata.com/>

## 使い方

`index.html` を開き、クエリ文字列で表示内容を指定します。

例:

```text
index.html?projection=orthographic&center=35.658099,139.741357&scale=20&accuracy=high&graticule=true&dl=true&draw=circle:35.658099N139.741357E-400KM:red
```

## URL パラメータ

実装は `URLSearchParams` ではなく簡易パーサで解釈しています。挙動を合わせるため、次の点に注意してください。

- 同じ名前のパラメータを複数回書いた場合、最後の値だけが使われます
- 真偽値は `true` / `false` を小文字で指定します
- `draw` は 1 個のパラメータにまとめて、要素をカンマ区切りで列挙します

### 基本設定

| パラメータ | 値 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `projection` | `mercator` / `equirectangular` / `azimuthalequalarea` / `mollweide` / `orthographic` / `satellite` | 未指定時は正距方位図法 | 投影法を指定します。`azimuthalequidistant` という値は実装上は受け付けていません。 |
| `center` | `緯度,経度` または `35.658099N139.741357E` 形式 | `35.675194,139.537833` | 地図の中心座標です。 |
| `latlng` | `center` と同じ | なし | `center` の別名です。`latlng` がある場合は `center` より優先されます。 |
| `latlngstyle` | `notam` | なし | `N/S/E/W` 形式の座標を NOTAM 風の度分秒として解釈します。 |
| `scale` | 数値 | `1.5` | 実装では指定値に 100 を掛けた値を D3 の scale に使います。 |
| `accuracy` | `high` / `mid` / `low` | 未指定時は `world-50m.json` | 読み込む地図データの解像度を切り替えます。 |

補足:

- `center=35.6,139.7` のような 10 進表記は `center` / `latlng` にだけ使えます
- `draw` 内の座標は `N/S/E/W` 形式のみ対応です

### 表示切り替え

| パラメータ | 値 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `graticule` | `true` / `false` | `true` | 経緯線の表示を切り替えます。 |
| `graticule_step` | 数値 | `10` | 経緯線の間隔です。 |
| `map` | `false` | 表示 | 陸地の輪郭線を非表示にします。 |
| `border` | `true` / `false` | `false` | 実装上はパラメータを読みますが、現在は国境データを読み込んでいないため表示には反映されません。 |
| `centermark` | `true` / `false` | `false` | 中心点に小さなマークを描きます。 |
| `terminator` | `true` / `now` / `YYYYMMDD` / `YYYYMMDDhh` / `YYYYMMDDhhmm` / `YYYYMMDDhhmmss` / `false` / `none` | なし | 昼夜境界を重ねます。`true` と `now` は現在時刻、数字は UTC として解釈されます。 |
| `dl` | `true` / `false` | `false` | SVG ダウンロードボタンを表示します。 |

### `satellite` 投影専用

`projection=satellite` のときだけ使われます。

| パラメータ | 値 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `tilt` | 数値 | `0` | 視線の傾きです。実装上は度として扱われます。 |
| `altitude` | 数値 | `600` | 視点高度です。実装上は地球半径 `6371` を使って計算しているため km 想定です。 |
| `fov` | 数値 | `60` | 視野角です。実装上は度として扱われます。 |
| `rotation` | 数値 | `0` | 視線方向まわりの回転です。実装上は度として扱われます。 |

## `draw` パラメータ

`draw` は、描画したい要素をカンマ区切りで並べて指定します。

```text
draw=<object1>,<object2>,<object3>
```

対応しているオブジェクトは次の 3 種類です。

### 円

```text
circle:<latlng>-<distance>[:<color>[:<strokeWidth>]]
```

例:

```text
draw=circle:35.658099N139.741357E-400KM:red:2
```

### 塗りつぶし円

```text
dot:<latlng>-<distance>[:<color>]
```

例:

```text
draw=dot:353929N1394429E-50NM:blue
```

### 線

```text
line:<latlng>-<latlng>[-<latlng>...][:<color>[:<strokeWidth>]]
```

例:

```text
draw=line:35.658099N139.741357E-34.6937N135.5023E:red:2
```

### `draw` で使う座標形式

`draw` の座標は `N/S/E/W` を含む文字列で指定します。

- 10 進表記: `35.658099N139.741357E`
- `latlngstyle=notam` を使う場合: `353929N1394429E`

`notam` 形式では、緯度経度を度分秒の連結値として解釈します。

### 距離の単位

距離は整数 + 単位で指定します。

- `NM`: ノーティカルマイル
- `KM`: キロメートル

例:

- `50NM`
- `400KM`

### 色指定

色は SVG / CSS の色名や 16 進カラーコードを使えます。省略時は各図形ごとの既定色になります。

## サンプル

日本経緯度原点付近を中心にした正射図法で、半径 400 km の赤い円を描く例です。

```text
index.html?projection=orthographic&center=35.658099,139.741357&scale=20&accuracy=high&graticule=true&dl=true&draw=circle:35.658099N139.741357E-400KM:red
```

## License

生成された地図はクリエイティブ・コモンズの表示ライセンス（CC-BY 4.0）に従ってください。

コピーライト表示は以下のいずれかを、プロダクトのどこかに入れていただければ構いません。

```text
OrbMap/Isana Kashiwai
Isana Kashiwai
```

何かに使用したらご一報いただけると作者は大変喜びます。
