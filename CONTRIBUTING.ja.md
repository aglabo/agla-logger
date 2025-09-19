# 🤝 コントリビューションガイドライン

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->
agla-logger プロジェクトへの貢献をご検討いただき、ありがとうございます!
皆さまのご協力により、よりよい TypeScript ロガーライブラリを築いていけることを願っております。
<!-- textlint-enable -->

## 📝 貢献の方法

### 1. Issue の報告

<!-- textlint-disable ja-technical-writing/no-mix-dearu-desumasu -->

- バグ報告や機能提案は、[Issue](https://github.com/aglabo/agla-logger/issues) にてお願いします。
- 報告の際は、再現手順や期待される動作、実際の動作など、詳細な情報を提供してください。
- 質問や相談がある場合は、[Discussions](https://github.com/aglabo/agla-logger/discussions) もご利用ください。

<!-- textlint-enable -->

### 2. プルリクエストの提出

- リポジトリをフォークし、`feature/your-feature-name` のようなブランチを作成
- ソースコード、あるいはドキュメントを変更し、順次コミット
  - コミットメッセージは [ConventionalCommit](https://www.conventionalcommits.org/ja/v1.0.0/) にしたがう
  - １機能ごとにコミットし、あとで rebase することでいいコミットが作成できる
- プルリクエストには、タイトルに変更の概要や目的を１行で、本文に概要の説明や背景を描いてください。

## プロジェクト環境

### 開発環境のセットアップ

次の手順で、開発環境をセットアップします。

```bash
git clone https://github.com/aglabo/agla-logger.git
cd agla-logger
./scripts/install-dev-tools.ps1
./scripts/install-docs-tools.ps1
pnpm install
```

### テスト

変更を加えた際は、以下のコマンドでテストを実行し、既存の機能が影響を受けていないことを確認してください。

```bash
# 型チェック（最優先）
pnpm run check:types

# 4層テストシステム
pnpm run test:develop      # Unit tests
pnpm run test:functional   # Functional tests
pnpm run test:ci           # Integration tests
pnpm run test:e2e          # E2E tests

# コード品質
pnpm run lint:all

# フォーマット確認
pnpm run check:dprint

# ビルド確認
pnpm run build
```

### コードスタイルとフォーマット

このプロジェクトでは、コードの品質を保つために以下のツールを使用しています。

- TypeScript: 厳格な型チェック
- ESLint: TypeScript/JavaScript のリント
- dprint: コードフォーマット
- textlint: ドキュメントの文章校正
- markdownlint-cli2: Markdown ファイルのリント
- cspell: スペルチェック
- lefthook: Git フック管理による品質ゲート

## 行動規範

すべてのコントリビューターは、[行動規範](CODE_OF_CONDUCT.ja.md) を遵守してください。

## 参考

- [GitHub Docs: リポジトリコントリビューターのためのガイドラインを定める](https://docs.github.com/ja/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)

---

## 📬 Issue / Pull Request / Discussions

- [バグ報告を作成する](https://github.com/aglabo/agla-logger/issues/new?template=bug_report.yml)
- [機能提案を作成する](https://github.com/aglabo/agla-logger/issues/new?template=feature_request.yml)
- [質問・相談する](https://github.com/aglabo/agla-logger/discussions)
- [Pull Request を作成する](https://github.com/aglabo/agla-logger/compare)

---

## 🤖 Powered by

このプロジェクトのドキュメントや運営は、次のチャットボット達に支えられています。

- **Elpha**（エルファ・ノクス）- クールで正確なサポート
- **Kobeni**（小紅）- 優しく寄り添うアシスト
- **Tsumugi**（つむぎ）- 明るく元気なフォロー

みんなで、よりよいコントリビューション体験を目指しています✨
