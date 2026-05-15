# UndertaleキャラクタースプライトシステムのPhaser 4再現 技術調査レポート

## 概要

Undertaleのキャラクタースプライトシステム（モジュラーパーツ構成・独立アニメーション・ピクセルアート・戦闘画面・SOUL制御・タイプライターテキスト）を、Phaser 4で再現するための技術調査結果を報告する。

---

## 1. Container/Groupを使ったモジュラースプライトの実現方法

### 現行コード（Canvas2D独自実装）の課題

現行の `ModularSprite.ts` では、各パーツ（頭・腕・胴体等）を `PixelGrid`（2D配列）として定義し、`offscreen canvas` に事前レンダリングして手動で `ctx.drawImage()` で合成している。パーツごとのオフセットは `computedOffsets` マップで管理しているが、回転・スケール・アルファ等の変形には対応していない。

### Phaser 4の解決策: `Phaser.GameObjects.Container`

`Phaser.GameObjects.Container` は子GameObjectをネストして保持できるコンテナで、**子の位置・回転・スケール・アルファを相対座標で管理**できる。

```typescript
// Phaser 4でのモジュラースプライト実装例
class ModularCharacter extends Phaser.GameObjects.Container {
  private parts: Map<string, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // Container自体の位置がキャラクターの原点になる
  }

  addPart(id: string, textureKey: string, offsetX: number, offsetY: number): void {
    const part = this.scene.add.sprite(offsetX, offsetY, textureKey);
    part.setOrigin(0, 0); // 左上を原点
    this.add(part);       // Containerに子として追加
    this.parts.set(id, part);
  }

  getPart(id: string): Phaser.GameObjects.Sprite | undefined {
    return this.parts.get(id);
  }
}
```

#### 主要API

| API | 説明 |
|-----|------|
| `Phaser.GameObjects.Container` | 子GameObjectをグループ化するコンテナ |
| `container.add(child)` | 子を追加（位置はコンテナからの相対座標） |
| `container.remove(child)` | 子を削除 |
| `container.setPosition(x, y)` | コンテナ全体の位置を設定 |
| `container.setScale(scale)` | コンテナ全体のスケール |
| `container.setAlpha(alpha)` | コンテナ全体の透明度 |
| `container.setRotation(rad)` | コンテナ全体の回転 |
| `container.sort(key)` | 子をプロパティでソート（Z順制御） |
| `container.bringToTop(child)` | 特定の子を最前面に |
| `container.sendToBack(child)` | 特定の子を最背面に |

#### 現行コードとのマッピング

| 現行（Canvas2D） | Phaser 4 |
|------------------|----------|
| `ModularSprite.partCanvases` | `Container.add(sprite)` で子Spriteを管理 |
| `computedOffsets` (Map) | 各子Spriteの `x`, `y` プロパティが相対座標 |
| `render(ctx, x, y)` 手動描画 | Containerが自動的に子を描画 |
| パーツオフセットのアニメーション | Tweenまたは手動で `part.x`, `part.y` を変更 |

---

## 2. パーツごとの独立アニメーション制御

### 現行コードの課題

現行の `ModularSprite.ts` では、1つの `Animation` 定義が全パーツのオフセットを1フレームごとに切り替える方式。パーツごとに独立したタイミングでアニメーションできない（例：頭はゆっくり揺れ、腕は速く振る、は同時に不可能）。

### Phaser 4の解決策: 個別Spriteの個別アニメーション + Tween

Phaser 4では、**各パーツが独立した `Phaser.GameObjects.Sprite` であるため、それぞれが独自のアニメーションを持てる**。

#### 方法A: スプライトシートアニメーション（`Phaser.Animations.AnimationManager`）

```typescript
// 各パーツに独立したアニメーションを定義
this.anims.create({
  key: 'head_idle',
  frames: this.anims.generateFrameNumbers('head_spritesheet', { start: 0, end: 3 }),
  frameRate: 4,
  repeat: -1,  // ループ
});

this.anims.create({
  key: 'left_arm_wave',
  frames: this.anims.generateFrameNumbers('left_arm_spritesheet', { start: 0, end: 5 }),
  frameRate: 8,
  repeat: -1,
});

// 各パーツで個別に再生
headSprite.play('head_idle');
leftArmSprite.play('left_arm_wave');
// これらは完全に独立して動く
```

#### 方法B: Tweenによる位置/回転アニメーション

Undertaleではスプライトシートのフレーム切り替えよりも、パーツの位置オフセット移動が主流。

```typescript
// 頭を揺らす（独立Tween）
this.tweens.add({
  targets: headSprite,
  y: headSprite.y - 2,
  duration: 400,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
});

// 腕を振る（独立Tween、異なるタイミング）
this.tweens.add({
  targets: leftArmSprite,
  y: leftArmSprite.y - 3,
  duration: 200,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut',
});
```

#### 方法C: ハイブリッド方式（推奨）

Undertaleの実際の挙動に最も近い。パーツのテクスチャ（表情変化等）はスプライトシート、位置移動はTweenで制御。

```typescript
class UndertaleCharacter extends Phaser.GameObjects.Container {
  // 表情変化はスプライトシート
  playExpression(key: string): void {
    this.head.play(key); // 'head_happy', 'head_sad' 等
  }

  // 体の動きはTweenで独立制御
  playWalkAnimation(): void {
    this.tweens.add({ targets: this.leftArm, y: '+=2', duration: 200, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.rightArm, y: '-=2', duration: 200, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.head, y: '-=1', duration: 300, yoyo: true, repeat: -1 });
  }
}
```

#### 主要API

| API | 説明 |
|-----|------|
| `Phaser.Animations.AnimationManager.create()` | アニメーション定義をグローバルに登録 |
| `sprite.play(key)` | Spriteのアニメーション再生 |
| `sprite.stop()` | アニメーション停止 |
| `sprite.anims.getProgress()` | 再生進捗（0〜1） |
| `Phaser.Tweens.TweenManager.add()` | Tweenアニメーション追加 |
| `tween.stop()` | Tween停止 |
| `sprite.on('animationcomplete', cb)` | アニメーション完了イベント |
| `sprite.on('animationupdate', cb)` | フレーム更新イベント |

---

## 3. ピクセルアートをクリアに表示するテクスチャ管理

### 現行コードの課題

現行の `Game.ts` では `ctx.imageSmoothingEnabled = false` を手動設定しているが、スケーリング時の補間挙動がブラウザ依存で不安定。また、ドット絵をPixelGrid配列で定義し、offscreen canvasにレンダリングしているが、テクスチャアトラスやパッキングの仕組みがない。

### Phaser 4の解決策: 複数レベルのピクセルアート設定

#### レベル1: グローバル設定（Game Config）

```typescript
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  pixelArt: true,  // ← グローバルピクセルアートモード
  // pixelArt: true は自動的に以下を設定:
  // - 全テクスチャに NEAREST フィルタ（補間なし）
  // - WebGLレンダラで imageSmoothingEnabled = false
  // - Canvasレンダラで ctx.imageSmoothingEnabled = false
  scene: [BattleScene],
};
```

#### レベル2: テクスチャ個別設定（`Phaser.Textures.Texture`）

```typescript
// 特定テクスチャだけピクセルアート設定
const texture = this.textures.get('enemy_sprite');
texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
// または滑らかにしたいテクスチャだけ
texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
```

#### レベル3: Phaser 4新機能 `smoothPixelArt`

```typescript
const config: Phaser.Types.Core.GameConfig = {
  pixelArt: true,
  smoothPixelArt: true,  // Phaser 4の新機能
  // ピクセルアートのブロック感を保ちつつ、
  // 拡大時のテクセル境界を滑らかにする特殊シェーダーパス
};
```

#### レベル4: CSS側の設定

```css
canvas {
  image-rendering: pixelated;       /* Chrome/Firefox */
  image-rendering: crisp-edges;     /* Firefox */
  -ms-interpolation-mode: nearest-neighbor; /* IE */
}
```

#### 主要API

| API | 説明 |
|-----|------|
| `GameConfig.pixelArt` | グローバルピクセルアートモード（NEARESTフィルタ） |
| `GameConfig.smoothPixelArt` | 拡大時テクセル境界を滑らかに（Phaser 4新機能） |
| `texture.setFilter(mode)` | テクスチャ個別のフィルタ設定 |
| `Phaser.Textures.FilterMode.NEAREST` | 最近傍補間（ピクセルアート向け） |
| `Phaser.Textures.FilterMode.LINEAR` | 線形補間 |
| `Phaser.Textures.CanvasTexture` | プログラム的にピクセルを描画可能なテクスチャ |

#### 現行のPixelGrid配列からの移行

現行の `PixelGrid`（色の2D配列）定義は、`Phaser.Textures.CanvasTexture` を使ってそのまま移行可能：

```typescript
// PixelGrid → CanvasTexture に変換
createTextureFromPixelGrid(key: string, grid: PixelGrid, pixelSize: number): void {
  const width = (grid[0]?.length ?? 0) * pixelSize;
  const height = grid.length * pixelSize;
  const canvasTexture = this.textures.createCanvas(key, width, height);
  const ctx = canvasTexture.getContext();

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const pixel = grid[row][col];
      if (pixel !== null) {
        ctx.fillStyle = pixel;
        ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
      }
    }
  }
  canvasTexture.refresh();
}
```

---

## 4. シーンシステムで「戦闘」「メニュー」等を分離する方法

### 現行コードの課題

現行の `BattleManager.ts` は1つのクラスで全フェーズ（intro → player_menu → enemy_attack → battle_end）をステートマシンで管理しており、UIの描画もロジックも1クラスに混在している。

### Phaser 4の解決策: `Phaser.Scene` + `SceneManager`

#### シーンの分離設計

```
BootScene          → アセット読み込み
  ↓
OverworldScene     → マップ探索（ Phaser.Scene ）
  ↓ (エンカウント)
BattleScene        → 戦闘画面（ Phaser.Scene ）
  ├── UIScene      → HP/メニューバーのオーバーレイ（並行実行シーン）
  └── AttackScene  → SOUL回避フェーズ（並行実行シーン）
MenuScene          → 統合メニュー（オーバーレイ）
```

#### シーン定義の基本

```typescript
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  preload(): void {
    this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 32, frameHeight: 32 });
  }

  create(data: { enemyName: string; enemyHP: number }): void {
    // data で前のシーンからパラメータを受け取れる
    this.scene.launch('UIScene');  // 並行してUISceneを起動
  }

  update(time: number, delta: number): void {
    // 毎フレーム処理
  }
}
```

#### シーンの並行実行（UndertaleのHUDに必須）

Undertaleでは戦闘画面とHPバー/メニューが同時に表示される。Phaser 4では複数シーンを並行実行できる：

```typescript
// BattleScene の create() 内で:
this.scene.launch('UIScene');  // UISceneを並行起動（BattleSceneは停止しない）

// UISceneからBattleSceneにアクセス:
const battleScene = this.scene.get('BattleScene');
// データの共有は scene.settings.data または グローバルレジストリ
```

#### シーンのライフサイクル制御

| メソッド | 説明 |
|----------|------|
| `this.scene.start(key, data)` | シーンを開始（現在のシーンは停止） |
| `this.scene.launch(key, data)` | シーンを並行起動（現在のシーンは継続） |
| `this.scene.pause(key)` | シーンを一時停止 |
| `this.scene.resume(key)` | シーンを再開 |
| `this.scene.sleep(key)` | シーンをスリープ（update停止、描画も停止） |
| `this.scene.wake(key)` | スリープから復帰 |
| `this.scene.stop(key)` | シーンを停止・破棄 |
| `this.scene.switch(key)` | 現在のシーンを停止して指定シーンを開始 |
| `this.scene.get(key)` | シーンのインスタンスを取得 |
| `this.scene.bringToTop(key)` | シーンを最前面に |

#### シーン間データ共有

```typescript
// 方法1: グローバルレジストリ
this.registry.set('playerHP', 20);
const hp = this.registry.get('playerHP');

// 方法2: シーン起動時のデータ渡し
this.scene.start('BattleScene', { enemyName: 'Frisk', enemyHP: 50 });
// BattleScene の create(data) で data.enemyName を受け取る

// 方法3: イベント
this.events.emit('damagePlayer', 5);
this.events.on('damagePlayer', (amount) => { ... });
```

#### Undertale風フェーズ遷移の実装パターン

```typescript
class BattleScene extends Phaser.Scene {
  create(data: { enemyName: string }) {
    this.scene.launch('UIScene');

    // イントロ → プレイヤーメニュー → 敵攻撃 → ...のフェーズ管理
    this.registry.set('battlePhase', 'intro');
    this.showIntro(data.enemyName);
  }

  private showIntro(name: string): void {
    // タイプライターテキスト表示後...
    this.time.delayedCall(2000, () => {
      this.registry.set('battlePhase', 'player_menu');
      this.scene.get('UIScene').events.emit('showMenu');
    });
  }
}
```

---

## 5. 入力システムでUndertale風メニュー操作を実現する方法

### 現行コードの課題

現行の `InputManager.ts` は `window.addEventListener` を直接使い、`justPressedSet` で「押した瞬間」を自前管理している。Phaser 4には同等の機能が組み込みで用意されている。

### Phaser 4の解決策: `Phaser.Input.Keyboard`

#### 方法A: Key オブジェクト（推奨）

```typescript
class BattleScene extends Phaser.Scene {
  private confirmKey!: Phaser.Input.Keyboard.Key;
  private cancelKey!: Phaser.Input.Keyboard.Key;
  private arrowKeys!: Phaser.Types.Input.Keyboard.CursorKeys;

  create(): void {
    // 個別キーの取得
    this.confirmKey = this.input.keyboard.addKey('Z');    // Z = 決定
    this.cancelKey = this.input.keyboard.addKey('X');     // X = キャンセル

    // 矢印キー一括取得
    this.arrowKeys = this.input.keyboard.createCursorKeys();
    // arrowKeys.up, arrowKeys.down, arrowKeys.left, arrowKeys.right
  }

  update(): void {
    // 「押した瞬間」の判定
    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.onConfirm();
    }
    if (Phaser.Input.Keyboard.JustDown(this.cancelKey)) {
      this.onCancel();
    }
    if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.left)) {
      this.moveMenuLeft();
    }
    if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.right)) {
      this.moveMenuRight();
    }

    // 「押しっぱなし」の判定（SOUL移動用）
    if (this.arrowKeys.up.isDown) {
      this.soul.moveUp();
    }
  }
}
```

#### 方法B: キーボードイベントリスナー

```typescript
// グローバルキーイベント
this.input.keyboard.on('keydown-Z', () => {
  this.onConfirm();
});

this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
  switch (event.keyCode) {
    case Phaser.Input.Keyboard.KeyCodes.LEFT:
      this.moveMenuLeft();
      break;
  }
});
```

#### Undertale風メニューの実装例

```typescript
class UndertaleMenu {
  private menuIndex = 0;
  private commands = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];
  private confirmKey: Phaser.Input.Keyboard.Key;
  private arrowKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene) {
    this.confirmKey = scene.input.keyboard.addKey('Z');
    this.arrowKeys = scene.input.keyboard.createCursorKeys();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.left)) {
      this.menuIndex = Math.max(0, this.menuIndex - 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.right)) {
      this.menuIndex = Math.min(this.commands.length - 1, this.menuIndex + 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.executeCommand(this.commands[this.menuIndex]);
    }
  }
}
```

#### 主要API

| API | 説明 |
|-----|------|
| `this.input.keyboard.addKey(key)` | Key オブジェクトを取得 |
| `this.input.keyboard.createCursorKeys()` | 矢印キーセットを取得 |
| `Phaser.Input.Keyboard.JustDown(key)` | 押した瞬間か（1フレームのみtrue） |
| `Phaser.Input.Keyboard.JustUp(key)` | 離した瞬間か |
| `key.isDown` | 押しっぱなしか |
| `key.isUp` | 離されているか |
| `this.input.keyboard.on('keydown', cb)` | キーダウンイベント |
| `this.input.keyboard.on('keyup', cb)` | キーアップイベント |
| `this.input.keyboard.addKeys('W,A,S,D')` | 複数キー一括取得 |

---

## 6. タイプライターテキスト効果の実装方法

### 現行コードの課題

現行の `BattleManager.ts` では `dialogueTimer` と `dialogueCharIndex` を手動で管理し、`getVisibleText()` で部分文字列を取得している。ただの `ctx.fillText()` なので、フォントのアンチエイリアスやレイアウトが簡易的。

### Phaser 4の解決策: `Phaser.GameObjects.Text` + タイマー

#### 基本的なタイプライター実装

```typescript
class TypewriterText {
  private textObject: Phaser.GameObjects.Text;
  private fullText: string = '';
  private charIndex: number = 0;
  private speed: number = 33; // ms per character（Undertaleは約30ms）
  private timerEvent?: Phaser.Time.TimerEvent;
  private onComplete?: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.textObject = scene.add.text(x, y, '', {
      fontFamily: '"DotumChe", "Courier New", monospace',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 540 },
      lineSpacing: 4,
    });
  }

  start(text: string, onComplete?: () => void): void {
    this.fullText = text;
    this.charIndex = 0;
    this.onComplete = onComplete;
    this.textObject.setText('');

    this.timerEvent = this.textObject.scene.time.addEvent({
      delay: this.speed,
      callback: this.addChar,
      callbackScope: this,
      loop: true,
    });
  }

  private addChar(): void {
    this.charIndex++;
    this.textObject.setText(this.fullText.substring(0, this.charIndex));

    if (this.charIndex >= this.fullText.length) {
      this.timerEvent?.destroy();
      this.onComplete?.();
    }
  }

  /** Zキーで全文スキップ */
  skip(): void {
    this.timerEvent?.destroy();
    this.charIndex = this.fullText.length;
    this.textObject.setText(this.fullText);
    this.onComplete?.();
  }

  /** 現在表示中か */
  get isTyping(): boolean {
    return this.charIndex < this.fullText.length;
  }
}
```

#### BitmapTextを使ったピクセルパーフェクトな実装

Undertaleのドット絵テキストに最も近いのは `Phaser.GameObjects.BitmapText`：

```typescript
// ビットマップフォントの読み込み
preload(): void {
  this.load.bitmapFont('determination', 'assets/fonts/determination.png', 'assets/fonts/determination.xml');
}

// BitmapTextでタイプライター
create(): void {
  const bitmapText = this.add.bitmapText(52, 264, 'determination', '', 16);
  // BitmapTextはドット絵ベースなので pixelArt: true と相性が良い
}
```

#### DynamicBitmapText（文字ごとにコールバック）

`Phaser.GameObjects.DynamicBitmapText` は**各文字のレンダリング時にコールバック**が呼ばれ、文字単位で位置・色・回転を制御できる：

```typescript
const dynamicText = this.add.dynamicBitmapText(52, 264, 'determination', '', 16);
dynamicText.setDisplayCallback((data: Phaser.Types.GameObjects.BitmapText.DisplayCallbackConfig) => {
  // data.index: 文字のインデックス
  // data.x, data.y: 文字の位置
  // data.color: 文字の色
  // data.scale: スケール
  // data.rotation: 回転

  // 例：今表示された文字を少し大きくする
  if (data.index === this.currentCharIndex) {
    data.scale = 1.2;
  }
  return data;
});
```

#### Undertale特有のテキスト表現

```typescript
// 「*」で始まる行（Undertaleの特徴）
const undertaleText = '* Frisk stands before you.\n* It seems they want to fight.';

// 話者ごとのテキスト速度変化
const speeds = {
  sans: 50,      // 遅い（気だるげ）
  papyrus: 20,   // 速い（勢い）
  normal: 33,    // 標準
};

// 文字ごとの音効果
private addChar(): void {
  this.charIndex++;
  this.textObject.setText(this.fullText.substring(0, this.charIndex));
  this.scene.sound.play('text_beep', { volume: 0.3 }); // ← 毎文字でピッ音
}
```

#### 主要API

| API | 説明 |
|-----|------|
| `Phaser.GameObjects.Text` | ベクターテキスト（Webフォント対応） |
| `Phaser.GameObjects.BitmapText` | ビットマップテキスト（ピクセルパーフェクト） |
| `Phaser.GameObjects.DynamicBitmapText` | 文字単位コールバック付きビットマップテキスト |
| `scene.time.addEvent()` | タイマーイベント（タイプライター用） |
| `timerEvent.destroy()` | タイマー停止 |
| `text.setText(str)` | テキスト内容の更新 |
| `BitmapText.setDisplayCallback()` | 文字単位の表示コールバック |
| `scene.sound.play(key)` | 効果音再生（タイプライター音） |

---

## 既存コードからの移行マッピング総合表

| 現行モジュール | Phaser 4 相当 |
|---------------|---------------|
| `GameLoop.ts` (requestAnimationFrame) | `Phaser.Game` 内蔵ゲームループ |
| `InputManager.ts` | `Phaser.Input.Keyboard` + `JustDown()` |
| `ModularSprite.ts` | `Phaser.GameObjects.Container` + 子 `Sprite` |
| `SpriteRenderer.ts` | `Phaser.Textures.CanvasTexture` + `Sprite` |
| `BattleManager.ts` | `Phaser.Scene`（BattleScene）+ レジストリ |
| `SoulController.ts` | `Phaser.GameObjects.Graphics` または `Sprite` + Tween |
| `frisk.ts` (PixelGrid) | `CanvasTexture` またはスプライトシートPNG |
| タイプライター（BattleManager内） | `Phaser.GameObjects.Text` + `scene.time.addEvent()` |

---

## 推奨アーキテクチャ

```
Phaser.Game (pixelArt: true, width: 640, height: 480)
├── BootScene              ← アセット読み込み、CanvasTexture生成
├── OverworldScene         ← マップ探索
│   └── ModularCharacter   ← Container(head, body, arms, legs)
├── BattleScene            ← 戦闘メイン
│   ├── EnemySprite        ← Container(parts...) + 個別Tween
│   ├── BattleBox          ← Graphics（矩形描画）
│   ├── SoulSprite         ← Sprite + 手動移動 / Arcade Physics
│   └── TypewriterText     ← Text + TimerEvent
├── UIScene (並行)         ← HP、メニューボタン
│   ├── HPBar              ← Graphics
│   └── MenuButtons        ← Text/Image + キーボードナビ
└── MenuScene (オーバーレイ) ← 統合メニュー
```

---

## 結論と次のステップ

1. **モジュラースプライト**: `Container` + 個別 `Sprite` の組み合わせで、現行の `ModularSprite` よりも柔軟な実装が可能。回転・スケール・アルファが自動で子に伝播する。

2. **独立アニメーション**: 各パーツが独立 `Sprite` なので、`sprite.play()` と `scene.tweens.add()` を組み合わせることで、Undertaleの「頭はゆっくり揺れ、腕は速く振る」を自然に実装できる。

3. **ピクセルアート**: `pixelArt: true` の1行設定で `imageSmoothingEnabled = false` とNEARESTフィルタが全テクスチャに適用される。現行のPixelGrid配列は `CanvasTexture` でそのまま移行可能。

4. **シーン分離**: 並行シーン実行（`scene.launch()`）により、戦闘 + UI オーバーレイ構成が実現できる。現行の `BattleManager` のフェーズ管理はシーンの切り替えに置き換え可能。

5. **メニュー操作**: `JustDown()` が現行の `wasJustPressed()` と同等。`createCursorKeys()` で矢印キーが一括取得でき、実装が大幅に簡素化される。

6. **タイプライターテキスト**: `scene.time.addEvent()` と `Text.setText()` の組み合わせで現行と同等の実装が可能。`BitmapText` を使えばピクセルパーフェクトなドット絵テキストも実現できる。

### 次のアクション

- [ ] Phaser 4パッケージのインストール（`npm install phaser`）
- [ ] `BootScene` で現行のPixelGrid定義を `CanvasTexture` に変換
- [ ] `ModularCharacter` クラス（Container継承）の実装
- [ ] `BattleScene` + `UIScene` の並行実行構成の構築
- [ ] SOUL制御のPhaser Arcade Physics / 手動移動への移行
- [ ] `TypewriterText` ユーティリティクラスの実装
