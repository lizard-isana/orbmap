OrbMap - Globe Map Generator

  OrbMapは任意の投影法で世界地図の白地図を生成するWebアプリケーションです。
  ・URLパラメータを指定することで、投影法や中心座標などの各種の設定や図形描画などができます。
  ・表示された白地図をSVG形式でダウンロードできます

    内部的にはD3.jsライブラリを使用し、TopoJSON形式の地図データをSVGに変換しています。
　　地図データはNatural Earthの10mメッシュのものをTopoJSONに変換して使用しています。
      https://d3js.org/
      http://www.naturalearthdata.com/

【ライセンス】
  生成された地図はクリエイティブ・コモンズの表示ライセンス（CC-BY 4.0）に従ってください。
　コピーライト表示は以下のいずれかを、プロダクトのどこかに入れていただければ構いません。
　（地図中にも表示されていますが、別の場所に書いてあれば消しても構いません）
    OrbMap/Isana Kashiwai
    Isana Kashiwai

  何かに使用したらご一報いただけると作者は大変喜びます。

【URLパラメータ】

◎投影法
  projection=[投影法]
    投影法は以下の通り（デフォルトは正距方位図法）、
      azimuthalequidistant（正距方位図法）
      equirectangular（正距円筒図法）
      mercator（メルカトル図法）
      mollweide（モルワイデ図法）
      orthographic（正射図法）

◎中心座標
　　latlng=[緯度,経度]

◎スケール
    scale=[スケール]
      1.0でほぼ地図全体を表示します。デフォルトは1.0。

◎緯度経度線
　graticule=[true/false]
    trueで表示、falseで非表示。デフォルトはtrue。

◎国境線
　border=[true/false]
    trueで表示、falseで非表示。デフォルトはtrue。

◎図形表示
  draw = [エリア1],[エリア2]...

  円（中心点と直径で指定）
    circle:[緯度経度1]-[半径(NM/KM)](:[色])

  塗りつぶし円（中心点と直径で指定）
    dot:[緯度経度1]-[半径(NM/KM)](:[色])

  直線
    line:[緯度経度1]-[緯度経度2]-[緯度経度3]-[緯度経度4](:[色])

  各エリアは[形状]:[位置情報]:[色]を１セットとしてカンマ区切りで複数指定可能
  [位置情報]は"-"で区切る

  緯度経度は[緯度](N/S)[経度](W/S)の形式
    [緯度/経度]に小数点が含まれていると度と解釈
    小数点抜きの数字ではNORTAMで使われる度(1-3桁)分(2桁)秒(2桁)の形式と解釈

  半径の単位は
    NM=ノーティカルマイル(=1.852KM)
    KM=キロメートル

  色はSVGのカラーキーワードが使えます
    https://www.w3.org/TR/SVG/types.html#ColorKeywords
    省略すると適当なグレースケールで表示します
　　

【サンプル】
日本経緯度原点を中心に、半径400kmの赤い円を描く
https://www.lizard-tail.com/isana/orb/map/?projection=orthographic&latlng=35.658099,139.741357&scale=20&accuracy=high&graticule=true&dl=true&draw=&draw=circle:35.658099N139.741357E-400KM:red

【作者/管理者】
  柏井 勇魚(KASHIWAI, Isana)
  e-mail: isana.k at gmail.com
  Twitter: @lizard_isana
