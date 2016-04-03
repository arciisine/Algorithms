System.register("app/index", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function init() {
        angular
            .module("Algorithm", ['ngMaterial', 'ui.ace'])
            .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('altTheme')
                .primaryPalette('blue');
            $mdThemingProvider.setDefaultTheme('altTheme');
        })
            .controller("Test", function () {
        });
        document.onload = function () {
            angular.bootstrap(document.body, ['Algorithm']);
        };
    }
    exports_1("default", init);
    return {
        setters:[],
        execute: function() {
        }
    }
});
System.register("ast/index", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var AST;
    return {
        setters:[],
        execute: function() {
            class AST {
                static genSymbol() {
                    return "__gen" + parseInt(`${Math.random() * 1000}`) + (AST.id_++);
                }
                static visit(visitor, node, parent = null, key = null) {
                    node = visitor.process(node);
                    [
                        'body', 'declarations', 'argument', 'arguments', 'alternate', 'consequent',
                        'left', 'right', 'init', 'expression', 'callee', 'elements',
                        'handlers', 'handler', 'block', 'finalizer', 'test'
                    ]
                        .filter(function (p) { return !!node[p]; })
                        .forEach(function (p) {
                        let x = node[p];
                        if (Array.isArray(x)) {
                            x.forEach(function (y, i) {
                                AST.visit(visitor, y, x, i);
                            });
                        }
                        else {
                            AST.visit(visitor, x, node, p);
                        }
                    });
                    if (parent)
                        parent[key] = node;
                    return node;
                }
                static parse(fn) {
                    let ast = esprima.parse(fn).body[0];
                    console.log(ast);
                    return ast;
                }
                static extend(a, b) {
                    for (let k in b)
                        a[k] = b[k];
                    return a;
                }
                static toSource(node) {
                    let src = `(${escodegen.generate(node)})`;
                    console.debug(src);
                    return eval(src);
                }
                static visitor(conf) {
                    let out = {
                        process: function (node) {
                            if (node['visited']) {
                                return node;
                            }
                            else {
                                node['visited'] = true;
                                if (this[node['type']]) {
                                    let res = this[node['type']](node);
                                    return res || node;
                                }
                                else {
                                    return node;
                                }
                            }
                        }
                    };
                    return AST.extend(out, conf);
                }
                ;
            }
            AST.id_ = new Date().getTime() % 10000;
            exports_2("AST", AST);
        }
    }
});
System.register("analyzer/index", ["ast/index"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var index_1;
    var Analyzer;
    return {
        setters:[
            function (index_1_1) {
                index_1 = index_1_1;
            }],
        execute: function() {
            class Analyzer {
                static yieldVisitor() {
                    let nameSym = index_1.AST.genSymbol();
                    let stackSym = index_1.AST.genSymbol();
                    let name = null;
                    let stackAST = {
                        type: "Identifier",
                        name: stackSym
                    };
                    return index_1.AST.visitor({
                        FunctionDeclaration: function (node) {
                            if (name !== null || !node.id || !node.id.name)
                                return;
                            name = node.id.name;
                            node.generator = true;
                            node.params.unshift(stackAST);
                            node.id.name = nameSym;
                            let body = node.body.body;
                            body.unshift(index_1.AST.parse(Analyzer.templates.addToStack).body);
                            node.body = {
                                type: "BlockStatement",
                                body: [{
                                        type: "TryStatement",
                                        block: node.body,
                                        finalizer: index_1.AST.parse(Analyzer.templates.removeFromStack).body
                                    }]
                            };
                            return node;
                        },
                        CallExpression: function (node) {
                            let callee = node.callee;
                            if (callee.name === name) {
                                callee.name = nameSym;
                                node.arguments.unshift(stackAST);
                                return {
                                    type: "YieldExpression",
                                    delegate: true,
                                    argument: node
                                };
                            }
                        },
                        ReturnStatement: function (node) {
                            let id = { name: index_1.AST.genSymbol(), type: "Identifier" };
                            return {
                                type: "BlockStatement",
                                body: [
                                    {
                                        type: "VariableDeclaration",
                                        kind: "var",
                                        declarations: [{
                                                type: "VariableDeclarator",
                                                id: id,
                                                init: node.argument
                                            }],
                                    },
                                    {
                                        type: "ExpressionStatement",
                                        expression: {
                                            type: "YieldExpression",
                                            argument: {
                                                type: "ArrayExpression",
                                                elements: [stackAST, id]
                                            }
                                        }
                                    },
                                    index_1.AST.extend(index_1.AST.parse(Analyzer.templates.ifInner).body.body[0], {
                                        consequent: {
                                            type: "ReturnStatement",
                                            argument: id,
                                            visited: true
                                        },
                                        alternate: {
                                            type: "ReturnStatement",
                                            visited: true
                                        }
                                    })
                                ]
                            };
                        }
                    });
                }
                static invoker(fn) {
                    return function () {
                        let args = Array.prototype.slice.call(arguments, 0);
                        let stack = [];
                        args.unshift(stack); //Put stack on front
                        return fn.apply(this, args);
                    };
                }
                static rewrite(fn) {
                    let ast = index_1.AST.parse(fn);
                    ast = index_1.AST.visit(Analyzer.yieldVisitor(), ast);
                    console.log(ast);
                    let src = '(' + escodegen.generate(ast) + ')';
                    console.debug(src);
                    return Analyzer.invoker(eval(src));
                }
            }
            Analyzer.templates = {
                addToStack: function a() {
                    arguments[0].push(Array.prototype.slice.call(arguments, 1));
                },
                ifInner: function b() {
                    if (arguments[0].length > 1) {
                    }
                    else {
                    }
                },
                removeFromStack: function c() {
                    arguments[0].pop();
                }
            };
            exports_3("Analyzer", Analyzer);
        }
    }
});
System.register("data/index", ["analyzer/index"], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var index_2;
    var tree, arr;
    function sum(node) {
        var ret = 0;
        if (node) {
            ret = node.value + sum(node.left) + sum(node.right);
        }
        return ret;
    }
    function mergeSort(arr) {
        if (arr.length < 2)
            return arr;
        var middle = parseInt(`${arr.length / 2}`);
        var left = arr.slice(0, middle);
        var right = arr.slice(middle, arr.length);
        return merge(mergeSort(left), mergeSort(right));
    }
    function merge(left, right) {
        var result = [];
        while (left.length && right.length) {
            if (left[0] <= right[0]) {
                result.push(left.shift());
            }
            else {
                result.push(right.shift());
            }
        }
        while (left.length)
            result.push(left.shift());
        while (right.length)
            result.push(right.shift());
        return result;
    }
    return {
        setters:[
            function (index_2_1) {
                index_2 = index_2_1;
            }],
        execute: function() {
            tree = { value: 10, left: { value: 5 }, right: { value: 11 } };
            arr = [34, 203, 3, 746, 200, 984, 198, 764, 9];
            console.log("Starting up");
            window['$r'] = index_2.Analyzer.rewrite(sum);
        }
    }
});
System.register("index", ["app/index", "data/index"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    return {
        setters:[
            function (_1) {},
            function (_2) {}],
        execute: function() {
        }
    }
});
var UnaryOperator;
(function (UnaryOperator) {
    UnaryOperator[UnaryOperator["-"] = 0] = "-";
    UnaryOperator[UnaryOperator["+"] = 1] = "+";
    UnaryOperator[UnaryOperator["!"] = 2] = "!";
    UnaryOperator[UnaryOperator["~"] = 3] = "~";
    UnaryOperator[UnaryOperator["typeof"] = 4] = "typeof";
    UnaryOperator[UnaryOperator["void"] = 5] = "void";
    UnaryOperator[UnaryOperator["delete"] = 6] = "delete";
})(UnaryOperator || (UnaryOperator = {}));
var BinaryOperator;
(function (BinaryOperator) {
    BinaryOperator[BinaryOperator["=="] = 0] = "==";
    BinaryOperator[BinaryOperator["!="] = 1] = "!=";
    BinaryOperator[BinaryOperator["==="] = 2] = "===";
    BinaryOperator[BinaryOperator["!=="] = 3] = "!==";
    BinaryOperator[BinaryOperator["<"] = 4] = "<";
    BinaryOperator[BinaryOperator["<="] = 5] = "<=";
    BinaryOperator[BinaryOperator[">"] = 6] = ">";
    BinaryOperator[BinaryOperator[">="] = 7] = ">=";
    BinaryOperator[BinaryOperator["<<"] = 8] = "<<";
    BinaryOperator[BinaryOperator[">>"] = 9] = ">>";
    BinaryOperator[BinaryOperator[">>>"] = 10] = ">>>";
    BinaryOperator[BinaryOperator["+"] = 11] = "+";
    BinaryOperator[BinaryOperator["-"] = 12] = "-";
    BinaryOperator[BinaryOperator["*"] = 13] = "*";
    BinaryOperator[BinaryOperator["/"] = 14] = "/";
    BinaryOperator[BinaryOperator["%"] = 15] = "%";
    BinaryOperator[BinaryOperator[","] = 16] = ",";
    BinaryOperator[BinaryOperator["^"] = 17] = "^";
    BinaryOperator[BinaryOperator["&"] = 18] = "&";
    BinaryOperator[BinaryOperator["in"] = 19] = "in";
    BinaryOperator[BinaryOperator["instanceof"] = 20] = "instanceof";
    BinaryOperator[BinaryOperator[".."] = 21] = "..";
})(BinaryOperator || (BinaryOperator = {}));
var LogicalOperator;
(function (LogicalOperator) {
    LogicalOperator[LogicalOperator[",,"] = 0] = ",,";
    LogicalOperator[LogicalOperator["&&"] = 1] = "&&";
})(LogicalOperator || (LogicalOperator = {}));
var AssignmentOperator;
(function (AssignmentOperator) {
    AssignmentOperator[AssignmentOperator["="] = 0] = "=";
    AssignmentOperator[AssignmentOperator["+="] = 1] = "+=";
    AssignmentOperator[AssignmentOperator["-="] = 2] = "-=";
    AssignmentOperator[AssignmentOperator["*="] = 3] = "*=";
    AssignmentOperator[AssignmentOperator["/="] = 4] = "/=";
    AssignmentOperator[AssignmentOperator["%="] = 5] = "%=";
    AssignmentOperator[AssignmentOperator["<<="] = 6] = "<<=";
    AssignmentOperator[AssignmentOperator[">>="] = 7] = ">>=";
    AssignmentOperator[AssignmentOperator[">>>="] = 8] = ">>>=";
    AssignmentOperator[AssignmentOperator[",="] = 9] = ",=";
    AssignmentOperator[AssignmentOperator["^="] = 10] = "^=";
    AssignmentOperator[AssignmentOperator["&="] = 11] = "&=";
})(AssignmentOperator || (AssignmentOperator = {}));
var UpdateOperator;
(function (UpdateOperator) {
    UpdateOperator[UpdateOperator["++"] = 0] = "++";
    UpdateOperator[UpdateOperator["--"] = 1] = "--";
})(UpdateOperator || (UpdateOperator = {}));
