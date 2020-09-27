# 今日の精進 9月27日

<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>
<script type="text/x-mathjax-config">
     MathJax.Hub.Config({
     tex2jax: {
     inlineMath: [["\\(","\\)"],['$','$'], ],
     displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
     }
     });
</script>

## AGC032 B - Balanced Neighbors(700点)

偶数の時は, $1\leftrightarrow N, 2\leftrightarrow N-1, ...$のように和が$N+1$となるようにペアを組めばよく,
それ以外の頂点へ辺を伸ばすことによって和が$\dfrac{N(N+1)}{2} - (N+1)$となる.
これに$N+1$を加える場合, $1...N$のすべてに辺を伸ばすことによって各頂点の和は$\dfrac{N(N+1)}{2}$となるためにこれで満たされる.

```rust
use proconio::{fastout, input};

#[fastout]
fn main() {
    input! {
        n: usize,
    }

    // kは必ずn以下の最大の偶数になる
    let mut v = vec![];
    let k = n / 2 * 2;
    for i in 1..=k {
        for j in i + 1..=k {
            if i + j != k + 1 {
                v.push((i, j));
            }
        }
    }

    if n != k {
        for i in 1..n {
            v.push((i, n));
        }
    }

    println!("{}", v.len());
    for e in v {
        println!("{} {}", e.0, e.1);
    }
}
```

## ABC126D Even Relation (400点)

ある根を定めたとき, そこからの距離の偶奇を考えればよい.

```rust
use proconio::{fastout, input, marker::Usize1};
use std::cmp::Ordering;
use std::collections::BinaryHeap;
#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: usize,
    pos: usize,
}

impl Ord for State {
    fn cmp(&self, other: &State) -> Ordering {
        other
            .cost
            .cmp(&self.cost)
            .then_with(|| self.pos.cmp(&other.pos))
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &State) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
#[derive(Copy, Clone, Eq, PartialEq)]

pub struct Edge {
    to: usize,
    cost: usize,
}

impl Edge {
    fn new(to: usize, cost: usize) -> Edge {
        Edge { to, cost }
    }
}

pub struct AdjList {
    dim: usize,
    list: Vec<Vec<Edge>>,
}

impl AdjList {
    pub fn new(d: usize) -> AdjList {
        AdjList {
            dim: d,
            list: vec![vec![]; d],
        }
    }

    pub fn add_edge(&mut self, from: usize, to: usize, cost: usize) {
        self.list.get_mut(from).unwrap().push(Edge::new(to, cost));
    }

    pub fn add_undirected_edge(&mut self, from: usize, to: usize, cost: usize) {
        self.list.get_mut(from).unwrap().push(Edge::new(to, cost));
        self.list.get_mut(to).unwrap().push(Edge::new(from, cost));
    }

    fn shortest_paths(&self, start: usize) -> Vec<usize> {
        let mut dist: Vec<_> = (0..self.list.len())
            .map(|_| 1_000_000_000_000_000_000)
            .collect();
        let mut heap = BinaryHeap::new();
        dist[start] = 0;
        heap.push(State {
            cost: 0,
            pos: start,
        });
        while let Some(State { cost, pos }) = heap.pop() {
            if cost > dist[pos] {
                continue;
            }
            for edge in &self.list[pos] {
                let next = State {
                    cost: cost + edge.cost,
                    pos: edge.to,
                };
                if next.cost < dist[next.pos] {
                    heap.push(next);
                    dist[next.pos] = next.cost;
                }
            }
        }
        dist
    }
}

#[fastout]
fn main() {
    input! {
        n:usize,
    }

    let mut g = AdjList::new(n);
    for i in 0..n - 1 {
        input! {
            u:Usize1,
            v:Usize1,
            w:usize,
        }
        g.add_undirected_edge(u, v, w);
    }

    let dist = g.shortest_paths(0);

    for i in 0..n {
        println!("{}", dist[i] % 2);
    }
}
```

実際は貼り付けるだけなのでUsize1にだけ注意して一点から各距離の最短距離を求めるのはDijkstra法の副産物として生じるのでこれを利用する.
