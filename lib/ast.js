(function() {
    var Token = (typeof require !== 'undefined' ? require('./parser') : window.LangExample).Token;

    /**
     * Abstract syntax tree builder.
     * @param {Parser} parser
     * @constructor
     */
    var AstBuilder = function(parser) {
        this._parser = parser;
    };

    /**
     * Main build method.
     * @return {AstElement}
     */
    AstBuilder.prototype.build = function() {
        return this.buildStatements();
    };

    /**
     * Builds statement list.
     * @return {AstElement}
     */
    AstBuilder.prototype.buildStatements = function() {
        var statements = [];
        while (!this.matches(Token.END_OF_FILE) && !this.matches(Token.OPERATOR, '}')) {
            statements.push(this.buildStatement());
        }
        if (statements.length == 1) {
            return statements[0];
        } else {
            return new AstElement(AstElement.CODE_BLOCK, { statements: statements });
        }
    };

    /**
     * Builds code block.
     * @return {AstElement}
     */
    AstBuilder.prototype.buildCodeBlock = function() {
        if (this.matches(Token.OPERATOR, '{')) {
            this.next();
            var statements = this.buildStatements();
            this.assert(Token.OPERATOR, '}');
            this.next();
            return statements;
        } else {
            return this.buildStatement();
        }
    };

    /**
     * Builds single statement.
     * @return {AstElement}
     */
    AstBuilder.prototype.buildStatement = function() {
        var content;
        if (this.matches(Token.KEYWORD)) {
            switch (this.value()) {
                case 'print':
                    this.next();
                    content = this.buildExpression();
                    this.assert(Token.OPERATOR, ';');
                    this.next();
                    return new AstElement(AstElement.PRINT, { expression: content });
                case 'if':
                    this.next();
                    this.assert(Token.OPERATOR, '(');
                    this.next();
                    content = { condition: this.buildExpression() };
                    this.assert(Token.OPERATOR, ')');
                    this.next();
                    content.positiveBlock = this.buildCodeBlock();
                    if (this.matches(Token.KEYWORD, 'else')) {
                        this.next();
                        content.negativeBlock = this.buildCodeBlock();
                    }
                    return new AstElement(AstElement.IF, content);
                case 'while':
                    this.next();
                    this.assert(Token.OPERATOR, '(');
                    this.next();
                    content = { condition: this.buildExpression() };
                    this.assert(Token.OPERATOR, ')');
                    this.next();
                    content.block = this.buildCodeBlock();
                    return new AstElement(AstElement.WHILE, content);
                default:
                    throw new Error('Invalid statement: unexpected "' + this.type() + '" (' + this.value() + ').');
            }
        } else {
            var expression = this.buildExpression();
            this.assert(Token.OPERATOR, ';');
            this.next();
            return expression;
        }
    };

    /**
     * Builds lowest priority expression.
     * @return {AstElement}
     */
    AstBuilder.prototype.buildExpression = function() {
        return this.buildAssignment();
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildAssignment = function() {
        if (this.matches(Token.IDENTIFIER)) {
            var content = {
                variable: this.value()
            };
            this.next();
            if (this.matches(Token.OPERATOR, '=')) {
                this.next();
                content.expression = this.buildAssignment();
                return new AstElement(AstElement.ASSIGNMENT, content);
            } else {
                this.rewind();
                return this.buildLogicalExpression();
            }
        } else {
            return this.buildLogicalExpression();
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildLogicalExpression = function() {
        var expr = this.buildComparison();
        if (this.matches(Token.OPERATOR)) {
            var op = this.value();
            switch (op) {
                case '&&':
                case '||':
                    this.next();
                    return new AstElement(AstElement.LOGICAL_EXPRESSION, {
                        type: op,
                        arg1: expr,
                        arg2: this.buildLogicalExpression()
                    });
                    break;
                default:
                    return expr;
            }
        } else {
            return expr;
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildComparison = function() {
        var expr = this.buildArithmeticExpression();
        if (this.matches(Token.OPERATOR)) {
            var op = this.value();
            switch (op) {
                case '==':
                case '!=':
                case '>':
                case '>=':
                case '<':
                case '<=':
                    this.next();
                    return new AstElement(AstElement.COMPARISON, {
                        type: op,
                        arg1: expr,
                        arg2: this.buildComparison()
                    });
                    break;
                default:
                    return expr;
            }
        } else {
            return expr;
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildArithmeticExpression = function() {
        var expr = this.buildTermExpression();
        if (this.matches(Token.OPERATOR)) {
            var op = this.value();
            switch (op) {
                case '+':
                case '-':
                    this.next();
                    return new AstElement(AstElement.ARITHMETIC_EXPRESSION, {
                        type: op,
                        arg1: expr,
                        arg2: this.buildArithmeticExpression()
                    });
                    break;
                default:
                    return expr;
            }
        } else {
            return expr;
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildTermExpression = function() {
        var expr = this.buildUnaryExpression();
        if (this.matches(Token.OPERATOR)) {
            var op = this.value();
            switch (op) {
                case '*':
                case '/':
                    this.next();
                    return new AstElement(AstElement.TERM_EXPRESSION, {
                        type: op,
                        arg1: expr,
                        arg2: this.buildTermExpression()
                    });
                    break;
                default:
                    return expr;
            }
        } else {
            return expr;
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildUnaryExpression = function() {
        if (this.matches(Token.OPERATOR)) {
            var op = this.value();
            if (op == '!' || op == '-') {
                this.next();
                return new AstElement(AstElement.UNARY_EXPRESSION, {
                    type: op,
                    arg: this.buildUnaryExpression()
                });
            } else {
                return this.buildFactor();
            }
        } else {
            return this.buildFactor();
        }
    };

    /**
     * @return {AstElement}
     */
    AstBuilder.prototype.buildFactor = function() {
        var res;
        if (this.matches(Token.IDENTIFIER)) {
            res = new AstElement(AstElement.VARIABLE, { name: this.value() });
            this.next();
            return res;
        } else if (this.matches(Token.NUMERIC)) {
            res = new AstElement(AstElement.NUMERIC, { value: +this.value() });
            this.next();
            return res;
        } else if (this.matches(Token.OPERATOR, '(')) {
            this.next();
            res = this.buildExpression();
            this.assert(Token.OPERATOR, ')');
            this.next();
            return res;
        } else {
            throw new Error('Invalid value, but found "' + this.type() + '" (' + this.value() + ').');
        }
    };

    AstBuilder.prototype.matches = function(type, val) {
        var token = this._parser.token;
        return token.type === type && (arguments.length > 1 ? val === token.value : true);
    };

    AstBuilder.prototype.assert = function(type, val) {
        if (!this.matches.apply(this, arguments)) {
            throw new Error(
                'Ast error: expected "' + type + '"' + (val ? ' (' + val + ')' : '')
                + ', but found "' + this.type() + '" (' + this.value() + ').'
            );
        }
    };

    AstBuilder.prototype.next = function() {
        this._parser.next();
    };

    AstBuilder.prototype.rewind = function() {
        this._parser.rewind();
    };

    AstBuilder.prototype.type = function() {
        return this._parser.token.type;
    };

    AstBuilder.prototype.value = function() {
        return this._parser.token.value;
    };

    /**
     * Abstract syntax tree element.
     * @param {String} type
     * @param {Object} content
     * @constructor
     */
    var AstElement = function(type, content) {
        this.type = type;
        this.content = content;
    };
    AstElement.CODE_BLOCK = 'code block';
    AstElement.IF = 'if';
    AstElement.ELSE = 'else';
    AstElement.WHILE = 'while';
    AstElement.PRINT = 'print';
    AstElement.ASSIGNMENT = 'assignment';
    AstElement.LOGICAL_EXPRESSION = 'logical expression';
    AstElement.COMPARISON = 'comparison';
    AstElement.ARITHMETIC_EXPRESSION = 'arithmetic expression';
    AstElement.TERM_EXPRESSION = 'term expression';
    AstElement.UNARY_EXPRESSION = 'unary expression';
    AstElement.VARIABLE = 'variable';
    AstElement.NUMERIC = 'numeric';

    var ns = typeof exports !== "undefined" ? exports : (window.LangExample = window.LangExample || {});
    ns.AstBuilder = AstBuilder;
    ns.AstElement = AstElement;
})();