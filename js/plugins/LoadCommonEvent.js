/*:
 * @target MZ
 * @plugindesc [TEST] ロード成功時にコモンイベント動かすだけ
 * @author ChatGPT
 *
 * @help
 * ロードがコモンイベント153を動かす
 */
(() => {
  const _Scene_Load_onLoadSuccess = Scene_Load.prototype.onLoadSuccess;
  Scene_Load.prototype.onLoadSuccess = function () {
    _Scene_Load_onLoadSuccess.call(this);
    // ←ここが実行されればプラグインは「確実に」動いている
    //window.alert("TEST プラグイン：ロード成功！");   // ★テスト用
    $gameTemp.reserveCommonEvent(153)
  };
})();