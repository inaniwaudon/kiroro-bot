# kiroro-bot

キロロくんとおしゃべりする Discord Bot です。
Cloudflare Workers 上で作動します。

![Discord 上での動作画面](sample.png)

## おしゃべりするには

サーバーに招待し、スラッシュコマンド `/kiro <おしゃべりの内容>` で呼び出します。

```
/kiro キロロはお酒飲む？
キロロはお酒は飲めないキロ。

/kiro キロロ6連射
キロロ
キロロ
キロロ
キロロ
キロロ
キロロ
```

## Development

### 初期設定

```
$ npm install
$ brew install ngrok
```

1. [Discord App](https://discord.com/developers/docs/intro) を登録し、以下の API キーを取得します。
    - General Information → Application ID, Public Key
    - Bot → Token

2. Bot → Privileged Gateway Intents より `Message Content Intent` を有効にします。

3. [OpenAI API](https://openai.com/blog/openai-api) に登録し、API キーを取得します。

4. Cloudflare D1 に `kiroro-bot` という名称で DB を追加し、`Database ID` を取得します。

5. `wrangler.example.toml` を `wrangler.toml` としてコピーし、`database_id` を先ほど取得した ID に置換します。
    ```
    cp wrangler.example.toml wrangler.toml
    vi wrangler.toml
    ```

### コマンドの登録

環境変数を登録した上でコマンドを実行し、Slash commands を登録します。

```
$ export DISCORD_APPLICATION_ID=<DISCORD_APPLICATION_ID>
$ export DISCORD_BOT_TOKEN=<DISCORD_BOT_TOKEN>
$ ts-node src/register.ts
```

### ローカル環境で動かす

1. `.dev.vars` に環境変数を記述した上で、以下のコマンドを実行します。  
    `KIRORO_ID` は、開発者モードを有効にした状態で、[右クリック →「ユーザー ID をコピー](https://support.discord.com/hc/ja/articles/206346498-%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC-%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC-%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8ID%E3%81%AF%E3%81%A9%E3%81%93%E3%81%A7%E8%A6%8B%E3%81%A4%E3%81%91%E3%82%89%E3%82%8C%E3%82%8B-)」から取得できます。

    ```
    DISCORD_APPLICATION_ID = "<DISCORD_APPLICATION_ID>"
    DISCORD_PUBLIC_KEY = "<DISCORD_PUBLIC_KEY>"
    DISCORD_BOT_TOKEN = "<DISCORD_TOKEN>"
    OPEN_API_KEY = "<OPEN_API_KEY>"
    KIRORO_ID = "<KIRORO_ID>"
    ```
    ```
    $ npm install
    $ npm run dev
    ```

2. ngrok を用いてローカル環境を公開します。ポート 8787 で起動した場合には、以下のように指定します。

    ```bash
    $ ngrok http 8787
    ngrok
    ...
    Forwarding  https://***.ngrok.io -> http://localhost:8787
    ```

3. ngrok によって割り当てられたアドレス（この場合 `https://***.ngrok.io`）を、Discord App の設定画面の `Interactions Endpoint URL` に設定します。

### Cloudflare Workers へのデプロイ

1. 以下のコマンドを実行し、上記と同じ環境変数を登録した上で、デプロイします。

    ```bash
    $ wrangler secret put DISCORD_APPLICATION_ID
    $ wrangler secret put DISCORD_PUBLIC_KEY
    ...
    $ npm run deploy
    ```

2. `npm run deploy` の出力結果として表示されたアドレス（例：`https://kiroro-bot.<Workersのサブドメイン>.workers.dev/`）を、Discord App の設定画面の `Interactions Endpoint URL` に設定します。

### ユーザを BAN する

心無い利用をするユーザから GPT-3.5 へのアクセスを禁止し、やさしいインターネットを目指しましょう。  
環境変数 `BANNED_USERS` に Discord のユーザネームをスペースなしのカンマ（`,`）区切りで追加します。環境変数が存在しない場合はどのユーザからの応答でも受け付けます。

```
$ wrangler secret put BANNED_USERS
user1,user2
```

BAN されているユーザを確認するには、以下の通りにしゃべりかけます。

```
/kiro BANされてるユーザを教えて
キロロ寿司とusernameが嫌いキロ
```

### ワンピースのネタバレ

ワンピースをいち早く知りたい友人のためにワンピースのネタバレ機能を実装しました。

1. Cloudflare D1 のデータベース上に、以下のテーブルを作成します。
    ```sql
    CREATE TABLE onepiece(
      id INTEGER,
      content TEXT
    );
    ```

2. 以下のコマンドを実行して、ワンピースの情報をスクレイピングで取得し、データベースに追加します。
    ```bash
    export OPEN_API_KEY=<OPEN_API_KEY>
    npm run onepiece
    ```

ネタバレを教えてもらうには、「ワンピース」を含めてしゃべりかけます。

```
/kiro キロロ、ワンピースの1087話好き？
キロロがこっそり教えちゃうキロ……

（1087 話のネタバレ）
```
