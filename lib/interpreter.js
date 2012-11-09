(function() {
    var AstElement = (typeof require !== 'undefined' ? require('./ast') : window.LangExample).AstElement;

    /**
     * Ast code tree interpreter.
     * @constructor
     */
    var Interpreter = function() {
        this._vars = {};
    };

    /**
     * Executes AST-tree.
     * @param {AstElement} ast
     */
    Interpreter.prototype.exec = function(ast) {
        this.execStatement(ast);
    };

    /**
     * Executes single code statement.
     * @param {AstElement} ast
     */
    Interpreter.prototype.execStatement = function(ast) {
        var content = ast.content;
        switch (ast.type) {
            case AstElement.CODE_BLOCK:
                for (var i = 0, l = content.statements.length; i < l; i++) {
                    this.execStatement(content.statements[i]);
                }
                break;
            case AstElement.IF:
                if (this.execExpression(content.condition)) {
                    this.execStatement(content.positiveBlock);
                } else {
                    if (content.negativeBlock) {
                        this.execStatement(content.negativeBlock);
                    }
                }
                break;
            case AstElement.WHILE:
                while (this.execExpression(content.condition)) {
                    this.execStatement(content.block);
                }
                break;
            case AstElement.PRINT:
                console.log(this.execExpression(content.expression));
                break;
            default:
                this.execExpression(ast);
                break;
        }
    };

    /**
     * Executes expression, returns expression result.
     * @param {AstElement} ast
     * @return {Number}
     */
    Interpreter.prototype.execExpression = function(ast) {
        var content = ast.content;
        switch (ast.type) {
            case AstElement.ASSIGNMENT:
                this._vars[content.variable] = this.execExpression(content.expression);
                break;
            case AstElement.LOGICAL_EXPRESSION:
                switch (content.type) {
                    case '&&':
                        return fromBool(this.execExpression(content.arg1) && this.execExpression(content.arg2));
                    case '||':
                        return fromBool(this.execExpression(content.arg1) || this.execExpression(content.arg2));
                }
                break;
            case AstElement.COMPARISON:
                switch (content.type) {
                    case '==':
                        return fromBool(this.execExpression(content.arg1) === this.execExpression(content.arg2));
                    case '!=':
                        return fromBool(this.execExpression(content.arg1) !== this.execExpression(content.arg2));
                    case '>':
                        return fromBool(this.execExpression(content.arg1) > this.execExpression(content.arg2));
                    case '>=':
                        return fromBool(this.execExpression(content.arg1) >= this.execExpression(content.arg2));
                    case '<':
                        return fromBool(this.execExpression(content.arg1) < this.execExpression(content.arg2));
                    case '<=':
                        return fromBool(this.execExpression(content.arg1) <= this.execExpression(content.arg2));
                }
                break;
            case AstElement.ARITHMETIC_EXPRESSION:
                switch (content.type) {
                    case '+':
                        return this.execExpression(content.arg1) + this.execExpression(content.arg2);
                    case '-':
                        return this.execExpression(content.arg1) - this.execExpression(content.arg2);
                }
                break;
            case AstElement.TERM_EXPRESSION:
                switch (content.type) {
                    case '*':
                        return this.execExpression(content.arg1) * this.execExpression(content.arg2);
                    case '/':
                        return this.execExpression(content.arg1) / this.execExpression(content.arg2);
                }
                break;
            case AstElement.UNARY_EXPRESSION:
                switch (content.type) {
                    case '!':
                        return fromBool(!this.execExpression(content.arg));
                    case '-':
                        return -this.execExpression(content.arg);
                }
                break;
            case AstElement.VARIABLE:
                if (this._vars.hasOwnProperty(content.name)) {
                    return this._vars[content.name];
                }
                break;
            case AstElement.NUMERIC:
                return content.value;
        }
        return 0;
    };

    Interpreter.prototype.getVar = function(varName) {
        return this._vars[varName];
    };

    Interpreter.prototype.setVar = function(varName, value) {
        return this._vars[varName] = +value;
    };

    function fromBool(val) {
        return val ? 1 : 0;
    }

    var ns = typeof exports !== "undefined" ? exports : (window.LangExample = window.LangExample || {});
    ns.Interpreter = Interpreter;
})();
