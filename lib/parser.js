(function() {
    /**
     * Parser himself.
     * @param {String} code
     * @constructor
     */
    var Parser = function(code) {
        this._code = code;
        this._codeLen = code.length;
        this._pos = 0;
        this._history = [];
        this.next();
    };

    /**
     * Moves parse position forward.
     */
    Parser.prototype.next = function() {
        this._history.push({ pos: this._pos, token: this.token });
        this.token = this._getNext();
    };

    /**
     * Moves parse position backwards.
     */
    Parser.prototype.rewind = function() {
        var historyItem = this._history.pop();
        this.token = historyItem.token;
        this._pos = historyItem.pos;
    };

    Parser.prototype._getNext = function() {
        this.skipWhitespace();
        if (this._pos >= this._codeLen) {
            return new Token(Token.END_OF_FILE, null);
        }
        var chr = this._code[this._pos], val = '';
        if (isIdentStart(chr)) {
            do {
                val += chr;
                chr = this._code[++this._pos];
            } while (isIdentPart(chr));
            return new Token(this.keywords.indexOf(val) >= 0 ? Token.KEYWORD : Token.IDENTIFIER, val);
        }
        if (isNumeric(chr)) {
            do {
                val += chr;
                chr = this._code[++this._pos];
            } while (isNumeric(chr));
            return new Token(Token.NUMERIC, val);
        }
        if (isOperator(chr)) {
            val = chr;
            chr = this._code[++this._pos];
            if (isOperatorPart(val, chr)) {
                val += chr;
                this._pos++;
            } else if (isOperatorComplex(val)) {
                this.error('unknown operator "' + val + '"');
            }
            return new Token(Token.OPERATOR, val);
        }
        return new Token(Token.UNKNOWN, chr);
    };

    Parser.prototype.skipWhitespace = function() {
        for (var l = this._codeLen; this._pos < l; this._pos++) {
            if (' \t\n\r'.indexOf(this._code[this._pos]) === -1) {
                break;
            }
        }
    };

    /**
     * Token: single code element.
     * @param {String} type
     * @param {String} value
     * @constructor
     */
    var Token = function(type, value) {
        this.type = type;
        this.value = value;
    };
    Token.UNKNOWN = 'unknown';
    Token.NUMERIC = 'numeric';
    Token.IDENTIFIER = 'identifier';
    Token.OPERATOR = 'operator';
    Token.KEYWORD = 'keyword';
    Token.END_OF_FILE = 'end of file';

    /**
     * @param {String} msg
     */
    Parser.prototype.error = function(msg) {
        throw new Error('Parse error: ' + msg + '.');
    };

    Parser.prototype.keywords = [
        'if', 'else', 'while', 'print'
    ];

    function isIdentStart(chr) {
        return (chr === '_') || (chr >= 'a' && chr <= 'z') || (chr >= 'A' && chr <= 'Z');
    }

    function isIdentPart(chr) {
        return isIdentStart(chr) || (chr >= '0' && chr <= '9');
    }

    function isNumeric(chr) {
        return '0123456789'.indexOf(chr) >= 0;
    }

    function isOperator(chr) {
        return '!()+-/*=&|{}<>;'.indexOf(chr) >= 0;
    }

    function isOperatorPart(op, chr) {
        switch (op) {
            case '=':
            case '>':
            case '<':
            case '!':
                return chr === '=';
            case '&':
                return chr === '&';
            case '|':
                return chr === '|';
            default:
                return false;
        }
    }

    function isOperatorComplex(op) {
        return '&|'.indexOf(op) >= 0;
    }

    var ns = typeof exports !== "undefined" ? exports : (window.LangExample = window.LangExample || {});
    ns.Parser = Parser;
    ns.Token = Token;
})();