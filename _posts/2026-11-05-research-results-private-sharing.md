---
title: '研究の途中経過を、許可した人だけがブラウザで見られるようにする'
date: 2026-11-05 09:00:00 +0900
excerpt: '静的ファイル、Cloudflare Tunnel、Cloudflare Accessで実験結果を限定公開する最小構成'
---

共同研究で、LLMの評価結果を共同研究者にブラウザで見てもらう必要があった。未発表の結果なので一般には公開できず、相手の端末にVPNなどを入れてもらうのも避けたかったため、次の構成で限定公開した。最小限の構成として紹介する。

## 構成

<img
width="1000"
alt="閲覧者のブラウザからCloudflare AccessとTunnelを経由して手元のサーバーへ届く構成図"
src="/assets/images/blog/20261105/fig1-architecture.png"
/>

閲覧者がURLを開くと、Cloudflare Accessのログイン画面が表示される。メールアドレスを入力すると、許可したアドレスにだけワンタイムコードが届き、それを入力すると先へ進める。認証を通ったリクエストは、Cloudflare Tunnelを通って手元のサーバーに届き、HTTPサーバーが生成済みのファイルを返す。

| 要素 | 役割 |
| --- | --- |
| 閲覧用ファイル | 保存済みの実験結果から書き出したHTML・JSON・画像・PDF |
| HTTPサーバー | `127.0.0.1` だけで待ち受け、閲覧用ファイルを返す |
| cloudflared | サーバー側からCloudflareへ接続を張り、届いたリクエストをHTTPサーバーへ渡す |
| Cloudflare Access | 許可したメールアドレスの人だけを通す |
| systemd | HTTPサーバーとcloudflaredを常駐させ、異常終了したら再起動する |

今回は全体の結果を説明するスライド、問題ごとにモデルの回答と採点を読むビューア、スライドのPDFを同じホスト名の下に置いた。どれも保存済みの結果から書き出した静的なファイルで、閲覧するときにモデルやAPIは呼び出さない。

## 手順

1. 見せる内容を、HTML・JSON・画像などのファイルとして一つのフォルダに書き出す。
2. そのフォルダを、`127.0.0.1` だけで待ち受けるHTTPサーバーで配信する。
3. [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/)を作成し、公開するホスト名からそのHTTPサーバーへ転送するように設定する。
4. Cloudflare Accessで同じホスト名のアプリケーションを作成する。メールの[One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)を有効にし、許可するメールアドレスをポリシーに書く。
5. HTTPサーバーとcloudflaredを、systemdなどのサービスとして常駐させる。
6. ログインしていないブラウザでサイトを開き、認証画面に移ることを確かめる。

たとえば次のコマンドで、手順2のHTTPサーバーを動かせる。Pythonのドキュメントでは `http.server` を本番環境に使うことは推奨されていないので、必要に応じて使い慣れたサーバーに置き換えてほしい。

```bash
python3 -m http.server 8080 --bind 127.0.0.1 --directory public
```

cloudflaredはサーバー側からCloudflareへ外向きの接続を張るので、サーバーに公開IPを割り当てたり、外から接続を受けるポートを開けたりする必要はない。HTTPサーバーを `127.0.0.1` で待ち受けにしておくと、同じネットワークにある別のマシンからも直接は開けない。

手順4ではパスを絞らずにホスト名全体を対象にした。こうすると、ページを経由せずにJSONや画像のURLを直接開いた場合も認証を求められる。閲覧者はアカウントを作る必要がなく、メールアドレスを入力して届いたコードを入れるだけだ。コードは10分で失効し、許可されていないアドレスにはメールが送られない。

## 注意点

- 配信元のサーバーとネットワーク接続を動かし続ける必要がある。サーバーを止めたり回線が切れたりすると、閲覧者はサイトを開けなくなる。
- Tunnelのトークンは本人だけが読めるファイルに置き、Gitや配信用フォルダには入れない。
- Tunnelのホスト名設定で「Protect with Access」を有効にすると、cloudflaredがAccessのトークンを検証し、Accessを経由していないリクエストを拒否する。設定方法は[Cloudflareの資料](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)にある。
- 認証と配信の部分はほかの研究でもそのまま使えるが、実験結果を閲覧用ファイルに変換する処理と、ビューアに表示する項目は、扱うデータに合わせて作る必要がある。
