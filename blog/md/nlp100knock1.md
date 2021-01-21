# 言語処理100本ノック解説 その1

<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>
<script type="text/x-mathjax-config">
     MathJax.Hub.Config({
     tex2jax: {
     inlineMath: [["\\(","\\)"] ],
     displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
     }
     });
</script>


ソースコードは[Silviaseのgithub](https://github.com/Silviase/NLP100)に保管してあるので, ここには考えたことだけ入れようと思う.

## 0. 文字列の逆順

```array[A:B:C]```のイメージを持つとすれば, ```range(A,B,C)```と同じで,
A以上B未満, 間隔Cでというようなもの.

## 1. パタトクカシーー

1文字目から2字おきによめばよいことがわかるので, ```s[1::2]```でよい.

## 2. 「パトカー」＋「タクシー」＝「パタトクカシーー」

```zip()```はiterableなオブジェクトの要素を同時に取得することができる.

## 3. 円周率

,(カンマ) や.(ピリオド)を取り除きたいので, ```re.sub("置換したい正規表現", "置換先文字列", 適用する文字列)```をしてやればよい.
そのあと```split()```で分割し, それぞれの文字列に対して```len()```を適用して文字列長を得ることができる.

## 4. 元素記号

リスト内包表記で```strip()```, ```split()```を組み合わせることが有効である。dictの番号は1-indexedのほうが個人的に気持ちがよい.

## 5. n-grams

単語ごとにsplitして指定の数入れればよい(指定された語数に届いていない場合は空とした). 文字n-gramの場合は単語n-gramと合わせて二次元配列にするべきか悩んだが今回は素直な実装とした.

## 6. 集合

listはset()を用いてsetに出来る. 集合演算は```+-&```や```union(),difference(),intersection()```などで行うことが出来る.

## 7. テンプレートによる文生成

```format()```メソッドを利用する.{}の中身は```{(添字):(文字寄)(幅)(小数点)(型)}```などのようにするといい感じな指定が出来る.適宜省略は可能である.

## 8. 暗号文

正規表現で言うところの```[a-z]```は```string.ascii_lowercase```で表現できる(知らなかった).これを利用してやることで少しきれいにかける.```ord()```は```char→ascii```, ```chr()```は```ascii→char```であるからこれを利用してやればいい.

## 9. Typoglycemia

長さが指定したもの以下ならそのまま単語をlistに入れる.
そうでなければ先頭は```s[0]```, 末尾は```s[-1]```で取得することができるから, これを利用する.
順序をランダムに入れ替えるのは```random.sample((対象), (回数))```を利用する.
listを結合するのは```join```を用いればよい. 先頭に置くのは間に詰める文字であることがなんとなく気持ちが悪いし直感的で無い気もするがそういうものだと思うことにする.