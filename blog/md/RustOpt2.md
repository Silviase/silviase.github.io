# Rustで始める最適化 ～第1回 二分探索とニュートン法～

<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>
<script type="text/x-mathjax-config">
     MathJax.Hub.Config({
     tex2jax: {
     inlineMath: [["\\(","\\)"], ['$', '$'] ],
     displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
     }
     });
</script>

## 復習：関数をプロットしてみる

以下のコードを見てみましょう.

```Rust
use gnuplot::*;

fn main() {
    let mut x = vec![];
    let mut y = vec![];
    let mut zero = vec![];

    let mut __now__ = 0.0;
    while __now__ < 3.0 {
        x.push(__now__);
        y.push(f(__now__));
        zero.push(0.0);
        __now__ += 0.001; // ステップ幅
    }

    let mut fg = Figure::new();
    fg.axes2d()
        .lines(&x, &y, &[Caption("y = 2x^2+6x-5"), Color("black")])
        .lines(&x, &zero, &[]);
    let _ = fg.save_to_png("f1.png", 300, 300);
}

fn f(x: f64) -> f64 {
    2.0 * x * x + 1.0 * x - 5.0
}
```

関数$f(x)$を切り分けています. ここでは$y = 2x^2+x-5$というものを考えることとします. ```__now__```によって```x```の値を定め, それに対応した```y```の値を得ることが出来ます.
