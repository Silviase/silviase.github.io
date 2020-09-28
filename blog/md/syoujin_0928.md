# 今日の精進 9月28日

<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>
<script type="text/x-mathjax-config">
     MathJax.Hub.Config({
     tex2jax: {
     inlineMath: [["\\(","\\)"], ['$', '$']],
     displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
     }
     });
</script>

## ABC105 D Candy Distribution(400)

範囲和は$(N+1)^2$種類あるがそれは$N+1$種類の先頭からの和の組み合わせによって定めることが出来るため, 累積和を用いれば良い.
例えば$[0, l) \equiv [0, r) \text{ mod } M$であるとき, $[l, r)\equiv 0 \text{ mod } M$であることがわかる.
従って, $M$を法とする余りの等しいものの種類を数え, そこから二つ選ぶ組合せを足し上げればよい.

これはHashMapと累積和を用いて実装出来る.

```rust
use proconio::{fastout, input};
use std::collections::HashMap;

#[fastout]
fn main() {
    input! {
        n: usize,
        m: usize,
        a: [usize; n],
    }
    let mut acc = 0;
    let mut hs = HashMap::new();
    hs.insert(0, 1);
    for i in 0..n {
        acc = (a[i] + acc) % m;
        if hs.contains_key(&acc) {
            hs.insert(acc, hs.get(&acc).unwrap() + 1);
        } else {
            hs.insert(acc, 1);
        }
    }

    let mut res = 0usize;
    for val in hs.values() {
        res += val * (val - 1) / 2;
    }
    println!("{}", res);
}
```

## ABC126 E 1 or 2

ある$A_i, A_j$について, $A_i + A_j + x \equiv 0 \text{ mod } 2$であるとき, $x$が一意に定まるとき, $A_i$と$A_j$の偶奇は2パターンであるため, ひとつ分かればもうひとつが分かる.

従ってこれらを同じ連結成分の中にあると考えるとDisjoint Set Unionを利用すれば速い.この場合偶奇までを定めてやる必要が無いために, $X_i, Y_i$をマージした後, 連結成分の個数を考えればよい.実装によらず, 連結成分の個数は親が自分であるものの個数と等しいため, 以下のような実装で良い.

```Rust
use ac_library_rs::Dsu;
use proconio::{fastout, input, marker::Usize1};

#[fastout]
fn main() {
    input! {
        n:usize,
        m:usize,
        xyz:[(Usize1, Usize1, usize); m],
    }
    let mut dsu = Dsu::new(n);
    for i in 0..m {
        dsu.merge(xyz[i].0, xyz[i].1);
    }

    let mut res = 0;
    for i in 0..n {
        if dsu.leader(i) == i {
            res += 1;
        }
    }
    println!("{}", res);
}

```

## ABC089 D Practical Skill Test

$i$からは必ず$i+D$に行き, $i+kD$は$i$までの距離(ただし$i \\% d$を$0$とする)と合わせて累積和で求められるのでよしなにすればよい.
$$
\text{dist}[i] = \text{dist}[i-d] + |i.x - (i-d).x| + |i.y - (i-d).y|
$$
を満たしていれば良いことがわかる.

```rust
use proconio::{fastout, input, marker::Usize1};
use std::collections::HashMap;

#[fastout]
fn main() {
    input! {
        h: usize,
        w: usize,
        d: usize,
        a: [[Usize1; w]; h],
        q: usize,
        lr: [(Usize1, Usize1); q],
    }

    let mut hm = HashMap::new();
    for i in 0..h {
        for j in 0..w {
            hm.insert(a[i][j], (i, j));
        }
    }
    let mut modulo = vec![vec![0i64]; d];
    for i in d..h * w {
        let pn = hm.get(&i).unwrap();
        let pb = hm.get(&(i - d)).unwrap();
        let dist = i64::abs(pb.0 as i64 - pn.0 as i64) + i64::abs(pb.1 as i64 - pn.1 as i64);
        let last = modulo[i % d][modulo[i % d].len() - 1];
        modulo[i % d].push(last + dist);
    }

    for i in 0..q {
        let l = lr[i].0;
        let r = lr[i].1;
        println!("{}", modulo[r % d][r / d] - modulo[l % d][l / d]);
    }
}

```

## ABC103 D Islands War

区間スケジューリング問題に帰着できるのでソートして右端が最も左にあるものから貪欲に取り進めていけばいい.

```rust
use proconio::{fastout, input, marker::Usize1};
use std::cmp::Ordering;

#[fastout]
fn main() {
    input! {
        n: usize,
        m: usize,
        mut ab: [(Usize1, Usize1); m],
    }
    ab.sort_by(|x, y| {
        if x.1 < y.1 {
            Ordering::Less
        } else if x.1 > y.1 || x.0 > y.0 {
            Ordering::Greater
        } else if x.0 < y.0 {
            Ordering::Less
        } else {
            Ordering::Equal
        }
    });

    let mut res = 1;
    let mut now = ab[0].1;
    for i in 1..ab.len() {
        if now <= ab[i].0 {
            res += 1;
            now = ab[i].1;
        }
    }

    println!("{}", res);
}
```

## 報告

GCI 2020 Winterに参加することになりました.
こんな感じのものらしいです.

- 大量のデータを自由自在に解析・分析し、隠れた関係性を発見する。そんなスキルを身につけた「データサイエンティスト」に対する需要は、工学分野だけならず、医療・経済・経営・ライフサイエンスなど非常に多くの分野で高まる一方です。
- 本コースでは、あらゆる分野で武器になるデータの解析・分析スキルのコアとなる機械学習およびビッグデータを扱う技術、分析結果を効果的に可視化する技術の基盤を網羅的に身につけ、一人前のデータサイエンティストとして活躍する入り口に立つことを目指します。

勉強会への参加など, 学内だけでなく広くコミュニティが形成されるよう積極的に取り組んでいきたいと思います.
