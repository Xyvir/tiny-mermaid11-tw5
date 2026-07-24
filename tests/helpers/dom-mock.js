'use strict';

function MockElement(tagName) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.style = {};
    this.innerHTML = '';
    this.innerText = '';
    this._listeners = {};
}

Object.defineProperty(MockElement.prototype, 'value', {
    get: function() {
        return this._value !== undefined ? this._value : this.innerHTML;
    },
    set: function(val) {
        this._value = String(val);
    },
    configurable: true,
    enumerable: true
});

MockElement.prototype.setAttribute = function(name, value) {
    this.attributes[name] = String(value);
};

MockElement.prototype.getAttribute = function(name) {
    return this.attributes[name] || null;
};

MockElement.prototype.addEventListener = function(event, handler) {
    if (!this._listeners[event]) {
        this._listeners[event] = [];
    }
    this._listeners[event].push(handler);
};

MockElement.prototype.removeEventListener = function(event, handler) {
    if (this._listeners[event]) {
        var idx = this._listeners[event].indexOf(handler);
        if (idx !== -1) {
            this._listeners[event].splice(idx, 1);
        }
    }
};

MockElement.prototype.insertBefore = function(newNode) {
    this.children.push(newNode);
};

function MockDocument() {}

MockDocument.prototype.createElement = function(tagName) {
    return new MockElement(tagName);
};

global.document = new MockDocument();

module.exports = {
    MockElement: MockElement,
    MockDocument: MockDocument
};
