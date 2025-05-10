//=============================================================================
// SimpleChoicePos.js
// ----------------------------------------------------------------------------
// v1.0  (2025/04/26)
// ■ 機能
//   ・次に表示する「選択肢ウィンドウ」の位置・サイズ・行数を
//     プラグインコマンドで一時的に上書きするだけの超小型プラグイン
//   ・BGM/SE など音関連の処理は一切行わない
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [1.0] Set choice window position / size / rows simply.
 * @author  (your name)
 *
 * @command setPos
 * @text Set Position
 * @desc Apply X,Y,Row,Width,Height to the next choice window (use -1 to keep default).
 *
 * @arg x
 * @type number
 * @text X
 * @default -1
 * @arg y
 * @type number
 * @text Y
 * @default -1
 * @arg row
 * @type number
 * @text Rows (0=auto)
 * @default 0
 * @arg width
 * @type number
 * @text Width (-1=auto)
 * @default -1
 * @arg height
 * @type number
 * @text Height (-1=auto)
 * @default -1
 *
 * @help
 * ▼ How to use
 * 1. Add this plugin and keep it BELOW official plugins that touch choices.
 * 2. Before [Show Choices], call the plugin command <Set Position>.
 *      - Any parameter left at -1 (or 0 for rows) means "use normal value".
 * 3. The setting is one-shot: it resets after the choice window opens.
 *
 * There is NO impact on audio, message flow, or other systems.
 */
(() => {
    'use strict';
    const PLUGIN_NAME = 'SimpleChoicePos';

    // ------------------------------------------------------------------------
    // Game_Message : ストレージ
    const _GM_clear = Game_Message.prototype.clear;
    Game_Message.prototype.clear = function() {
        _GM_clear.apply(this, arguments);
        this._scpParams = null;         // {x,y,row,w,h} or null
    };

    Game_Message.prototype.setScpParams = function(obj) {
        this._scpParams = obj;          // 1 回だけ有効
    };
    Game_Message.prototype.takeScpParams = function() {
        const tmp = this._scpParams;
        this._scpParams = null;         // 使ったら破棄
        return tmp;
    };

    // ------------------------------------------------------------------------
    // Plugin command
    PluginManager.registerCommand(PLUGIN_NAME, 'setPos', args => {
        const toNum = v => Number(v || 0);
        $gameMessage.setScpParams({
            x:  toNum(args.x),      // -1 = keep default
            y:  toNum(args.y),
            row:toNum(args.row),    // 0  = auto rows
            w:  toNum(args.width),
            h:  toNum(args.height)
        });
    });

    // ------------------------------------------------------------------------
    // Window_ChoiceList : 行数・位置・サイズ補正
    const _WCL_numRows = Window_ChoiceList.prototype.numVisibleRows;
    Window_ChoiceList.prototype.numVisibleRows = function() {
        const p = $gameMessage._scpParams;
        if (p && p.row > 0) {
            return Math.min(p.row, $gameMessage.choices().length);
        }
        return _WCL_numRows.apply(this, arguments);
    };

    const _WCL_updatePlace = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        _WCL_updatePlace.apply(this, arguments);

        const p = $gameMessage.takeScpParams();
        if (!p) return;

        // サイズ
        if (p.w > 0) this.width  = Math.min(Graphics.boxWidth,  p.w);
        if (p.h > 0) this.height = Math.min(Graphics.boxHeight, p.h);

        // 座標
        if (p.x >= 0) this.x = Math.min(Graphics.boxWidth  - this.width,  p.x);
        if (p.y >= 0) this.y = Math.min(Graphics.boxHeight - this.height, p.y);
    };
})();
