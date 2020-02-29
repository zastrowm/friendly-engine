"use strict";
exports.__esModule = true;
var ts = require("typescript");
var path = require("path");
function transformer(program) {
    return function (context) { return function (file) { return visitNodeAndChildren(file, program, context); }; };
}
module.exports = function (program) { return ({
    before: [transformer(program)]
}); };
function visitNodeAndChildren(node, program, context) {
    return ts.visitEachChild(visitNode(node, program), function (childNode) { return visitNodeAndChildren(childNode, program, context); }, context);
}
function visitNode(node, program) {
    var typeChecker = program.getTypeChecker();
    if (isKeysImportExpression(node)) {
        return;
    }
    if (!isKeysCallExpression(node, typeChecker)) {
        return node;
    }
    if (!node.typeArguments) {
        return ts.createArrayLiteral([]);
    }
    var type = typeChecker.getTypeFromTypeNode(node.typeArguments[0]);
    var properties = typeChecker.getPropertiesOfType(type);
    return ts.createArrayLiteral(properties.map(function (property) { return ts.createLiteral(property.name); }));
}
var indexJs = path.join(__dirname, 'index.js');
function isKeysImportExpression(node) {
    if (!ts.isImportDeclaration(node)) {
        return false;
    }
    var module = node.moduleSpecifier.text;
    try {
        return (indexJs ===
            (module.startsWith('.')
                ? require.resolve(path.resolve(path.dirname(node.getSourceFile().fileName), module))
                : require.resolve(module)));
    }
    catch (e) {
        return false;
    }
}
var indexTs = path.join(__dirname, 'index.d.ts');
function isKeysCallExpression(node, typeChecker) {
    if (!ts.isCallExpression(node)) {
        return false;
    }
    var signature = typeChecker.getResolvedSignature(node);
    if (typeof signature === 'undefined') {
        return false;
    }
    var declaration = signature.declaration;
    return (!!declaration &&
        !ts.isJSDocSignature(declaration) &&
        /*path.join(declaration.getSourceFile().fileName) === indexTs &&*/
        !!declaration.name &&
        declaration.name.getText() === 'keys');
}
