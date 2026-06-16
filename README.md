# 証拠説明書ビルダー

証拠説明書を作成するための、HTML/CSS/JavaScriptだけで動く静的Webアプリです。

GitHub Pagesでそのまま公開できます。ローカルで使う場合は、`index.html` をブラウザで開いてください。

## できること

- PDFを右側フレームで確認
- PDFフレームを単体表示
- 入力欄とPDFだけを並べる「入力＋証拠」表示
- PDFを左回転・右回転・回転リセット
- 入力欄、PDF欄、プレビュー欄をそれぞれ拡大表示
- 選択中の証拠番号をPDF右上に赤枠でプレビュー
- 左側で次の項目を入力
  - 証拠の標目
  - 写／原本の別（写し・原本）
  - 作成日付
  - 作成者
  - 立証趣旨
- 甲・乙・弁の番号を自動連番
- 標準書式の証拠説明書プレビューを表示
- 「プレビュー」ボタンで証拠説明書だけを大きく確認
- ブラウザの印刷機能でPDF保存
- 入力データのJSON書き出し・読み込み

## GitHub Pagesで公開する

1. このフォルダ内のファイルをGitHubリポジトリのルートに置く
2. GitHubの `Settings` → `Pages` を開く
3. `Build and deployment` の `Source` を `Deploy from a branch` にする
4. `Branch` を `main`、フォルダを `/ (root)` にして保存

公開URLは通常、次の形式になります。

```text
https://<ユーザー名>.github.io/<リポジトリ名>/
```

## Release用ZIP

Releaseでは、`index.html`、`styles.css`、`app.js`、`README.md` を含むZIPを配布してください。

## プライバシー

PDFはブラウザ上でローカル参照するだけです。サーバーへのアップロードやPDFの複製は行いません。
