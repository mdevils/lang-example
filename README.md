Lang Example
============

Example implementation of simple arithmetic language which looks like a subset of JavaScript.

Description
-----------

```
Digit ::= '0' | '1' | '2' | ... | '9'
LowerAlpha ::= 'a' | 'b' | 'c' | ... | 'z'
UpperAlpha ::= 'A' | 'B' | 'C' | ... | 'Z'
Identifier ::= (LowerAlpha | UpperAlpha){LowerAlpha | UpperAlpha | Digit | '_'}

Numberic ::= Digit{Digit}
VariableName ::= Identifier

Expression ::= Assignment
Assignment ::= (Identifier '=' Expression | Logical)
LogicalOperator ::= '&&' | '||'
Logical ::= Comparison [ LogicalOperator Logical ]
ComparisonOperator ::= '==' | '!=' | '>' | '>=' | '<' | '<='
Comparison ::= Arithmetic [ ComparisonOperator Comparison ]
ArithmeticOperator ::= '+' | '-'
Arithmetic ::= Term [ ArithmeticOperator Arithmetic ]
TermOperator ::= '*' | '/'
Term ::= Unary [ TermOperator Term ]
UnaryOperator ::= '-' | '!'
Unary ::= UnaryOperator Unary | Factor
Factor ::= VariableName | Numberic | '(' Expression ')'

Statement ::= IfStatement | WhileStatement | PrintStatement | Expression ';'
CodeBlock ::= '{' {Statement} '}' | Statement
IfStatement ::= 'if' '(' Expression ')' CodeBlock [ 'else' CodeBlock ]
WhileStatement ::= 'while' '(' Expression ')' CodeBlock
PrintStatement ::= 'print' Expression ';'

Program ::= {Statement}
```


Examples
--------

###if###

```javascript
if (x > 5) {
    print x;
} else {
    print -x;
}
```

###while###

```javascript
while (x < 5) {
    x = x + 1;
}
```

###print###

```javascript
print x / 2;
```

###assignment###

```javascript
x = x - y;
```


###logical###

```javascript
x = y && z || w;
```


###comparison###

```javascript
x = y == z;
x = y != z;
x = y > z;
x = y >= z;
x = y < z;
x = y <= z;
```

###arithmetic###

```javascript
x = y + z;
x = y - z;
x = y * z;
x = y / z;
```

###unary###

```javascript
x = -y;
x = !y;
```
