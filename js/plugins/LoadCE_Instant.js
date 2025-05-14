/*:
 * @target MZ
 * @plugindesc ロード直後（画面暗転中）にコモンイベントを即時実行する
 * @author ChatGPT
 *
 * @param CommonEventId
 * @text コモンイベントID
 * @type common_event
 * @default 153
 * @desc ロード直後に走らせたいコモンイベント番号
 *
 * @help
 * ----------------------------------------------------
 * ■概要
 *  1. Scene_Load.onLoadSuccess で「ロード成功」フラグを立てる
 *  2. Scene_Map.start の *冒頭* でそのフラグを検知し、
 *     指定コモンイベントを *独立 Interpreter* で即時実行
 *  3. 完了後に通常の start を呼ぶ → その直後にフェードイン開始
 *
 *  これにより、画面が真っ黒なうちにスイッチ操作・変数操作など
 *  ロジック系コマンドを完了させられます。
 *
 * ■注意
 *  ・メッセージ表示、ピクチャ表示、ウェイトを含むと暗転中に
 *    裏で実行されユーザに見えません。ロジック処理専用と考えて
 *    ください。
 *  ・ニューゲーム時には発火しません。
 *
 * ■更新履歴
 *   1.0.0 (2025‑05‑13) 初版
 * ---------------------------------------------------- */
(() => {
  "use strict";

  // ─────────────────────────────────────────
  // パラメータ
  // ─────────────────────────────────────────
  const pluginName = "LoadCE_Instant";
  const params     = PluginManager.parameters(pluginName);
  const CE_ID      = Number(params.CommonEventId || 1);

  // ロード成功フラグを $gameSystem に保持
  const LOAD_FLAG  = "_loadCE_InstantFlag";

  // ─────────────────────────────────────────
  // 1) Scene_Load.onLoadSuccess : フラグ ON
  // ─────────────────────────────────────────
  const _Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
  Scene_Load.prototype.onLoadSuccess = function() {
    $gameSystem[LOAD_FLAG] = true;      // ロード成功を記録
    _Scene_Load_onLoadSuccess.call(this);
  };

  // ─────────────────────────────────────────
  // 2) Scene_Map.start : フェードイン前に即実行
  // ─────────────────────────────────────────
  const _Scene_Map_start = Scene_Map.prototype.start;
  Scene_Map.prototype.start = function() {

    // 🔸ここはフェードインが走る前
    if ($gameSystem[LOAD_FLAG]) {
      $gameSystem[LOAD_FLAG] = false;   // 一度きり

      const ce = $dataCommonEvents[CE_ID];
      if (ce) {
        const interpreter = new Game_Interpreter();
        interpreter.setup(ce.list, 0);

        // 全コマンドを一気に処理
        while (interpreter.isRunning()) {
          interpreter.update();
        }
      }
    }

    // 通常の処理（この中で fadeIn が始まる）
    _Scene_Map_start.call(this);
  };
})();
