//=============================================================================
// RPG Maker MZ - 
//=============================================================================

/*

 *　必要なものを付けたしするスクリプト
 */

//ひとまずオプションは消しておく
Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,   'newGame');
    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
    //this.addCommand(TextManager.options,   'options');
};

    // 2. レイアウト調整
    Window_SavefileList.prototype.maxCols = function () {
        return 3;
    };
    
    Window_SavefileList.prototype.numVisibleRows = function () {
        return 2;
    };

