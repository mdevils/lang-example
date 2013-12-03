var parser = require('./lib/parser'),
    Parser = parser.Parser,
    Token = parser.Token,
    AstBuilder = require('./lib/ast').AstBuilder,
    Interpreter = require('./lib/interpreter').Interpreter;

//-----------------------------------------------------------------------------

var factorialCode = '\
result = 1;\
i = 1;\
while (i < fact + 1) {\
    result = result * i;\
    i = i + 1;\
}\
print result;\
';

var factorialInterpreter = new Interpreter();
factorialInterpreter.setVar('fact', 5);

console.log('Factorial of ' + factorialInterpreter.getVar('fact') + ':');
factorialInterpreter.exec((new AstBuilder(new Parser(factorialCode))).build());

//-----------------------------------------------------------------------------

var loopCode = '\
while (i < len + 1) {\
    if (i > len/2) {\
        print len - i;\
    } else {\
        print i;\
    }\
    i = i + 1;\
}\
\
';

console.log('\nLoop example:');

var loopInterpreter = new Interpreter();
loopInterpreter.setVar('len', 20);
loopInterpreter.exec((new AstBuilder(new Parser(loopCode))).build());