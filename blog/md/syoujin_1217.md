<script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_CHTML"></script>
<script type="text/x-mathjax-config">
     MathJax.Hub.Config({
     tex2jax: {
     inlineMath: [["\\(","\\)"], ['$','$'] ],
     displayMath: [ ['$$','$$'], ["\\[","\\]"] ]
     }
     });
</script>

# 今日の精進

茶色ばっかり4問だけ解いた。

エラーハンドリングというか場合分けができなくなっているなぁとひしひしと感じながらのコーディングだった。

## ABC185D Stamp

両端の外側を青として見ることで全て白だったときなどを同一視することができる。

青と青に挟まれた白い部分のうち、最も狭い領域だけの幅のスタンプを押すことで最小にできる。

\[
\sum \lceil \dfrac{dif}{dif_{\text{min}}} \rceil
\]


```java
public class DStamp {
    public void solve(int testNumber, Scanner in, PrintWriter out) {

        int n = in.nextInt();
        int m = in.nextInt();
        ArrayList<Integer> al = new ArrayList<>();

        al.add(0);
        al.add(n+1);

        for (int i = 0; i < m; i++) {
            al.add(in.nextInt());
        }

        al.sort(Comparator.naturalOrder());
        int mindif = Integer.MAX_VALUE;
        for (int i = 1; i < al.size(); i++) {
            int dif = al.get(i) - al.get(i-1) - 1;
            if(dif > 0){
                mindif = Math.min(mindif, dif);
            }
        }

        long res = 0;
        for (int i = 1; i < al.size(); i++) {
            int dif = al.get(i) - al.get(i-1) - 1;
            if(dif > 0){
                res += MathUtil.ceil(dif, mindif);
            }
        }
        out.println(res);
    }
}

## ABC183D Water Heater

範囲に定数加算は端だけ持って累積和。もう間違えない…

```java
public void solve(int testNumber, Scanner in, PrintWriter out) {

        int n = in.nextInt();
        int w = in.nextInt();
        long[] time = new long[200005];
        for (int i = 0; i < n; i++) {
            int s = in.nextInt();
            int t = in.nextInt();
            int p = in.nextInt();
            time[s] += p;
            time[t] -= p;
        }

        for (int i = 0; i < n; i++) {
            if(i > 0) {
                time[i] += time[i-1];
            }
            if(time[i] > w) {
                out.println("No");
                return;
            }
        }
        out.println("Yes");
    }
```

## ABC181D Hachi

ハマった。3桁以上なら3桁以下の8の倍数を一つ以上作れればいいことがわかる。

文字の登場回数をカウントすることでうまくやれる。

しかし1桁の時に\(4 \to 004\)などとすると40などが作れてしまいダメになってしまう。

これに注意して解く。

```java 
public void solve(int testNumber, Scanner in, PrintWriter out) {
        String s = in.next();
        HashMap<Character, Integer> kaisu = new HashMap<>();

        for(char c: s.toString().toCharArray()){
            kaisu.merge(c, 1, Integer::sum);
        }

        for (int i = 1; 8*i < 1000; i++) {

            if(s.length() <= 1 && i > 10) break;
            if(s.length() <= 2 && i > 100) break;

            String num = s.length() >= 3 ?  String.format("%3s", 8*i).replace(" ", "0")
                        : s.length() >= 2 ? String.format("%2s", 8*i).replace(" ", "0"):
                                            String.format("%1s", 8*i).replace(" ", "0");
            HashMap<Character, Integer> kaisu_n = new HashMap<>();
            for(char c: num.toCharArray()){
                kaisu_n.merge(c, 1, Integer::sum);
            }

            boolean f = true;
            for(char c: kaisu_n.keySet()){
                if(kaisu.containsKey(c)){
                    if(kaisu_n.get(c) > kaisu.get(c)){
                        f = false;
                    }
                }else{
                    f = false;
                }
            }
            if(f){
                out.println("Yes");
                return;
            }
        }
        out.println("No");
    }
```

## ABC177D Friends

UnionFindしてサイズは最後にまとめて数えればいい。あとは鳩ノ巣原理。
```java 
public void solve(int testNumber, Scanner in, PrintWriter out) {

        int n = in.nextInt();
        int m = in.nextInt();
        UnionFind uf = new UnionFind(n);
        int[] size = new int[n];
        for (int i = 0; i < m; i++) {
            uf.union(in.nextInt()-1, in.nextInt()-1);
        }

        for (int i = 0; i < n; i++) {
            size[uf.find(i)]++;
        }

        int max = 0;
        for (int i = 0; i < n; i++) {
            max = Math.max(max, size[i]);
        }

        out.println(max);
    }
```

```

