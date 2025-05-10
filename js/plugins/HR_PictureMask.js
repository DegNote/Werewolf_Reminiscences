/*:
 * @target MZ
 * @plugindesc ピクチャにマスクを設定します。
 * @author はら
 * @url https://note.com/haranta/n/n01e393a40f53
 *
 * @help
 * ピクチャにマスクを設定します。
 * 設定には【メイン画像】と【マスク範囲】の2つの画像が必要です。
 *
 * 【メイン画像】
 * 　マスク範囲に表示される方。
 * 　ピクチャの表示重ね順はこちらのピクチャIDが反映されます。
 *
 * 【マスク範囲】
 * 　マスクの範囲として使用される方。
 * 　画像の白い所にメイン画像が表示されます。
 * 　黒、透明部分は隠されます。
 * 　マスク範囲にしか影響しないので、ピクチャIDはいくつでも大丈夫です。
 * 　（他のピクチャより下層で隠れていたり、上層の方にあっても関係ない）
 *
 * ・使い方
 * 【メイン画像】【マスク範囲】ピクチャ表示後、
 * ウェイト1フレーム以上を入れてからプラグインコマンドを使用してください。
 * （ウェイトが無いと、他のピクチャが一瞬だけ消えることがあります）
 * 解除はプラグインコマンド「マスク解除」の他、
 * 通常のイベントコマンド「ピクチャの消去」を実行しても
 * マスク設定が一緒に消せます。
 * （どちらもメイン画像に対して処理）
 *
 * 更新履歴
 * 　2024/05/20 ver 1.1 ピクチャが一瞬消える現象についてヘルプに記載
 * 　2024/05/19 ver 1.0 作成
 *
 * 利用規約
 * 　禁止事項はありません。
 *
 *
 * @command SET_MASK
 * @text マスク設定
 * @desc マスクを設定します。ピクチャ表示後に実行してください。※直前にウェイトを1フレーム以上入れてください。
 *
 * @arg textureId
 * @text メインのピクチャID
 * @desc 【メイン画像】マスク範囲に表示されるピクチャIDです。
 * @default 1
 * @type number
 *
 * @arg maskId
 * @text マスクのピクチャID
 * @desc 【マスク範囲】マスク画像の白い所にテクスチャ画像が表示されます。黒、透明部分は隠されます。
 * @default 1
 * @type number
 *
 * @command CLEAR_MASK
 * @text マスク解除
 * @desc マスクを解除します。
 *
 * @arg textureId
 * @text テクスチャのピクチャID
 * @desc 【メイン画像】ピクチャIDを指定してください。（メイン画像を消去した場合、マスク解除は不要です）
 * @default 1
 * @type number
 *
 * @command CLEAR_ALL_MASK
 * @text マスク全解除
 * @desc すべてのマスクを解除します。
 */


(function() {
'use strict';


    // ----------------プラグインコマンド----------------

    const pluginName = "HR_PictureMask";

    PluginManager.registerCommand(pluginName, "SET_MASK", args => {
        $gameScreen.setMask(args.textureId, args.maskId);
    });

    PluginManager.registerCommand(pluginName, "CLEAR_MASK", args => {
        $gameScreen.clearMask(args.textureId);
    });

    PluginManager.registerCommand(pluginName, "CLEAR_ALL_MASK", args => {
        $gameScreen.clearAllMask();
    });


    // ----------------マスクの設定、解除----------------

    Game_Screen.prototype.setMask = function(texId, maskId) {
        const gamePic = this.picture(texId);
        if (!gamePic) return;
        gamePic._maskId = maskId;
        const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
        const texPic = sprPicArr[texId - 1];
        const maskPic = sprPicArr[maskId - 1];
        texPic.mask = maskPic;
    };

    Game_Screen.prototype.clearMask = function(texId) {
        const gamePic = this.picture(texId);
        if (!gamePic) return;
        gamePic._maskId = null;
        const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
        const texPic = sprPicArr[texId - 1];
        texPic.mask = null;
    };

    Game_Screen.prototype.clearAllMask = function() {
        this._pictures.forEach((gamePic, i) => {
            this.clearMask(i);
        });
    };

    const _Game_Screen_erasePicture = Game_Screen.prototype.erasePicture;
    Game_Screen.prototype.erasePicture = function(pictureId) {
        this.clearMask(pictureId);
        _Game_Screen_erasePicture.apply(this, arguments);
    };


    // ----------------状態の保存、復元----------------

    Game_Screen.prototype.savePictureMasks = function() {
        this._pictureMasks = this._pictures.map(pict => pict ? pict._maskId : null);
    };

    Game_Screen.prototype.restorePictureMasks = function() {
        if (this._pictureMasks) {
            const sprPicArr = SceneManager._scene._spriteset._pictureContainer.children;
            this._pictureMasks.forEach((maskInfo, i) => {
                if (maskInfo) {
                    sprPicArr[i - 1].mask = sprPicArr[maskInfo - 1];
                }
            });
        }
    };

    const _Scene_Map_stop = Scene_Map.prototype.stop;
    Scene_Map.prototype.stop = function() {
        $gameScreen.savePictureMasks();
        _Scene_Map_stop.apply(this, arguments);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.apply(this, arguments);
        $gameScreen.restorePictureMasks();
    };

})();